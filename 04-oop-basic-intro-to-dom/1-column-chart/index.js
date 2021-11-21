export default class ColumnChart {
  chartHeight = 50;

  constructor(obj = {}) {
    ({
      data: this.data = [],
      label: this.label = '',
      link: this.link = '',
      value: this.value = 0,
      formatHeading: this.formatHeading = null
    } = obj);

    this.render();
    this.initEventListeners();
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
              ${this.formatHeading !== null ? this.formatHeading(this.value) : this.value}
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

    // NOTE: в этой строке мы избавляемся от обертки-пустышки в виде `div`
    // который мы создали на строке (*)
    this.element = element.firstElementChild;

    this.header = this.element.querySelector('.column-chart__header');
    this.chart = this.element.querySelector('.column-chart__chart');
    if (this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }
  }

  renderColumns() {
    let columns = ``;

    for (const {percent, value} of this.getColumnProps(this.data)) {
      columns += `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
    }
    return columns;
  }

  update(data) {
    this.value = data.reduce((sum, item) => sum + item, 0);
    this.header.innerHTML = `${this.formatHeading !== null ? this.formatHeading(this.value) : this.value}`;
    this.data = data;
    this.chart.innerHTML = this.renderColumns();
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  initEventListeners () {
    // NOTE: в данном методе добавляем обработчики событий, если они есть
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }
}
