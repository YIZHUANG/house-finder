const puppeteer = require("puppeteer");
const scrapWebsiteOne = require("./scrapWebsiteOne");
const sendEmail = require("../utils/sendEmail");
const { website_1_url } = process.env;

module.exports = async context => {
  const { log } = context;
  const timeStamp = new Date().toISOString();
  log("Trigger time", timeStamp);
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const websiteOneData = await scrapWebsiteOne(
      browser,
      website_1_url,
      [],
      log
    );
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
