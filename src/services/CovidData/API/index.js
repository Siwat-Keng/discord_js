import axios from "axios";
import { getTimeStamp } from "../../Timer";

const BASE_URL = "https://s.isanook.com/an/0/covid-19/static/data/";

const getDailyURL = () => {
  return axios
    .get(`${BASE_URL}thailand/daily/latest.json?${getTimeStamp()}`)
    .then((res) => {
      return res.data.url;
    });
};

const getLastUpdate = () => {
  return axios
    .get(`${BASE_URL}thailand/daily/latest.json?${getTimeStamp()}`)
    .then((res) => {
      return res.data.lastUpdated;
    });
};

const getGlobalURL = () => {
  return axios
    .get(`${BASE_URL}global/confirmed/latest.json?${getTimeStamp()}`)
    .then((res) => {
      return res.data.url;
    });
};

const getAccumulateURL = () => {
  return axios
    .get(`${BASE_URL}thailand/accumulate/latest.json?${getTimeStamp()}`)
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

module.exports = {
  getDailyData,
  getGlobalData,
  getAccumulateData,
  getLastUpdate,
};
