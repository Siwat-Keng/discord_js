import ClearChannel from "../../ReadyHandler";

const ChannelCommandHandler = async (input, guild, mongodb) => {
  try {
    let channelName = input[0];
    guild.channels
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
