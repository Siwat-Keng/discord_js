import { DateTime } from "luxon";

const getCurrentDateTime = () => {
  return DateTime.local().setZone(process.env.TIMEZONE);
};

const getTimeStamp = () => {
  return getCurrentDateTime().ts;
};

const getTimeFromFormat = (format) => {
  return getCurrentDateTime().toFormat(format);
};

const getDateTimeFromString = (string, oldFormat, newFormat) => {
  return DateTime.fromFormat(string, oldFormat, {
    zone: process.env.TIMEZONE,
  }).toFormat(newFormat);
};


module.exports = { getCurrentDateTime, getTimeFromFormat, getTimeStamp, getDateTimeFromString };
