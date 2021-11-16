/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return function (obj) {
    const parts = path.split('.');
    let resultProp;
    for (let prop of parts) {
      if (obj[prop]) {
        resultProp = obj[prop];
        obj = obj[prop];
      } else {
        resultProp = undefined;
        break;
      }
    }
    return resultProp;
  };
}
