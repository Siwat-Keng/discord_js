import ytdl from "ytdl-core";
import yts from "yt-search";

import musicData from "../../../locales/musicData.json";

const saveAutoPlay = (music, guildID, mongodb) => {
  mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_MUSIC_AUTOPLAY)
    .findOne({ guild_id: guildID })
    .then((currentSongList) => {
      if (currentSongList !== null) {
        if (currentSongList.songList.indexOf(music) == -1) {
          currentSongList.songList.push(music);
          mongodb
            .db(process.env.MONGODB_DB)
            .collection(process.env.DB_MUSIC_AUTOPLAY)
            .updateOne(
              { guild_id: guildID },
              {
                $set: { songList: currentSongList.songList },
              }
            );
        }
      } else {
        mongodb
          .db(process.env.MONGODB_DB)
          .collection(process.env.DB_MUSIC_AUTOPLAY)
          .insertOne({
            guild_id: guildID,
            songList: [music],
          });
      }
    });
};

const removeAutoPlay = (music, guildID, mongodb) => {
  mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_MUSIC_AUTOPLAY)
    .findOne({ guild_id: guildID })
    .then((currentSongList) => {
      if (currentSongList !== null) currentSongList = currentSongList.songList;
      else currentSongList = [];
      currentSongList = currentSongList.filter((item) => {
        return item !== music;
      });
      mongodb
        .db(process.env.MONGODB_DB)
        .collection(process.env.DB_MUSIC_AUTOPLAY)
        .updateOne(
          { guild_id: guildID },
          { $set: { songList: currentSongList } }
        );
    });
};

const playing = (serverQueue, guild, mongodb) => {
  if (!serverQueue.playing) return;
  const dispatcher = guild.me.voice.connection
    .play(ytdl(serverQueue.songs[0].url))
    .on("finish", () => {
      mongodb
        .db(process.env.MONGODB_DB)
        .collection(process.env.DB_MUSIC_QUEUE)
        .findOne({ guild_id: guild.id })
        .then((newServerQueue) => {
          newServerQueue.serverQueue.songs.shift();
          mongodb
            .db(process.env.MONGODB_DB)
            .collection(process.env.DB_MUSIC_QUEUE)
            .updateOne(
              { guild_id: guild.id },
              {
                $set: {
                  serverQueue: newServerQueue.serverQueue,
                },
              }
            )
            .then(() => {
              play(guild, newServerQueue.serverQueue.songs[0], mongodb);
            });
        });
    });

  mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_CONFIG)
    .findOne({ guild_id: guild.id })
    .then((data) => {
      if (data.volume)
        dispatcher.setVolumeLogarithmic(Number(data.volume) / 50);
      else
        dispatcher.setVolumeLogarithmic(Number(process.env.DEFAULT_SOUND) / 50);
    });

  guild.me.client.channels
    .fetch(serverQueue.textChannelID)
    .then((textChannel) => {
      textChannel
        .send(`Start playing: **${serverQueue.songs[0].title}**`)
        .then((message) => {
          message.react(musicData.reaction.like).then((r) => {
            message.react(musicData.reaction.dislike);
          });
          message
            .awaitReactions(
              (reaction, user) =>
                (reaction.emoji.name == musicData.reaction.like ||
                  reaction.emoji.name == musicData.reaction.dislike) &&
                !user.bot,
              { max: 1, time: 600000 }
            )
            .then((collected) => {
              if (collected.first())
                if (collected.first().emoji.name == musicData.reaction.like)
                  saveAutoPlay(
                    serverQueue.songs[0],
                    textChannel.guild.id,
                    mongodb
                  );
                else if (
                  collected.first().emoji.name == musicData.reaction.dislike
                )
                  removeAutoPlay(
                    serverQueue.songs[0],
                    textChannel.guild.id,
                    mongodb
                  );
            });
        });
    });
};

const play = (guild, song, mongodb) => {
  mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_MUSIC_QUEUE)
    .findOne({ guild_id: guild.id })
    .then((serverQueue) => {
      if (!song && !serverQueue.serverQueue.autoPlay) {
        mongodb
          .db(process.env.MONGODB_DB)
          .collection(process.env.DB_MUSIC_QUEUE)
          .deleteMany({ guild_id: guild.id });
        return;
      } else if (!song) {
        mongodb
          .db(process.env.MONGODB_DB)
          .collection(process.env.DB_MUSIC_AUTOPLAY)
          .findOne({ guild_id: guild.id })
          .then((autoPlaySongList) => {
            song = autoPlaySongList.songList[0];
            serverQueue.serverQueue.songs = autoPlaySongList.songList;
            mongodb
              .db(process.env.MONGODB_DB)
              .collection(process.env.DB_MUSIC_QUEUE)
              .updateOne(
                { guild_id: guild.id },
                {
                  $set: {
                    serverQueue: serverQueue.serverQueue,
                  },
                }
              )
              .then(() => {
                playing(serverQueue.serverQueue, guild, mongodb);
              });
          });
      } else playing(serverQueue.serverQueue, guild, mongodb);
    });
};

