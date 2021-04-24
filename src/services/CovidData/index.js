import covidAPI from "./API";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import fs from "fs";
import { getTimeFromFormat, getDateTimeFromString } from "../Timer";
import stringSimilarity from "string-similarity";

import provinceList from "../../locales/province.json";
import { exception } from "console";

const ramdomNumber = () => {
  return Math.floor(Math.random() * 255).toString();
};

const randomColor = (background, border) => {
  let randomList = [ramdomNumber(), ramdomNumber(), ramdomNumber()];
  return [
    `rgba(${randomList[0]}, ${randomList[1]}, ${randomList[2]}, ${background})`,
    `rgba(${randomList[0]}, ${randomList[1]}, ${randomList[2]}, ${border})`,
  ];
};

const getClosestMatch = (province) => {
  let bestMatchTH = stringSimilarity.findBestMatch(province, provinceList.th)
    .bestMatch;
  let bestMatchEN = stringSimilarity.findBestMatch(province, provinceList.en)
    .bestMatch;
  if (bestMatchTH.rating >= bestMatchEN.rating && bestMatchTH.rating >= 0.5)
    return [bestMatchTH.target, "th"];
  else if (bestMatchEN.rating > bestMatchTH.rating && bestMatchEN.rating >= 0.5)
    return [bestMatchEN.target, "en"];
  throw exception;
};

const CovidData = async () => {
  const formattedTime = getTimeFromFormat("hh:mm:ss a");
  const configuration = {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "จำนวนผู้ติดเชื้อเพิ่ม(คน)",
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              precision: 0,
              beginAtZero: true,
            },
          },
        ],
      },
    },
  };
  var prevData;
  (await covidAPI.getDailyData()).slice(-11).map((item) => {
    if (prevData == undefined) prevData = item;
    let color = randomColor(0.2, 1);
    configuration.data.labels.push(item.date);
    configuration.data.datasets[0].data.push(
      item.confirmed - prevData.confirmed
    );
    configuration.data.datasets[0].backgroundColor.push(color[0]);
    configuration.data.datasets[0].borderColor.push(color[1]);
    prevData = item;
  });
  const canvasRenderService = new ChartJSNodeCanvas({
    width: 600,
    height: 600,
  });
  var todayData = await covidAPI.getDailyData();
  const formattedDataDate = getDateTimeFromString(
    todayData[todayData.length - 1].date,
    "yyyy-LL-dd",
    "DDD"
  );
  const image = await canvasRenderService.renderToBuffer(configuration);
  fs.writeFileSync("./images/image.jpg", image);
  const embedObject = {
    title: "รายงานสถานการณ์ โควิด-19",
    description:
      "```md\n[ อัพเดทข้อมูลล่าสุด " +
      formattedDataDate +
      ` ]\n\n# ผู้ติดเชื้อเพิ่ม : ${
        todayData[todayData.length - 1].confirmed -
        todayData[todayData.length - 2].confirmed
      } คน\n# รักษาหายวันนี้ : ${
        todayData[todayData.length - 1].recovered -
        todayData[todayData.length - 2].recovered
      } คน\n# เสียชีวิตเพิ่ม : ${
        todayData[todayData.length - 1].deaths -
        todayData[todayData.length - 2].deaths
      } คน\n# ผู้ป่วยสะสม : ${
        todayData[todayData.length - 1].confirmed -
        todayData[todayData.length - 1].recovered -
        todayData[todayData.length - 1].deaths
      }` +
      " คน```",
    color: 0x00ff00,
    image: {
      url: "attachment://image.jpg",
    },
    url: "https://covid19.th-stat.com/",
    footer: {
      text: `Today at ${formattedTime}\nhttps://www.sanook.com/covid-19/`,
    },
    files: [
      {
        attachment: "./images/image.jpg",
        name: "image.jpg",
      },
    ],
  };
  return embedObject;
};

const CovidProvince = async (province) => {
  var provinceData;

  const formattedTime = getTimeFromFormat("hh:mm:ss a");
  let targetProvince = getClosestMatch(province);
  if (targetProvince[1] == "th")
    provinceData = (await covidAPI.getAccumulateData()).filter(
      (item) => item.title == targetProvince[0]
    )[0];
  else
    provinceData = (await covidAPI.getAccumulateData()).filter(
      (item) => item.slug == targetProvince[0].toLowerCase()
    )[0];
  const embedObject = {
    title: `รายงานสถานการณ์ โควิด-19 จังหวัด ${provinceData.title}`,
    description: `**จังหวัด ${provinceData.title}**\n\n**ผู้ป่วยสะสม**\n${provinceData.currentStatus.accumulate} คน ( ติดเชื้อเพิ่ม ${provinceData.currentStatus.new} คน )\n\n**ระดับการเฝ้าระวัง**\nระดับ ${provinceData.currentStatus.infectionLevelByRule}`,
    color: 0x00ff00,
    url: "https://www.sanook.com/covid-19/",
    footer: {
      text: `Today at ${formattedTime}\nhttps://www.sanook.com/covid-19/`,
    },
  };
  return embedObject;
};

module.exports = { CovidData, CovidProvince };
