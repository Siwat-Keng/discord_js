const adminCommandsHandler = (channel, input, guild, mongodb) => {
  try {
    let command = input[0];
    if (command == "setprefix") {
      return mongodb
        .db(process.env.MONGODB_DB)
        .collection(process.env.DB_GUILD_DATA)
        .updateOne({ guild_id: guild.id }, { $set: { prefix: input[1] } })
        .then(() => {
          return true;
        });
    } else if (command == "setcovid") {
      return mongodb
        .db(process.env.MONGODB_DB)
        .collection(process.env.DB_GUILD_DATA)
        .updateOne(
          { guild_id: guild.id },
          { $set: { covid_channel: channel.id } },
          { upsert: true }
        )
        .then(() => {
          return true;
        });
    }
  } catch {
    return false;
  }
};

export default adminCommandsHandler;
