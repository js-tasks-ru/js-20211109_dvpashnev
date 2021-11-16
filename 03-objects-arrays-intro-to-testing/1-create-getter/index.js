/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return function (obj) {
    const parts = path.split('.');
    let copy = {...obj};
    let resultProp;
    for (let prop of parts) {
      if (copy[prop]) {
        resultProp = copy[prop];
        copy = copy[prop];
      } else {
        resultProp = undefined;
        break;
      }
    }
    return resultProp;
  };
}
