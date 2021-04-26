import { play } from "../searchPlay";

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

const autoPlay = (message, voiceChannel, mongodb) => {
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
    if (currentQueue && !currentQueue.serverQueue.autoPlay) {
      currentQueue.serverQueue.autoPlay = true;
      mongodb
        .db(process.env.MONGODB_DB)
        .collection(process.env.DB_MUSIC_QUEUE)
        .updateOne(
          { guild_id: message.guild.id },
          {
            $set: {
              serverQueue: currentQueue.serverQueue,
            },
          }
        );
    } else if (!currentQueue) {
      currentQueue = {
        textChannelID: message.channel.id,
        voiceChannelID: voiceChannel.id,
        songs: [
          autoPlaySongList.songList[
            Math.floor(Math.random() * autoPlaySongList.songList.length)
          ],
        ],
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
            play(message.guild, autoPlaySongList.songList[0], mongodb);
          });
        });
    }
  });
};

module.exports = { hasAutoPlayList, autoPlay };
