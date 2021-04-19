import { play } from "../SearchPlay";

const hasAutoPlayList = async (guild, mongodb) => {
  let autoPlayList = await mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_MUSIC_AUTOPLAY)
    .findOne({ guild_id: guild.id });
  if (autoPlayList == null) return false;
  return true;
};

const AutoPlay = async (message, voiceChannel, mongodb) => {
  var currentQueue = await mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_MUSIC_QUEUE)
    .findOne({ guild_id: message.guild.id });
  const autoPlaySongList = (
    await mongodb
      .db(process.env.MONGODB_DB)
      .collection(process.env.DB_MUSIC_AUTOPLAY)
      .findOne({ guild_id: message.guild.id })
  ).songList;
  if (currentQueue !== null) {
    currentQueue = currentQueue.serverQueue
    currentQueue.autoPlay = true;
    await mongodb
      .db(process.env.MONGODB_DB)
      .collection(process.env.DB_MUSIC_QUEUE)
      .updateOne(
        { guild_id: message.guild.id },
        { $set: { guild_id: message.guild.id, serverQueue: currentQueue } }
      );
  } else {
    currentQueue = {
      textChannelID: message.channel.id,
      voiceChannelID: voiceChannel.id,
      songs: autoPlaySongList,
      volume: 5,
      playing: true,
      autoPlay: true,
    };
    await mongodb
      .db(process.env.MONGODB_DB)
      .collection(process.env.DB_MUSIC_QUEUE)
      .insertOne({
        guild_id: voiceChannel.guild.id,
        serverQueue: currentQueue,
      });
    await voiceChannel.join();
    await play(message.guild, autoPlaySongList[0], mongodb);
  }
};

module.exports = { hasAutoPlayList, AutoPlay };
