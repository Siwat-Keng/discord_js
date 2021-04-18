const GuildHandler = async (guild, mongodb) => {
  mongodb
    .db(process.env.MONGODB_DB)
    .collection("prefix")
    .findOne({ guild_id: guild.id })
    .then((res) => {
      if (res) return;
      else
        mongodb.db(process.env.MONGODB_DB).collection("prefix").insertOne({
          prefix: process.env.DEFAULT_PREFIX,
          guild_id: guild.id,
        });
    });
};

export default GuildHandler;
