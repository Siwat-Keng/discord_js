const AdminCommandsHandler = async (input, guild, mongodb) => {
  try {
    let command = input[0];
    if (command == "setprefix") {
      await mongodb
        .db(process.env.MONGODB_DB)
        .collection("prefix")
        .updateOne(
          { guild_id: guild.id },
          { $set: { prefix: input[1], guild_id: guild.id } }
        );
      return true;
    }
  } catch {
    return false;
  }
};

export default AdminCommandsHandler;
