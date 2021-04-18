const ClearChannel = async (channel, mongodb) => {
  if (channel.members.size) setTimeout(ClearChannel, 30000, channel);
  channel.delete();
  await mongodb
    .db(process.env.MONGODB_DB)
    .collection("temporaryChannel")
    .deleteOne({ id: channel.id });
};

const ReadyHandler = async (client, mongodb) => {
  mongodb
    .db(process.env.MONGODB_DB)
    .collection("temporaryChannel")
    .find({})
    .toArray()
    .then((res) => {
      res.map((item) => {
        client.channels.fetch(item.id).then((channel) => {
          setTimeout(ClearChannel, 30000, channel, mongodb);
        });
      });
    });
};

module.exports = { ReadyHandler, ClearChannel };
