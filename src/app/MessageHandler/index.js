import adminCommandsHandler from "./adminCommands";
import channelCommandHandler from "./channelCommands";
import helpCommandsHandler from "./helpCommands";
import covidCommandHandler from "./covidCommands";
import musicCommandHandler from "./musicCommands";
import responseReaction from "../../locales/responseReaction.json";

const messageHandler = async (msg, mongodb) => {
  if (msg.author.bot) {
    return;
  }
  const prefix = (
    await mongodb
      .db(process.env.MONGODB_DB)
      .collection(process.env.DB_GUILD_DATA)
      .findOne({ guild_id: msg.guild.id })
  ).prefix;
  if (msg.content.startsWith(prefix)) {
    let input = msg.content.slice(prefix.length).trim().split(" ");
    let command = input.shift();
    if (command == "admin" && msg.author.id == msg.guild.ownerID) {
      adminCommandsHandler(msg.channel, input, msg.guild, mongodb).then(
        (res) => {
          if (res) msg.react(responseReaction.success);
          else msg.react(responseReaction.fail);
        }
      );
    } else if (command == "channel") {
      channelCommandHandler(input, msg, mongodb).then((res) => {
        if (res) msg.react(responseReaction.success);
        else msg.react(responseReaction.fail);
      });
    } else if (command == "help") {
      helpCommandsHandler(msg.author).then((res) => {
        if (res) msg.react(responseReaction.success);
        else msg.react(responseReaction.fail);
      });
    } else if (command == "covid") {
      if (covidCommandHandler(input, msg.channel))
        msg.react(responseReaction.success);
      else msg.react(responseReaction.fail);
    } else if (command == "music") {
      musicCommandHandler(input, msg, mongodb).then((res) => {
        if (res) msg.react(responseReaction.success);
        else msg.react(responseReaction.fail);
      });
    }
  }
};

export default messageHandler;
