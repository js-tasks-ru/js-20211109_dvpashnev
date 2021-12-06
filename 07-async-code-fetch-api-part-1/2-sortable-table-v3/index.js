import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};

  onMouseClick = async event => {
    const headerCell = event.target.closest('.sortable-table__cell');

    if (headerCell) {
      if (!headerCell.closest('.sortable-table__header')) {
        return;
      }
      if (headerCell.dataset.sortable !== 'false') {
        this.sorted.order = this.sorted.order === 'asc' ? 'desc' : 'asc' ;
        this.sorted.id = headerCell.dataset.id;

        await this.sort(this.sorted.id, this.sorted.order);
      }
    }
  };

  onScrollEnd = async () => {
    if (window.pageYOffset + 1 >= document.documentElement.scrollHeight - document.documentElement.clientHeight) {
      this.loaded.end += this.loaded.step;
      await this.loadNext();
    }
  };

  constructor(headerConfig, {
    data = [],
    sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    url = '',
    isSortLocally = false,
    loaded = {
      start: 0,
      end: 30,
      step: 30,
    },
  } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.url = url;
    this.urlTemplate = (sortOptions, loaded) => BACKEND_URL + '/'
      + this.url
      + `?_sort=${sortOptions.id}&_order=${sortOptions.order}&_start=${loaded.start}&_end=${loaded.end}`;

    this.isSortLocally = isSortLocally;
    this.loaded = loaded;

    this.render();
    this.initEventListeners();
  }

  get template() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getTableHeader()}
        </div>
        <div data-element="body" class="sortable-table__body">
          ${this.tableRows}
        </div>
      </div>
    </div>`;
  }

  getTableHeader(fieldValue = this.sorted.id, orderValue = this.sorted.order) {
    return this.headerConfig
      .map(({id, title, sortable}) => {
        const isSortedField = id === fieldValue;
        return `<div class="sortable-table__cell"
          data-id="${id}"
          data-sortable="${sortable}"
          ${isSortedField ? 'data-order="' + orderValue + '"' : ''}>
          <span>${title}</span>
          ${isSortedField ? this.sortArrow : ''}
        </div>`;
      }
      )
      .join('');
  }

  get sortArrow() {
    return `<span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
            </span>`;
  }

  getTableRows(data) {
    return data
      .map((row) => `<a href="/products/${row.id || '#'}" class="sortable-table__row">
                                ${this.getFields(row)}
                              </a>`)
      .join('');
  }

  getFields(row) {
    return this.headerConfig
      .map(field => {
        if (field.id !== 'id') {
          return field.template?.(row[[field.id]]) || `<div class="sortable-table__cell">${row[field.id]}</div>`;
        }
      })
      .join('');
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    await this.sort(this.sorted.id, this.sorted.order);

    document.body.append(this.element);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  initEventListeners() {
    document.addEventListener('pointerdown', this.onMouseClick);
    document.addEventListener('scroll', this.onScrollEnd);
  }

  async sort(fieldValue, orderValue) {
    this.sorted.id = fieldValue;
    this.sorted.order = orderValue;
    this.loaded.start = 0;
    this.loaded.end = this.loaded.step;

    if (this.isSortLocally) {
      await this.sortOnClient(fieldValue, orderValue);
    } else {
      await this.sortOnServer(fieldValue, orderValue);
    }
  }

  async sortOnClient(id, order) {
    const fieldConfig = this.headerConfig.find(field => field.id === id);
    this.data = sortObjects(this.data, id, fieldConfig.sortType, order);
    const oldSortedField = this.subElements.header.querySelector(`[data-order]`);
    if (oldSortedField !== null) {
      const arrowElement = oldSortedField.lastElementChild;
      delete oldSortedField.dataset.order;
      const newSortedField = this.subElements.header.querySelector(`[data-id="${id}"]`);
      newSortedField.dataset.order = order;
      arrowElement.remove();
      newSortedField.append(arrowElement);
    }

    this.subElements.body.innerHTML = this.getTableRows(this.data);
  }

  async sortOnServer (id, order) {
    this.sorted.id = id;
    this.sorted.order = order;

    this.data = await fetchJson(this.urlTemplate(this.sorted, this.loaded));

    const oldSortedField = this.subElements.header.querySelector(`[data-order]`);
    if (oldSortedField !== null) {
      const arrowElement = oldSortedField.lastElementChild;
      delete oldSortedField.dataset.order;
      const newSortedField = this.subElements.header.querySelector(`[data-id="${id}"]`);
      newSortedField.dataset.order = order;
      arrowElement.remove();
      newSortedField.append(arrowElement);
    }

    this.subElements.body.innerHTML = this.getTableRows(this.data);
  }

  async loadNext() {
    this.loaded.start = this.loaded.end;
    this.loaded.end += this.loaded.step;
    const newData = await fetchJson(this.urlTemplate(this.sorted, this.loaded));
    this.data = this.data.concat(newData);
    this.subElements.body.innerHTML += this.getTableRows(newData);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    document.removeEventListener('pointerdown', this.onMouseClick);
    document.removeEventListener('scroll', this.onScrollEnd);
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}

function sortObjects(arr, field, sortType, param = 'asc') {
  const result = [...arr];
  const directions = {
    asc: 1,
    desc: -1
  };
  let compareFunction = compareStrings;
  if (sortType === 'number') {
    compareFunction = compareNumbers;
  }

  result.sort((a, b) => directions[param] * compareFunction(a[field], b[field]));
  return result;
}

/**
 * compareStrings - compares two normalizes string by criteria "asc" or "desc"
 * @param {string} a - string
 * @param {string} b - string
 * @returns {number} - if a > b => 1, if a < b => -1, if a = b => 0(-0)
 */
function compareStrings(a, b) {
  return a.localeCompare(b, ['ru', 'en'], {caseFirst: 'upper'});
}

/**
 * compareNumbers - compares two numbers by criteria "asc" or "desc"
 * @param {string} a - string
 * @param {string} b - string
 * @returns {number} - if a > b => 1, if a < b => -1, if a = b => 0(-0)
 */
function compareNumbers(a, b) {
  return a - b;
}
