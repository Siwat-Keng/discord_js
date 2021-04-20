import axios from "axios";

const BASE_URL = "https://s.isanook.com/an/0/covid-19/static/data/";

const getDailyURL = () => {
  let timestamp = new Date().getTime();
  return axios
    .get(`${BASE_URL}thailand/daily/latest.json?${timestamp}`)
    .then((res) => {
      return res.data.url;
    });
};

const getGlobalURL = () => {
  let timestamp = new Date().getTime();
  return axios
    .get(`${BASE_URL}global/confirmed/latest.json?${timestamp}`)
    .then((res) => {
      return res.data.url;
    });
};

const getAccumulateURL = () => {
  let timestamp = new Date().getTime();
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
