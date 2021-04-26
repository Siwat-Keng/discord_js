import { play } from "../../services/MusicPlayer/searchPlay";
import { getLastUpdate } from "../../services/covidData/API";
import { covidData } from "../../services/covidData";

const clearChannel = (channel, mongodb) => {
  if (channel.members.size) setTimeout(clearChannel, 30000, channel);
  channel.delete();
  mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_GUILD_DATA)
    .findOne({ guild_id: channel.guild.id })
    .then((data) => {
      data.temp_channel = data.temp_channel.filter((channelID) => {
        return channelID != channel.id;
      });
      mongodb
        .db(process.env.MONGODB_DB)
        .collection(process.env.DB_GUILD_DATA)
        .updateOne(
          { guild_id: channel.guild.id },
          {
            $set: { temp_channel: data.temp_channel },
          }
        );
    });
};

const triggerMessage = (guild, mongodb) => {
  getLastUpdate().then((lastUpdated) => {
    mongodb
      .db(process.env.MONGODB_DB)
      .collection(process.env.DB_GUILD_DATA)
      .findOne({ guild_id: guild.id })
      .then((data) => {
        if (
          data.covid_channel &&
          (!data.cache || data.cache.covid_last_update != lastUpdated)
        ) {
          mongodb
            .db(process.env.MONGODB_DB)
            .collection(process.env.DB_GUILD_DATA)
            .updateOne(
              { guild_id: guild.id },
              {
                $set: { "cache.covid_last_update": lastUpdated },
              },
              { upsert: true }
            );
          Promise.all([
            guild.client.channels.fetch(data.covid_channel),
            covidData(),
          ]).then(([channel, embedObject]) => {
            channel.send({ embed: embedObject });
          });
        }
      });
  });
};

const readyHandler = (client, mongodb) => {
  mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_GUILD_DATA)
    .find({})
    .toArray()
    .then((res) => {
      if (res.temp_channel)
        res.temp_channel.map((item) => {
          client.channels.fetch(item).then((channel) => {
            setTimeout(clearChannel, 30000, channel, mongodb);
          });
        });
    });
  mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_MUSIC_QUEUE)
    .find({})
    .toArray()
    .then((res) => {
      res.map((item) => {
        if (item.serverQueue.playing)
          Promise.all([
            client.guilds.fetch(item.guild_id),
            client.channels.fetch(item.serverQueue.voiceChannelID),
          ]).then(([guild, channel]) => {
            channel.join().then(() => {
              play(guild, item.serverQueue[0], mongodb);
            });
          });
      });
    });
  client.guilds.cache.map((guild) => {
    setInterval(triggerMessage, 60000, guild, mongodb);
  });
};

module.exports = { readyHandler, clearChannel };
