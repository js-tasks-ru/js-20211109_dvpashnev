/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const parts = path.split('.');
  return function (obj) {
    let copy = {...obj};
    let resultProp;
    for (const prop of parts) {
      if (copy[prop]) {
        resultProp = copy[prop];
        copy = copy[prop];
      } else {
        return;
      }
    }
    return resultProp;
  };
}
