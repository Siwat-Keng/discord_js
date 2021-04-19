import { MusicPlayer } from "../../../services";
import errorMessage from "../../../locales/noPermission.json";

const MusicCommandHandler = async (input, msg, mongodb) => {
  try {
    if (msg.member.voice.channelID == null) {
      msg.reply(errorMessage.noVoiceChannel);
      return false;
    }
    const voiceChannel = await msg.guild.me.client.channels.fetch(
      msg.member.voice.channelID
    );
    const botPermissions = voiceChannel.permissionsFor(msg.guild.me);
    if (
      botPermissions.has("VIEW_CHANNEL") &&
      botPermissions.has("CONNECT") &&
      botPermissions.has("SPEAK")
    ) {
      MusicPlayer(input, msg, voiceChannel, mongodb);
      return true;
    } else {
      msg.reply(errorMessage.noVoiceChannelPermission);
      return false;
    }
  } catch {
    return false;
  }
};

export default MusicCommandHandler;
