const chunk = require("lodash/chunk");
var distance = require("google-distance");
distance.apiKey = process.env.google_map_api_key;

async function checkDistance(origins, destinations) {
  const limit = 10;
  const batchOrigins = chunk(origins, limit);
  const distances = [];
  for (const origin of batchOrigins) {
    try {
      const distance = await getDistance(
        origin,
        destinations.slice(0, origin.length)
      );
      distances.push(...distance);
    } catch (e) {
      // some addresses can't be found
    }
  }
  return distances;
}

async function getDistance(origins, destinations) {
  return new Promise((res, rej) => {
    distance.get(
      {
        origins: origins,
        destinations: destinations,
      },
      (err, data) => {
        if (err) rej(err);
        else res(data);
      }
    );
  });
}

module.exports = checkDistance;
