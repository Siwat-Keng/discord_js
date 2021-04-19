const Stop = async (guild, mongodb) => {
  if (guild.me.voice.connection !== null)
    guild.me.voice.connection.disconnect();
  await mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_MUSIC_QUEUE)
    .deleteMany({ guild_id: guild.id });
};

export default Stop;
