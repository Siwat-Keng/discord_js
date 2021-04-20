import { MusicPlayer } from "../../../services";
import errorMessage from "../../../locales/noPermission.json";

const MusicCommandHandler = (input, msg, mongodb) => {
  try {
    if (msg.member.voice.channelID == null) {
      msg.reply(errorMessage.noVoiceChannel);
      return false;
    }
    return msg.guild.me.client.channels
      .fetch(msg.member.voice.channelID)
      .then(async (voiceChannel) => {
        const botPermissions = voiceChannel.permissionsFor(msg.guild.me);
        if (
          botPermissions.has("VIEW_CHANNEL") &&
          botPermissions.has("CONNECT") &&
          botPermissions.has("SPEAK")
        ) {
          await MusicPlayer(input, msg, voiceChannel, mongodb);
          return true;
        } else {
          return msg.reply(errorMessage.noVoiceChannelPermission).then(() => {
            return false;
          });
        }
      });
  } catch {
    return false;
  }
};

export default MusicCommandHandler;
