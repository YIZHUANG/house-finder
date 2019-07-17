const qs = require("querystring");
const checkDistance = require("../utils/checkDistance");

const config = process.env;
const { base_location, website_1_result_class } = process.env;

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

async function scrapWebsiteOne(browser, url, results = [], log) {
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
    } = config;
    const cards = [...document.querySelectorAll(website_1_card_item_classname)];
    const data = [];
    for (const card of cards) {
      const address = card.querySelector(website_1_address_classname)
        .textContent;
      const link = card.href;
      const price = card.querySelector(website_1_price_classname).textContent;
      data.push({
        address,
        link,
        price,
      });
    }
    return data;
  }, config);
  log(`Got ${houses.length} of houses`);
  const { origins, destinations } = buildSpecsForDistanceSearch(houses);
  const distances = await checkDistance(origins, destinations);
  const matchs = getMatches(houses, distances);
  log(`Got ${matchs.length} of houses after filtering`);
  const newResults = [...results, ...matchs];
  const nextPageUrl = await getNextPage(page, url);
  if (nextPageUrl) {
    return scrapWebsiteOne(browser, nextPageUrl, newResults, log);
  }
  await browser.close();
  return newResults;
}
module.exports = scrapWebsiteOne;
