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

const getDateTimeFromString = (string, format) => {
  return DateTime.fromFormat(string, format, {
    zone: process.env.TIMEZONE,
  });
};

module.exports = { getCurrentDateTime, getTimeFromFormat, getTimeStamp, getDateTimeFromString };
