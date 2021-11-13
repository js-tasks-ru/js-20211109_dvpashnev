/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
  let result = {};

  const objectEntries = Object.entries(obj);

  if (objectEntries.length <= fields.length) {
    for (let [key, value] of objectEntries) {
      if (fields.includes(key)) {
        result[key] = value;
      }
    }
  } else {
    for (let key of fields) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
  }

  return result;
};
