import { Client } from "discord.js";
import mongoClient from "mongodb";
import "dotenv/config";
import handler from "./src/app";

const main = async () => {
  const client = new Client();

  const mongodb = await mongoClient(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
  });

  client.on("guildCreate", (guild) => {
    handler.guildHandler(guild, mongodb);
  });

  // client.on("guildMemberAdd", (member) => {
  //   console.log(member);
  // });

  // client.on("guildMemberRemove", (member) => {
  //   console.log(member);
  // });

  client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    handler.readyHandler(client, mongodb);
  });

  client.on("message", (msg) => {
    handler.messageHandler(msg, mongodb);
  });

  await mongodb.connect();

  client.login(process.env.TOKEN);
};

main().catch((err) => {
  console.log(err.message);
});
