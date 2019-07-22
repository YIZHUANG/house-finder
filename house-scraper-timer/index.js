require("./initServerless");
const fs = require("fs");
const { getDataFromS3, putDataToS3 } = require("../utils/crudS3");
const scrapWebsiteOne = require("./scrapWebsiteOne");
const scrapWebsiteTwo = require("./scrapWebsiteTwo");
const sendEmail = require("../utils/sendEmail");

module.exports = async context => {
  const { log } = context;
  global.log = log;
  const timeStamp = new Date().toISOString();
  log("Trigger time", timeStamp);
  try {
    const exisitingData = await getDataFromS3();
    const websiteOneData = await scrapWebsiteOne(exisitingData);
    log(`Got ${websiteOneData.length} of matches in total for website one`);
    const wensiteTwoData = await scrapWebsiteTwo([
      ...exisitingData,
      ...websiteOneData,
    ]);
    log(`Got ${wensiteTwoData.length} of matches in total for website Two`);
    const allData = [...exisitingData, ...websiteOneData, ...wensiteTwoData];
    await putDataToS3(allData);
    await sendEmail([...websiteOneData, ...wensiteTwoData]);
  } catch (e) {
    log("Failed to scrap due to an error ", e);
  }
  context.done();
};