const preparePlay = (song, serverQueue, textChannel, voiceChannel, mongodb) => {
  if (!serverQueue) {
    const queueContruct = {
      textChannelID: textChannel.id,
      voiceChannelID: voiceChannel.id,
      songs: [],
      playing: true,
      autoPlay: false,
    };

    queueContruct.songs.push(song);

    mongodb
      .db(process.env.MONGODB_DB)
      .collection(process.env.DB_MUSIC_QUEUE)
      .insertOne({
        guild_id: textChannel.guild.id,
        serverQueue: queueContruct,
      })
      .then(() => {
        try {
          voiceChannel.join().then((connection) => {
            queueContruct.connection = connection;
            play(textChannel.guild, queueContruct.songs[0], mongodb);
          });
        } catch {
          mongodb
            .db(process.env.MONGODB_DB)
            .collection(process.env.DB_MUSIC_QUEUE)
            .deleteMany({ guild_id: textChannel.guild.id });
        }
      });
  } else {
    serverQueue.serverQueue.songs.push(song);
    mongodb
      .db(process.env.MONGODB_DB)
      .collection(process.env.DB_MUSIC_QUEUE)
      .updateOne(
        { guild_id: textChannel.guild.id },
        {
          $set: {
            serverQueue: serverQueue.serverQueue,
          },
        }
      )
      .then(() => {
        textChannel.send(`Added **${song.title}** to queue.`);
      });
  }
};

const SearchPlay = (searchString, textChannel, voiceChannel, mongodb) => {
  mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_MUSIC_QUEUE)
    .findOne({ guild_id: textChannel.guild.id })
    .then((serverQueue) => {
      var song;
      if (ytdl.validateURL(searchString)) {
        ytdl.getInfo(searchString).then((res) => {
          song = {
            title: res.videoDetails.title,
            url: res.videoDetails.video_url,
          };
          preparePlay(song, serverQueue, textChannel, voiceChannel, mongodb);
        });
      } else {
        yts(searchString).then((res) => {
          let selectEmbed = {
            title: "Please select a track with reaction 1-5",
            description: "",
          };
          const videoList = res.videos.slice(0, 5);
          videoList.map((item, idx) => {
            selectEmbed.description += `**${idx + 1}. ${item.title}**\nFrom ${
              item.author.name
            } ( ${item.timestamp} )\n\n`;
          });
          textChannel.send({ embed: selectEmbed }).then((msg) => {
            msg
              .awaitReactions(
                (reaction, user) =>
                  (reaction.emoji.name == musicData.reaction.one ||
                    reaction.emoji.name == musicData.reaction.two ||
                    reaction.emoji.name == musicData.reaction.three ||
                    reaction.emoji.name == musicData.reaction.four ||
                    reaction.emoji.name == musicData.reaction.five) &&
                  !user.bot,
                { max: 1, time: 60000 }
              )
              .then((collected) => {
                if (collected.first()) {
                  if (collected.first().emoji.name == musicData.reaction.one)
                    song = { title: videoList[0].title, url: videoList[0].url };
                  else if (
                    collected.first().emoji.name == musicData.reaction.two
                  )
                    song = { title: videoList[1].title, url: videoList[1].url };
                  else if (
                    collected.first().emoji.name == musicData.reaction.three
                  )
                    song = { title: videoList[2].title, url: videoList[2].url };
                  else if (
                    collected.first().emoji.name == musicData.reaction.four
                  )
                    song = { title: videoList[3].title, url: videoList[3].url };
                  else if (
                    collected.first().emoji.name == musicData.reaction.five
                  )
                    song = { title: videoList[4].title, url: videoList[4].url };
                  if (song)
                    preparePlay(
                      song,
                      serverQueue,
                      textChannel,
                      voiceChannel,
                      mongodb
                    );
                }
              });
            msg.react(musicData.reaction.one).then(() => {
              msg.react(musicData.reaction.two).then(() => {
                msg.react(musicData.reaction.three).then(() => {
                  msg.react(musicData.reaction.four).then(() => {
                    msg.react(musicData.reaction.five);
                  });
                });
              });
            });
          });
        });
      }
    });
};

module.exports = { SearchPlay, play };
