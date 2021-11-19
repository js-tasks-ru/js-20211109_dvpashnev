/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) {
    return string;
  }
  let resStr = '';
  let lastChar = string[0];
  let count = 0;
  for (let char of string) {
    if (char === lastChar) {
      if (count < size) {
        resStr += char;
      }
      count++;
    } else {
      if (size > 0) {
        resStr += char;
      }
      count = 1;
    }
    lastChar = char;
  }
  return resStr;
}
