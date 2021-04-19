import axios from "axios";

const BASE_URL = "https://s.isanook.com/an/0/covid-19/static/data/";

const getDailyURL = async () => {
  return (await axios.get(BASE_URL + "thailand/daily/latest.json")).data.url;
};

const getGlobalURL = async () => {
  return (await axios.get(BASE_URL + "global/confirmed/latest.json")).data.url;
};

const getAccumulateURL = async () => {
  return (await axios.get(BASE_URL + "thailand/accumulate/latest.json")).data
    .url;
};

const getDailyData = async () => {
  return (await axios.get(await getDailyURL())).data.data;
};

const getGlobalData = async () => {
  return (await axios.get(await getGlobalURL())).data.data;
};

const getAccumulateData = async () => {
  return (await axios.get(await getAccumulateURL())).data.data;
};

module.exports = { getDailyData, getGlobalData, getAccumulateData };
