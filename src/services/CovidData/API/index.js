import axios from "axios";

const BASE_URL = "https://s.isanook.com/an/0/covid-19/static/data/";

const getDailyURL = () => {
  const timestamp = new Date().getTime() + Number(process.env.TIME_DIFF);
  return axios
    .get(`${BASE_URL}thailand/daily/latest.json?${timestamp}`)
    .then((res) => {
      return res.data.url;
    });
};

const getGlobalURL = () => {
  const timestamp = new Date().getTime() + Number(process.env.TIME_DIFF);
  return axios
    .get(`${BASE_URL}global/confirmed/latest.json?${timestamp}`)
    .then((res) => {
      return res.data.url;
    });
};

const getAccumulateURL = () => {
  const timestamp = new Date().getTime() + Number(process.env.TIME_DIFF);
  return axios
    .get(`${BASE_URL}thailand/accumulate/latest.json?${timestamp}`)
    .then((res) => {
      return res.data.url;
    });
};

const getDailyData = () => {
  return getDailyURL().then((url) => {
    return axios.get(url).then((res) => {
      return res.data.data;
    });
  });
};

const getGlobalData = () => {
  return getGlobalURL().then((url) => {
    return axios.get(url).then((res) => {
      return res.data.data;
    });
  });
};

const getAccumulateData = () => {
  return getAccumulateURL().then((url) => {
    return axios.get(url).then((res) => {
      return res.data.data;
    });
  });
};

module.exports = { getDailyData, getGlobalData, getAccumulateData };
