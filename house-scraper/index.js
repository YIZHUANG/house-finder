require("./initServerless");
const scrapWebsiteOne = require("./scrapWebsiteOne");
const sendEmail = require("../utils/sendEmail");

module.exports = async context => {
  const { log } = context;
  global.log = log;
  const timeStamp = new Date().toISOString();
  log("Trigger time", timeStamp);
  try {
    const websiteOneData = await scrapWebsiteOne();
    log(`Got ${websiteOneData.length} of matches in total`);
    await sendEmail(websiteOneData);
    context.res = {
      // status: 200, /* Defaults to 200 */
      body: websiteOneData,
    };
  } catch (e) {
    context.res = { status: 500, message: "An unexpected error occur" };
    log("Failed to scrap due to an error ", e);
  }
  context.done();
};
