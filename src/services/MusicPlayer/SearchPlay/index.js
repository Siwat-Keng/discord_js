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
      if (currentSongList)
        currentSongList = currentSongList.songList.filter((item) => {
          item != music;
        });
      else currentSongList = [];
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
  if (!serverQueue.playing || !serverQueue.songs) return;
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
        .send(`Start playing: **${serverQueue.songs[0].title}**`, {
          embed: serverQueue.songs[0],
        })
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
      if (!song && !serverQueue.serverQueue.songs && !serverQueue.serverQueue.autoPlay) {
        console.log(serverQueue.serverQueue)
        mongodb
          .db(process.env.MONGODB_DB)
          .collection(process.env.DB_MUSIC_QUEUE)
          .deleteMany({ guild_id: guild.id })
      } else if (!song) {
        mongodb
          .db(process.env.MONGODB_DB)
          .collection(process.env.DB_MUSIC_AUTOPLAY)
          .findOne({ guild_id: guild.id })
          .then((autoPlaySongList) => {
            if (!autoPlaySongList || !autoPlaySongList.songList.length)
              mongodb
                .db(process.env.MONGODB_DB)
                .collection(process.env.DB_MUSIC_QUEUE)
                .deleteMany({ guild_id: guild.id });
            else {
              serverQueue.serverQueue.songs = [
                autoPlaySongList.songList[
                  Math.floor(Math.random() * autoPlaySongList.songList.length)
                ],
              ];
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
            }
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
        textChannel.send(`Added **${song.title}** to queue.`, { embed: song });
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
            description: `By **${res.videoDetails.author.name}**`,
            footer: {
              text: `Views : ${res.videoDetails.viewCount}`,
            },
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
                msg.delete();
                if (collected.first()) {
                  if (collected.first().emoji.name == musicData.reaction.one)
                    song = {
                      title: videoList[0].title,
                      url: videoList[0].url,
                      description: `By **${videoList[0].author.name}**`,
                      footer: {
                        text: `Duration : ${videoList[0].timestamp} | Age : ${videoList[0].ago} | Views : ${videoList[0].views}`,
                      },
                      image: { url: `${videoList[0].image}` },
                    };
                  else if (
                    collected.first().emoji.name == musicData.reaction.two
                  )
                    song = {
                      title: videoList[1].title,
                      url: videoList[1].url,
                      description: `By **${videoList[1].author.name}**`,
                      footer: {
                        text: `Duration : ${videoList[1].timestamp} | Age : ${videoList[1].ago} | Views : ${videoList[1].views}`,
                      },
                      image: { url: `${videoList[1].image}` },
                    };
                  else if (
                    collected.first().emoji.name == musicData.reaction.three
                  )
                    song = {
                      title: videoList[2].title,
                      url: videoList[2].url,
                      description: `By **${videoList[2].author.name}**`,
                      footer: {
                        text: `Duration : ${videoList[2].timestamp} | Age : ${videoList[2].ago} | Views : ${videoList[2].views}`,
                      },
                      image: { url: `${videoList[2].image}` },
                    };
                  else if (
                    collected.first().emoji.name == musicData.reaction.four
                  )
                    song = {
                      title: videoList[3].title,
                      url: videoList[3].url,
                      description: `By **${videoList[3].author.name}**`,
                      footer: {
                        text: `Duration : ${videoList[3].timestamp} | Age : ${videoList[3].ago} | Views : ${videoList[3].views}`,
                      },
                      image: { url: `${videoList[3].image}` },
                    };
                  else if (
                    collected.first().emoji.name == musicData.reaction.five
                  )
                    song = {
                      title: videoList[4].title,
                      url: videoList[4].url,
                      description: `By **${videoList[4].author.name}**`,
                      footer: {
                        text: `Duration : ${videoList[4].timestamp} | Age : ${videoList[4].ago} | Views : ${videoList[4].views}`,
                      },
                      image: { url: `${videoList[4].image}` },
                    };
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
