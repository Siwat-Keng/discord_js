import helpEmbedObject from "../../../locales/help.json";

const helpCommandsHandler = async (author) => {
  try {
    author.send({ embed: helpEmbedObject });
    return true;
  } catch {
    return false;
  }
};

export default helpCommandsHandler;
