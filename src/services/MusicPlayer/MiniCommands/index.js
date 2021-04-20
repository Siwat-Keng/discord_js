const Skip = (guild) => {
  if (guild.me.voice.connection !== null)
    guild.me.voice.connection.dispatcher.end();
};

const Stop = (guild, mongodb) => {
  if (guild.me.voice.connection !== null)
    guild.me.voice.connection.disconnect();
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

module.exports = { Skip, Stop, Sound };
