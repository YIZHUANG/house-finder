function removeDuplicates(existingHouses, newHouses) {
  return newHouses.filter(newHouse => {
    const found = existingHouses.find(existingHouse => {
      return (
        newHouse.address.indexOf(existingHouse.address) > -1 ||
        existingHouse.address.indexOf(newHouse.address) > -1
      );
    });
    return found ? false : true;
  });
}

module.exports = removeDuplicates;
