import ClearChannel from "../../ReadyHandler";
import noPermissionMessage from "../../../locales/noPermission.json";

const ChannelCommandHandler = async (input, msg, mongodb) => {
  try {
    if (!msg.guild.me.hasPermission("MANAGE_CHANNELS")) {
      msg.reply(noPermissionMessage.noManageChannelPermission);
      return false;
    }
    let channelName = input[0];
    msg.guild.channels
      .create(channelName, { type: "voice" })
      .then(async (channel) => {
        await mongodb
          .db(process.env.MONGODB_DB)
          .collection("temporaryChannel")
          .insertOne({ id: channel.id });
        setTimeout(ClearChannel.ClearChannel, 30000, channel, mongodb);
      });
    return true;
  } catch {
    return false;
  }
};

export default ChannelCommandHandler;
