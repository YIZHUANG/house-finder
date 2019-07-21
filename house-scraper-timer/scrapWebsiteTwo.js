if (process.env.IN_SERVER_LESS !== "true") {
  const path = require("path");
  const winston = require("winston");
  require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
  global.log = winston.info;
}
const qs = require("querystring");
const puppeteer = require("puppeteer");
const filterPlacesByDistance = require("../utils/binmapDistance");
const removeDuplicates = require("../utils/removeDuplicates");

const { website_2_url, website_2_pagination_name } = process.env;
const config = process.env;

async function getNextPage(page, currentUrl) {
  const lastPage = await page.evaluate(config => {
    const { website_2_pagination_button_classname } = config;
    const paginationButtons = document.querySelectorAll(
      website_2_pagination_button_classname
    );
    const lastButton = paginationButtons[paginationButtons.length - 1];
    return Number(lastButton.textContent.trim());
  }, config);
  const query = qs.parse(currentUrl.split("?")[1]);
  const currentPage = Number(query[website_2_pagination_name]);
  if (currentPage < lastPage - 1) {
    const nextPage = currentPage + 1;
    query[website_2_pagination_name] = nextPage;
    const nextUrl = `${currentUrl.split("?")[0]}?${qs.stringify(query)}`; // hack.
    return nextUrl;
  }
  return null;
}

async function scrapWebsiteTwoByPage(
  browser,
  url,
  results = [],
  websiteOneData
) {
  const page = await browser.newPage();
  log(`going to ${url}`);
  await page.goto(url);
  const houses = await page.evaluate(config => {
    const {
      website_2_card_item_classname,
      website_2_address_classname,
      unwanted_areas,
      website_2_image_classname,
      website_2_price_classname,
      website_2_size_classname,
      base_city,
    } = config;
    /*
    Not making them reusable because this function is ran at browser env.
    Whatever reusuable stuff we have in Node env won't work in here.
    Unless we do: await page.exposeFunction(reusableStuff, (...args) => doStuff(...args));
    Which is not worth the effort.
    */
    function isUnwanted(area) {
      return unwanted_areas.split(",").some(unwantedArea => {
        const pattern = new RegExp("(^|\\W)" + unwantedArea + "($|\\W)", "gi");
        const found = area.match(pattern);
        return Array.isArray(found) && found.length > 0;
      });
    }
    const cards = [...document.querySelectorAll(website_2_card_item_classname)];
    const data = [];
    for (const card of cards) {
      const address = card
        .querySelector(website_2_address_classname)
        .textContent.trim();
      const link = card.href;
      const imageElement = card.querySelector(website_2_image_classname);
      const imageUrl = imageElement && imageElement.src;
      const price = card
        .querySelector(website_2_price_classname)
        .textContent.replace(/\s/g, "")
        .match(/\d+/)[0];
      const size = card
        .querySelector(website_2_size_classname)
        .textContent.replace(/\s/g, "")
        .match(/\d+/)[0];
      if (!isUnwanted(address)) {
        data.push({
          image: imageUrl,
          address: address.replace(`, ${base_city}`, ""),
          link,
          price,
          size,
        });
      }
    }
    return data;
  }, config);
  log(`Got ${houses.length} of houses`);
  const matchs = await filterPlacesByDistance(
    removeDuplicates(websiteOneData, houses)
  );
  log(`Got ${matchs.length} of houses after filtering`);
  const newResults = [...results, ...matchs];
  const nextPageUrl = await getNextPage(page, url);
  if (nextPageUrl) {
    return scrapWebsiteTwoByPage(
      browser,
      nextPageUrl,
      newResults,
      websiteOneData
    );
  }
  await browser.close();
  return newResults;
}

async function scrapWebsiteTwo(websiteOneData) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const websiteTwoData = await scrapWebsiteTwoByPage(
    browser,
    website_2_url,
    [],
    websiteOneData
  );
  return websiteTwoData;
}
if (process.env.IN_SERVER_LESS !== "true") {
  scrapWebsiteTwo();
}
module.exports = scrapWebsiteTwo;
