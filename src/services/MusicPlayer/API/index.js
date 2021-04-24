import axios from "axios";

const VIDEO_PREFIX_URL = "https://www.youtube.com";

const getVideoDetail = (searchString) => {
  return axios
    .get(process.env.YOUTUBE_SEARCH_API, { params: { search: searchString } })
    .then((response) => {
      response.data.videos.map((video) => {
        video.url = `${VIDEO_PREFIX_URL}${video.url_suffix}`;
      });
      return response.data.videos;
    });
};

module.exports = { getVideoDetail };
