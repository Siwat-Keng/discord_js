import ytdl from "ytdl-core";
import yts from "yt-search";

import musicData from "../../../locales/musicData.json";

const saveAutoPlay = async (music, guildID, mongodb) => {
  var currentSongList = await mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_MUSIC_AUTOPLAY)
    .findOne({ guild_id: guildID });
  if (currentSongList !== null) {
    if (currentSongList.songList.indexOf(music) == -1) {
      currentSongList.songList.push(music);
      await mongodb
        .db(process.env.MONGODB_DB)
        .collection(process.env.DB_MUSIC_AUTOPLAY)
        .updateOne(
          { guild_id: guildID },
          { $set: { guild_id: guildID, songList: currentSongList.songList } }
        );
    }
  } else {
    await mongodb
      .db(process.env.MONGODB_DB)
      .collection(process.env.DB_MUSIC_AUTOPLAY)
      .insertOne({
        guild_id: guildID,
        songList: [music],
      });
  }
};

const removeAutoPlay = async (music, guildID, mongodb) => {
  var currentSongList = await mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_MUSIC_AUTOPLAY)
    .findOne({ guild_id: guildID });
  if (currentSongList !== null) currentSongList = currentSongList.songList;
  else currentSongList = [];
  currentSongList = currentSongList.filter((item) => {
    return item !== music;
  });
  await mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_MUSIC_AUTOPLAY)
    .updateOne(
      { guild_id: guildID },
      { $set: { guild_id: guildID, songList: currentSongList } }
    );
};

const play = async (guild, song, mongodb) => {
  const serverQueue = (
    await mongodb
      .db(process.env.MONGODB_DB)
      .collection(process.env.DB_MUSIC_QUEUE)
      .findOne({ guild_id: guild.id })
  ).serverQueue;

  const textChannel = await guild.me.client.channels.fetch(
    serverQueue.textChannelID
  );

  if (!song && !serverQueue.autoPlay) {
    await mongodb
      .db(process.env.MONGODB_DB)
      .collection(process.env.DB_MUSIC_QUEUE)
      .deleteMany({ guild_id: guild.id });
    return;
  } else if (!song) {
    const autoPlaySongList = (
      await mongodb
        .db(process.env.MONGODB_DB)
        .collection(process.env.DB_MUSIC_AUTOPLAY)
        .findOne({ guild_id: guild.id })
    ).songList;
    song = autoPlaySongList[0];
    serverQueue.songs = autoPlaySongList;
    await mongodb
      .db(process.env.MONGODB_DB)
      .collection(process.env.DB_MUSIC_QUEUE)
      .updateOne(
        { guild_id: guild.id },
        { $set: { guild_id: guild.id, serverQueue: serverQueue } }
      );
  }
  const dispatcher = guild.me.voice.connection
    .play(ytdl(song.url))
    .on("finish", async () => {
      const newServerQueue = (
        await mongodb
          .db(process.env.MONGODB_DB)
          .collection(process.env.DB_MUSIC_QUEUE)
          .findOne({ guild_id: guild.id })
      ).serverQueue;
      newServerQueue.songs.shift();
      await mongodb
        .db(process.env.MONGODB_DB)
        .collection(process.env.DB_MUSIC_QUEUE)
        .updateOne(
          { guild_id: guild.id },
          { $set: { guild_id: guild.id, serverQueue: newServerQueue } }
        );
      await play(guild, newServerQueue.songs[0], mongodb);
    });
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  const message = await textChannel.send(`Start playing: **${song.title}**`);
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
          saveAutoPlay(song, textChannel.guild.id, mongodb);
        else if (collected.first().emoji.name == musicData.reaction.dislike)
          removeAutoPlay(song, textChannel.guild.id, mongodb);
    });
};

const SearchPlay = async (searchString, textChannel, voiceChannel, mongodb) => {
  const serverQueue = await mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_MUSIC_QUEUE)
    .findOne({ guild_id: textChannel.guild.id });

  var song;
  if (ytdl.validateURL(searchString)) {
    const songInfo = await ytdl.getInfo(searchString);
    song = {
      title: songInfo.title,
      url: songInfo.video_url,
    };
  } else {
    const { videos } = await yts(searchString);
    if (!videos.length) return textChannel.send(musicData.message.notFound);
    song = {
      title: videos[0].title,
      url: videos[0].url,
    };
  }

  if (!serverQueue) {
    const queueContruct = {
      textChannelID: textChannel.id,
      voiceChannelID: voiceChannel.id,
      songs: [],
      volume: 5,
      playing: true,
      autoPlay: false,
    };

    queueContruct.songs.push(song);

    await mongodb
      .db(process.env.MONGODB_DB)
      .collection(process.env.DB_MUSIC_QUEUE)
      .insertOne({
        guild_id: textChannel.guild.id,
        serverQueue: queueContruct,
      });

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(textChannel.guild, queueContruct.songs[0], mongodb);
    } catch {
      await mongodb
        .db(process.env.MONGODB_DB)
        .collection(process.env.DB_MUSIC_QUEUE)
        .deleteMany({ guild_id: textChannel.guild.id });
    }
  } else {
    serverQueue.serverQueue.songs.push(song);
    await mongodb
      .db(process.env.MONGODB_DB)
      .collection(process.env.DB_MUSIC_QUEUE)
      .updateOne(
        { guild_id: textChannel.guild.id },
        {
          $set: {
            guild_id: textChannel.guild.id,
            serverQueue: serverQueue.serverQueue,
          },
        }
      );
    await textChannel.send(`Added ${song.title} to queue.`);
  }
};

module.exports = { SearchPlay, play };
