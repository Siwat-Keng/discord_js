import AdminCommandsHandler from "./AdminCommands";
import ChannelCommandHandler from "./ChannelCommands";
import HelpCommandsHandler from "./HelpCommands";
import CovidCommandHandler from './CovidCommands';
import responseReaction from "../../locales/responseReaction.json";

const MessageHandler = async (msg, mongodb) => {
  if (msg.author.bot) {
    return;
  }
  var prefix = await mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_PREFIX)
    .findOne({ guild_id: msg.guild.id });
  prefix = prefix.prefix;
  if (msg.content.startsWith(prefix)) {
    let input = msg.content.slice(prefix.length).trim().split(" ");
    let command = input.shift();
    if (command == "admin" && msg.author.id == msg.guild.ownerID) {
      AdminCommandsHandler(input, msg, mongodb).then((res) => {
        if (res) msg.react(responseReaction.success);
        else msg.react(responseReaction.fail);
      });
    } else if (command == "channel") {
      ChannelCommandHandler(input, msg, mongodb).then((res) => {
        if (res) msg.react(responseReaction.success);
        else msg.react(responseReaction.fail);
      });
    } else if (command == "help") {
      HelpCommandsHandler(msg.author).then((res) => {
        if (res) msg.react(responseReaction.success);
        else msg.react(responseReaction.fail);
      });
    } else if (command == "covid") {
      CovidCommandHandler(input, msg.channel).then((res) => {
        if (res) msg.react(responseReaction.success);
        else msg.react(responseReaction.fail);
      })
    }
  } else {
    // IntroduceChecker(msg, mongodb).then((res) => {
    //   if (res) msg.react(responseReaction.success);
    //   else msg.react(responseReaction.fail);
    // });
  }
};

export default MessageHandler;
