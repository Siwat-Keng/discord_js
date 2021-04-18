import helpEmbedObject from "../../../locales/help.json";

const HelpCommandsHandler = async (author) => {
  try {
    author.send({ embed: helpEmbedObject });
    return true;
  } catch {
    return false;
  }
};

export default HelpCommandsHandler;
