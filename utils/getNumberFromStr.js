function getNumberFromStr(str) {
  return str.replace(/\s/g, "").match(/\d+/)[0];
}

module.exports = getNumberFromStr;
