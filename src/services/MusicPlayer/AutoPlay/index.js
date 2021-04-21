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

const shuffle = (musicList) => {
  var currentIndex = musicList.length,
    temporaryValue,
    randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = musicList[currentIndex];
    musicList[currentIndex] = musicList[randomIndex];
    musicList[randomIndex] = temporaryValue;
  }
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
    shuffle(autoPlaySongList.songList);
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
        songs: autoPlaySongList.songList,
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
            play(message.guild, autoPlaySongList.songList[0], mongodb);
          });
        });
    }
  });
};

module.exports = { hasAutoPlayList, AutoPlay };
