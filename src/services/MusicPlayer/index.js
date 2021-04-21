import { hasAutoPlayList, AutoPlay } from "./AutoPlay";
import { SearchPlay } from "./SearchPlay";
import commands from "./MiniCommands";
import musicData from "../../locales/musicData.json";

const MusicPlayer = (input, message, voiceChannel, mongodb) => {
  if (input.length) {
    let command = input[0];
    let args = input.slice(1);
    if (command == "play")
      if (args.length)
        SearchPlay(args.join(" "), message.channel, voiceChannel, mongodb);
      else {
        hasAutoPlayList(message.guild, mongodb).then((hasAutoPlay) => {
          if (hasAutoPlay) AutoPlay(message, voiceChannel, mongodb);
          else message.reply(musicData.message.musicHelp);
        });
      }
    else if (command == "skip") commands.Skip(message.guild, mongodb);
    else if (command == "stop") commands.Stop(message.guild, mongodb);
    else if (command == "sound")
      commands.Sound(args[0], message.guild, mongodb);
    else if (command == "resume") commands.Resume(voiceChannel, mongodb);
    else if (command == "pause") commands.Pause(message.guild, mongodb);
    else message.reply(musicData.message.musicHelp);
  } else message.reply(musicData.message.musicHelp);
};

export default MusicPlayer;
