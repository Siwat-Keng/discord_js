import { play } from "../../services/MusicPlayer/SearchPlay";

const ClearChannel = (channel, mongodb) => {
  if (channel.members.size) setTimeout(ClearChannel, 30000, channel);
  channel.delete();
  mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_TEMPORARY_CHANNEL)
    .deleteOne({ id: channel.id });
};

const ReadyHandler = (client, mongodb) => {
  mongodb
    .db(process.env.MONGODB_DB)
    .collection(process.env.DB_TEMPORARY_CHANNEL)
    .find({})
    .toArray()
    .then((res) => {
      res.map((item) => {
        client.channels.fetch(item.id).then((channel) => {
          setTimeout(ClearChannel, 30000, channel, mongodb);
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
};

module.exports = { ReadyHandler, ClearChannel };
