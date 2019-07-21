require("./initServerless");
const scrapWebsiteOne = require("./scrapWebsiteOne");
const scrapWebsiteTwo = require("./scrapWebsiteTwo");
const sendEmail = require("../utils/sendEmail");

module.exports = async context => {
  const { log } = context;
  global.log = log;
  const timeStamp = new Date().toISOString();
  log("Trigger time", timeStamp);
  try {
    const websiteOneData = await scrapWebsiteOne();
    log(`Got ${websiteOneData.length} of matches in total for website one`);
    const wensiteTwoData = await scrapWebsiteTwo(websiteOneData);
    log(`Got ${wensiteTwoData.length} of matches in total for website Two`);
    await sendEmail([...websiteOneData, ...wensiteTwoData]);
  } catch (e) {
    log("Failed to scrap due to an error ", e);
  }
  context.done();
};
