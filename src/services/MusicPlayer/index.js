import { hasAutoPlayList, autoPlay } from "./autoPlay";
import { searchPlay } from "./searchPlay";
import commands from "./miniCommands";
import musicData from "../../locales/musicData.json";

const musicPlayer = (input, message, voiceChannel, mongodb) => {
  if (input.length) {
    let command = input[0];
    let args = input.slice(1);
    if (command == "play")
      if (args.length)
        searchPlay(args.join(" "), message.channel, voiceChannel, mongodb);
      else {
        hasAutoPlayList(message.guild, mongodb).then((hasAutoPlay) => {
          if (hasAutoPlay) autoPlay(message, voiceChannel, mongodb);
          else message.reply({ embed: musicData.embed.musicHelp });
        });
      }
    else if (command == "skip") commands.skip(message.guild, mongodb);
    else if (command == "stop") commands.stop(message.guild, mongodb);
    else if (command == "sound")
      commands.sound(args[0], message.guild, mongodb);
    else if (command == "resume") commands.resume(voiceChannel, mongodb);
    else if (command == "pause") commands.pause(message.guild, mongodb);
    else message.reply({ embed: musicData.embed.musicHelp });
  } else message.reply({ embed: musicData.embed.musicHelp });
};

export default musicPlayer;
