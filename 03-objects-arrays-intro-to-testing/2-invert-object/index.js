/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (obj === undefined) {
    return undefined;
  }
  const resObj = {};
  for (const [key, value] of Object.entries(obj)) {
    resObj[value] = key;
  }

  return resObj;
}
