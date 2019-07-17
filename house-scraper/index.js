const puppeteer = require("puppeteer");
const scrapWebsiteOne = require("./scrapWebsiteOne");
const { website_1_url } = process.env;

module.exports = async (context) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const { log } = context;
  try {
    const websiteOneData = await scrapWebsiteOne(
      browser,
      website_1_url,
      [],
      log
    );
    log(`Got ${websiteOneData.length} of matches in total`);
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