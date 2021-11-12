/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let result = [...arr];
  const length = arr.length;
  for (let i = 0; i < length - 1; i++) {
    for (let j = 0; j < length - 1 - i; j++) {
      const current = result[j];
      const next = result[j + 1];
      if (compare(current, next, param) < 0) {
        const t = result[j + 1];
        result[j + 1] = result[j];
        result[j] = t;
      }
    }
  }

  return result;
}

/**
 * compare - compares two string by criteria "asc" or "desc"
 * @param {string} a - string
 * @param {string} b - string
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {number}
 */
function compare(a, b, param = 'asc') {
  const compareResult = b.localeCompare(a,['ru-RU-u-kf-upper', 'en-US-u-kf-upper']);
  return param === 'asc' ? compareResult : -compareResult;
}
