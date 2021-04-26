import stringSimilarity from "string-similarity";
import wordListed from "../../locales/formatter.json";

const splitter = /[: ]+/;

const introduceSplitter = (string) => {
  const result = {};
  string.split("\n").map((s) => {
    let splitted = s.split(splitter);
    result[
      stringSimilarity.findBestMatch(
        splitted[0],
        wordListed.introduceKeywords
      ).bestMatch.target
    ] = splitted.slice(1).join(" ");
  });
  return result;
};

const introduceChecker = async (msg, mongodb) => {
  try {
    const userIntro = introduceSplitter(msg.content);
    if (
      JSON.stringify(Object.keys(userIntro).sort()) ===
      JSON.stringify(wordListed.introduceKeywords.sort())
    )
      return true;
    return false;
  } catch {
    return false;
  }
};

export default introduceChecker;
