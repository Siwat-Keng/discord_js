import { hasAutoPlayList, AutoPlay } from "./AutoPlay";
import { SearchPlay } from "./SearchPlay";
import Skip from "./Skip";
import Stop from "./Stop";
import musicData from "../../locales/musicData.json";

const MusicPlayer = async (input, message, voiceChannel, mongodb) => {
  if (input.length) {
    let command = input[0];
    let args = input.slice(1);
    if (command == "play")
      if (args.length)
        SearchPlay(args.join(" "), message.channel, voiceChannel, mongodb);
      else if (await hasAutoPlayList(message.guild, mongodb))
        AutoPlay(message, voiceChannel, mongodb);
      else message.reply(musicData.message.musicHelp);
    else if (command == "skip") Skip(message.guild, mongodb);
    else if (command == "stop") Stop(message.guild, mongodb);
    else message.reply(musicData.message.musicHelp);
  } else message.reply(musicData.message.musicHelp);
};

export default MusicPlayer;