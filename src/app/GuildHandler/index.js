const guildHandler = (guild, mongodb) => {
  mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_GUILD_DATA)
    .findOne({ guild_id: guild.id })
    .then((res) => {
      if (res) return;
      else
        mongodb
          .db(process.env.MONGODB_DB)
          .collection(process.env.DB_GUILD_DATA)
          .insertOne({
            prefix: process.env.DEFAULT_PREFIX,
            guild_id: guild.id,
          });
    });
};

export default guildHandler;
