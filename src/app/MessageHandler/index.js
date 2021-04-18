import AdminCommandsHandler from "./AdminCommands";
import ChannelCommandHandler from "./ChannelCommands";
import HelpCommandsHandler from "./HelpCommands";
import { IntroduceChecker } from "../../services";

import responseReaction from "../../locales/responseReaction.json";

const MessageHandler = async (msg, mongodb) => {
  if (msg.author.bot) {
    return;
  }
  var prefix = await mongodb
    .db(process.env.MONGODB_DB)
    .collection("prefix")
    .findOne({ guild_id: msg.guild.id });
  if (!prefix) prefix = process.env.DEFAULT_PREFIX;
  else prefix = prefix.prefix;
  if (msg.content.startsWith(prefix)) {
    let input = msg.content.slice(prefix.length).trim().split(" ");
    let command = input.shift();
    if (command == "admin" && msg.author.id == msg.guild.ownerID) {
      AdminCommandsHandler(input, msg.guild, mongodb).then((res) => {
        if (res) msg.react(responseReaction.success);
        else msg.react(responseReaction.fail);
      });
    } else if (command == "channel") {
      ChannelCommandHandler(input, msg.guild, mongodb).then((res) => {
        if (res) msg.react(responseReaction.success);
        else msg.react(responseReaction.fail);
      });
    } else if (command == "help") {
      HelpCommandsHandler(msg.author).then((res) => {
        if (res) msg.react(responseReaction.success);
        else msg.react(responseReaction.fail);
      });
    }
  } else {
    // IntroduceChecker(msg, mongodb).then((res) => {
    //   if (res) msg.react(responseReaction.success);
    //   else msg.react(responseReaction.fail);
    // });
  }
};

export default MessageHandler;
