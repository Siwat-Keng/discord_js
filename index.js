import Discord from "discord.js";
import MongoClient from "mongodb";
import "dotenv/config";
import Handler from "./src/app";

const main = async () => {
  const client = new Discord.Client();

  const mongodb = await MongoClient(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
  });

  client.on("guildCreate", (guild) => {
    Handler.GuildHandler(guild, mongodb);
  });

  // client.on("guildMemberAdd", (member) => {
  //   console.log(member);
  // });

  // client.on("guildMemberRemove", (member) => {
  //   console.log(member);
  // });

  client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    Handler.ReadyHandler(client, mongodb);
  });

  client.on("message", (msg) => {
    Handler.MessageHandler(msg, mongodb);
  });

  await mongodb.connect();

  client.login(process.env.TOKEN);
};

main().catch((err) => {
  console.log(err.message);
});
