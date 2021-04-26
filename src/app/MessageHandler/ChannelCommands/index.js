import { ClearChannel } from "../../ReadyHandler";
import noPermissionMessage from "../../../locales/noPermission.json";

const ChannelCommandHandler = (input, msg, mongodb) => {
  try {
    if (!msg.guild.me.hasPermission("MANAGE_CHANNELS")) {
      msg.reply(noPermissionMessage.noManageChannelPermission);
      return false;
    }
    let channelName = input[0];
    msg.guild.channels
      .create(channelName, { type: "voice" })
      .then((channel) => {
        mongodb
          .db(process.env.MONGODB_DB)
          .collection(process.env.DB_GUILD_DATA)
          .findOne({ guild_id: msg.guild.id })
          .then((data) => {
            if (data.temp_channel) data.temp_channel.push(channel.id);
            else data.temp_channel = [channel.id];
            mongodb
              .db(process.env.MONGODB_DB)
              .collection(process.env.DB_GUILD_DATA)
              .updateOne(
                { guild_id: msg.guild.id },
                {
                  $set: { temp_channel: data.temp_channel },
                },
                { upsert: true }
              );
          });
        setTimeout(ClearChannel, 30000, channel, mongodb);
        return true;
      });
  } catch {
    return false;
  }
};

export default ChannelCommandHandler;
