const Skip = (guild) => {
  if (guild.me.voice.connection !== null)
    guild.me.voice.connection.dispatcher.end();
};

export default Skip;
