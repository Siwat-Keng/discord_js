const Skip = async (guild, mongodb) => {
  if (guild.me.voice.connection !== null)
    guild.me.voice.connection.dispatcher.end();
};

export default Skip;
