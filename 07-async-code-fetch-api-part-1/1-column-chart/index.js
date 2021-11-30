import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;

  constructor({
    data = [],
    label = '',
    link = '',
    value = 0,
    url = '',
    range = {
      from: new Date(),
      to: new Date(),
    },
    formatHeading = data => data
  } = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;
    this.url = url;
    this.range = range;

    this.urlTemplate = dates => BACKEND_URL + '/' + this.url
      + `?from=${dates.from.toISOString()}&to=${dates.to.toISOString()}`;

    this.render();
    this.update(this.range.from, this.range.to);
  }

  getTemplate() {
    return `
    <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        ${this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : ``}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
            ${this.formatHeading(this.value)}
        </div>
        <div data-element="body" class="column-chart__chart">
          ${this.renderColumns()}
        </div>
      </div>
    </div>`;
  }

  render() {
    const element = document.createElement('div'); // (*)

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }

    this.subElements = this.getSubElements(this.element);
  }

  renderColumns() {
    return this.getColumnProps(this.data)
      .map(({toolTip, value}) => `<div style="--value: ${value}" data-tooltip="${toolTip}"></div>`)
      .join('');
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

  async update(start, end) {
    this.element.classList.add('column-chart_loading');

    this.range.from = start;
    this.range.to = end;

    this.data = await fetchJson(this.urlTemplate(this.range));
    this.subElements.body.innerHTML = this.renderColumns();
    this.value = Object.values(this.data).reduce((sum, item) => sum + item, 0);
    this.subElements.header.innerHTML
      = `${this.formatHeading !== null
        ? this.formatHeading(this.value)
        : this.value}`;
    this.element.classList.remove('column-chart_loading');

    return this.data;
  }

  getColumnProps(data = {}) {
    const maxValue = Math.max(...Object.values(data));
    const scale = this.chartHeight / maxValue;

    return Object.entries(data).map(([key, value]) => {
      return {
        toolTip: `<div><small>${key}</small></div><strong>${value}</strong>`,
        value: String(Math.floor(parseInt(value) * scale))
      };
    });
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
