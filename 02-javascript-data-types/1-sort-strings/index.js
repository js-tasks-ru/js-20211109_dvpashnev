/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const result = [...arr];
  result.sort(param === 'asc' ? compareAsc : compareDesc);
  return result;
}

/**
 * compare - compares two normalizes string by criteria "asc" or "desc"
 * @param {string} a - string
 * @param {string} b - string
 * @param {string} b - string
 * @returns {number} - if a > b => 1, if a < b => -1, if a = b => 0(-0)
 */
function compareAsc(a, b) {
  return a.normalize()
    .localeCompare(b.normalize(),
      ['ru', 'en'], {caseFirst: 'upper'});
}

function compareDesc(a, b) {
  return -compareAsc(a, b);
}
