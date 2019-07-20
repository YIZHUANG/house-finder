if (process.env.IN_SERVER_LESS !== "true") {
  const path = require("path");
  const winston = require("winston");
  require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
  global.log = winston.info;
}

const qs = require("querystring");
const puppeteer = require("puppeteer");

const filterPlacesByDistance = require("../utils/binmapDistance");
const checkDistance = require("../utils/checkDistance");

const { website_1_url, base_location, website_1_result_class } = process.env;
const config = process.env;
/*
function buildSpecsForDistanceSearch(houses) {
  const origins = [];
  const destinations = [];
  houses.forEach(house => {
    origins.push(house.address);
    destinations.push(base_location);
  });
  return {
    origins,
    destinations,
  };
}

function getMatches(houses, distances) {
  const matchs = houses.filter((_, index) => {
    const distance = distances[index];
    if (distance) {
      return distance.durationValue <= 1300;
    }
    return false;
  });
  return matchs;
}
*/
async function getNextPage(page, currentUrl) {
  const lastPage = await page.evaluate(config => {
    const { website_1_pagination_button_classname } = config;
    const paginationButtons = document.querySelectorAll(
      website_1_pagination_button_classname
    );
    const lastButton = paginationButtons[paginationButtons.length - 1];
    return Number(lastButton.textContent.trim());
  }, config);
  const query = qs.parse(currentUrl.split("?")[1]);
  const currentPage = Number(query.pagination);
  if (currentPage < lastPage - 1) {
    const nextPage = currentPage + 1;
    query.pagination = nextPage;
    const nextUrl = `${currentUrl.split("?")[0]}?${qs.stringify(query)}`; // hack.
    return nextUrl;
  }
  return null;
}

async function scrapWebsiteOneByPage(browser, url, results = []) {
  const page = await browser.newPage();
  log(`going to ${url}`);
  await page.goto(url);
  await page.waitForSelector(website_1_result_class, {
    visible: true,
  });
  const houses = await page.evaluate(config => {
    const {
      website_1_card_item_classname,
      website_1_address_classname,
      website_1_price_classname,
      website_1_image_classname,
      website_1_image_att,
      website_1_area_classname,
      unwanted_areas
    } = config;
    function isUnwanted(area) {
      unwanted_areas.split(',').some(unwantedArea => {
        const pattern = new RegExp('(^|\\W)' + unwantedArea + '($|\\W)', 'gi');
        const found = area.match(pattern);
        return Array.isArray(found) && found.length > 0;
      })
    }
    const cards = [...document.querySelectorAll(website_1_card_item_classname)];
    const data = [];
    for (const card of cards) {
      const address = card.querySelector(website_1_address_classname)
        .textContent;
      const link = card.href;
      const image = card.querySelector(website_1_image_classname).attributes[
        website_1_image_att
      ].value;
      const area = card
        .querySelector(website_1_area_classname)
        .textContent.trim();
      const price = card.querySelector(website_1_price_classname).textContent;
      if(!isUnwanted(area)) {
        data.push({
          image,
          address,
          link,
          price,
          area,
        });
      }
    }
    return data;
  }, config);
  log(`Got ${houses.length} of houses`);

  /*
  const { origins, destinations } = buildSpecsForDistanceSearch(houses);
  const distances = await checkDistance(origins, destinations);
  const matchs = getMatches(houses, distances);
  */
  const matchs = await filterPlacesByDistance(houses);
  log(`Got ${matchs.length} of houses after filtering`);
  const newResults = [...results, ...matchs];
  const nextPageUrl = await getNextPage(page, url);
  if (nextPageUrl) {
    return scrapWebsiteOneByPage(browser, nextPageUrl, newResults);
  }
  await browser.close();
  return newResults;
}

async function scrapWebsiteOne() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const websiteOneData = await scrapWebsiteOneByPage(
    browser,
    website_1_url,
    []
  );
  return websiteOneData;
}
if (process.env.IN_SERVER_LESS !== "true") {
  scrapWebsiteOne();
}
module.exports = scrapWebsiteOne;
