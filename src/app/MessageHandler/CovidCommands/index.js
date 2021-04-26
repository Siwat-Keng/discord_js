import covidService from "../../../services/covidData";

const covidCommandHandler = (input, channel) => {
  try {
    if (input.length) {
      return covidService.covidProvince(input.join(" ")).then((embedObject) => {
        return channel.send({ embed: embedObject }).then(() => {
          return true;
        });
      });
    } else
      return covidService.covidData().then((embedObject) => {
        return channel.send({ embed: embedObject }).then(() => {
          return true;
        });
      });
  } catch {
    return false;
  }
};

export default covidCommandHandler;
