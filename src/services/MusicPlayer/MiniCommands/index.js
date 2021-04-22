import { play } from "../SearchPlay";

const Skip = (guild, mongodb) => {
  if (
    guild.me.voice.connection &&
    guild.me.voice.connection.dispatcher &&
    !guild.me.voice.connection.dispatcher.paused
  )
    guild.me.voice.connection.dispatcher.end();
  else if (guild.me.voice.connection && guild.me.voice.connection.dispatcher) {
    guild.me.voice.connection.dispatcher.resume();
    guild.me.voice.connection.dispatcher.end();
    guild.me.voice.connection.dispatcher.pause();
  }

  mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_MUSIC_QUEUE)
    .findOne({ guild_id: guild.id })
    .then((response) => {
      if (response.serverQueue && !response.serverQueue.playing) {
        response.serverQueue.songs.shift();
        mongodb
          .db(process.env.MONGODB_DB)
          .collection(process.env.DB_MUSIC_QUEUE)
          .updateOne(
            { guild_id: guild.id },
            { $set: { serverQueue: response.serverQueue } }
          );
      }
    });
};

const Stop = (guild, mongodb) => {
  if (guild.me.voice.connection) guild.me.voice.connection.disconnect();
  mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_MUSIC_QUEUE)
    .deleteMany({ guild_id: guild.id });
};

const Sound = (volume, guild, mongodb) => {
  let soundVolume = Number(volume);
  if (volume > 100) soundVolume = 100;
  else if (volume < 0) soundVolume = 0;
  if (guild.me.voice.connection !== null) {
    guild.me.voice.connection.dispatcher.setVolumeLogarithmic(soundVolume / 50);
    mongodb
      .db(process.env.MONGODB_DB)
      .collection(process.env.DB_CONFIG)
      .updateOne({ guild_id: guild.id }, { $set: { volume: soundVolume } });
  }
};

const Pause = (guild, mongodb) => {
  if (guild.me.voice.connection.dispatcher)
    guild.me.voice.connection.dispatcher.pause();
  mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_MUSIC_QUEUE)
    .findOne({ guild_id: guild.id })
    .then((response) => {
      if (response) {
        response.serverQueue.playing = false;
        mongodb
          .db(process.env.MONGODB_DB)
          .collection(process.env.DB_MUSIC_QUEUE)
          .updateOne(
            { guild_id: guild.id },
            {
              $set: {
                serverQueue: response.serverQueue,
              },
            }
          );
      }
    });
};

const Resume = (voiceChannel, mongodb) => {
  mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_MUSIC_QUEUE)
    .findOne({ guild_id: voiceChannel.guild.id })
    .then((response) => {
      if (response) {
        response.serverQueue.playing = true;
        mongodb
          .db(process.env.MONGODB_DB)
          .collection(process.env.DB_MUSIC_QUEUE)
          .updateOne(
            { guild_id: voiceChannel.guild.id },
            {
              $set: {
                serverQueue: response.serverQueue,
              },
            }
          )
          .then(() => {
            if (
              !voiceChannel.guild.me.voice.connection ||
              !voiceChannel.guild.me.voice.connection.dispatcher
            )
              voiceChannel.join().then(() => {
                play(
                  voiceChannel.guild,
                  response.serverQueue.songs[0],
                  mongodb
                );
              });
            else voiceChannel.guild.me.voice.connection.dispatcher.resume();
          });
      }
    });
};

module.exports = { Skip, Stop, Sound, Pause, Resume };
