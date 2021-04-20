import { play } from "../SearchPlay";

const hasAutoPlayList = (guild, mongodb) => {
  return mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_MUSIC_AUTOPLAY)
    .findOne({ guild_id: guild.id })
    .then((autoPlayList) => {
      if (autoPlayList == null) return false;
      return true;
    });
};

const AutoPlay = (message, voiceChannel, mongodb) => {
  Promise.all([
    mongodb
      .db(process.env.MONGODB_DB)
      .collection(process.env.DB_MUSIC_QUEUE)
      .findOne({ guild_id: message.guild.id }),
    mongodb
      .db(process.env.MONGODB_DB)
      .collection(process.env.DB_MUSIC_AUTOPLAY)
      .findOne({ guild_id: message.guild.id }),
  ]).then(([currentQueue, autoPlaySongList]) => {
    if (currentQueue) {
      currentQueue = currentQueue.serverQueue;
      currentQueue.serverQueue.autoPlay = true;
      mongodb
        .db(process.env.MONGODB_DB)
        .collection(process.env.DB_MUSIC_QUEUE)
        .updateOne(
          { guild_id: message.guild.id },
          {
            $set: {
              guild_id: message.guild.id,
              serverQueue: currentQueue.serverQueue,
            },
          }
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
      mongodb
        .db(process.env.MONGODB_DB)
        .collection(process.env.DB_MUSIC_QUEUE)
        .insertOne({
          guild_id: voiceChannel.guild.id,
          serverQueue: currentQueue,
        })
        .then(() => {
          voiceChannel.join().then(() => {
            play(message.guild, autoPlaySongList[0], mongodb);
          });
        });
    }
  });
};

module.exports = { hasAutoPlayList, AutoPlay };
