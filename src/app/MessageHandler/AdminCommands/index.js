const AdminCommandsHandler = (input, guild, mongodb) => {
  try {
    let command = input[0];
    if (command == "setprefix") {
      return mongodb
        .db(process.env.MONGODB_DB)
        .collection(process.env.DB_CONFIG)
        .updateOne({ guild_id: guild.id }, { $set: { prefix: input[1] } })
        .then(() => {
          return true;
        });
    }
  } catch {
    return false;
  }
};

export default AdminCommandsHandler;
