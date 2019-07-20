const axios = require("axios");
const get = require("lodash/get");

const apiKey = process.env.bin_map_api_key;
const base_city = process.env.base_city; // for better match.
const base_location = process.env.base_location;

async function getDistanceSpecs(address) {
  const url = `http://dev.virtualearth.net/REST/V1/Routes/Transit?wp.0=${address},${base_city}&wp.1=${base_location}&timeType=Departure&dateTime=5:00:00PM&key=${apiKey}`;
  const res = await axios.get(url);
  return get(res, ["data", "resourceSets", 0, "resources", 0], null);
}
function isClose(spec) {
  if (spec) {
    return spec.travelDistance <= 14.5;
  }
  return false;
}
async function filterPlacesByDistance(places) {
  const matches = [];
  for (const place of places) {
    try {
      const distanceSpecs = await getDistanceSpecs(place.address);

      if (isClose(distanceSpecs)) {
        matches.push({
          ...place,
          distance: distanceSpecs.travelDistance,
        });
      }
    } catch (e) {
      log(`Failed to find distance specs for ${place.address}`, e);
    }
  }
  return matches;
}

module.exports = filterPlacesByDistance;
