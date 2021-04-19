import covidService from "../../../services/CovidData";

const CovidCommandHandler = async (input, channel) => {
  try {
    if (input.length)
      var embedObject = await covidService.CovidProvince(input.join(" "));
    else var embedObject = await covidService.CovidData();
    await channel.send({ embed: embedObject });
    return true;
  } catch {
    return false;
  }
};

export default CovidCommandHandler;
