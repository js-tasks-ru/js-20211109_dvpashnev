import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';
const MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;

export default class Page {
  element;
  subElements = {};

  onDateSelect = async event => {
    const { from, to } = event.detail;
    this.ordersColumnChart.range = event.detail;
    this.salesColumnChart.range = event.detail;
    this.customersColumnChart.range = event.detail;
    const ordersPromise = this.ordersColumnChart.update(from, to);
    const salesPromise = this.salesColumnChart.update(from, to);
    const customersPromise = this.customersColumnChart.update(from, to);
    this.sortableTable.url.searchParams.set('from', from.toISOString());
    this.sortableTable.url.searchParams.set('to', to.toISOString());


    const bestsellerPromise = this.sortableTable.sortOnServer(this.sortableTable.sorted.id,
      this.sortableTable.sorted.order,
      1,
      this.sortableTable.step + 1);

    await Promise.all([ordersPromise, salesPromise, customersPromise, bestsellerPromise]);
  };

  constructor() {
    const today = new Date();
    this.timeOffset = today.getTimezoneOffset();
    today.setMinutes(today.getMinutes() + this.timeOffset);
    this.rangePicker = new RangePicker({
      from: new Date(today.getTime() - MONTH_IN_MS),
      to: today
    });


    this.ordersColumnChart = new ColumnChart({
      label: 'Заказы',
      link: '/sales',
      formatHeading: data => data,
      url: 'api/dashboard/orders',
      range: {
        from: this.rangePicker.selected.from,
        to: this.rangePicker.selected.to,
      }
    });

    this.salesColumnChart = new ColumnChart({
      label: 'Продажи',
      formatHeading: data => data,
      url: 'api/dashboard/sales',
      range: {
        from: this.rangePicker.selected.from,
        to: this.rangePicker.selected.to,
      }
    });

    this.customersColumnChart = new ColumnChart({
      label: 'Клиенты',
      formatHeading: data => data,
      url: 'api/dashboard/customers',
      range: {
        from: this.rangePicker.selected.from,
        to: this.rangePicker.selected.to,
      }
    });

    this.sortableTable = new SortableTable(header, {
      url: 'api/dashboard/bestsellers'
        + '?from=' + this.rangePicker.selected.from.toISOString()
        + '&to=' + this.rangePicker.selected.to.toISOString(),
      isSortLocally: true
    });
  }

  get template() {
    return `<div class="dashboard full-height flex-column">
    <div class="content__top-panel">
      <h2 class="page-title">Панель управления</h2>
    </div>
    <div class="dashboard__charts">
    </div>
    <h3 class="block-title">Лидеры продаж</h3>
    </div>`;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements.topPanel = element.querySelector('.content__top-panel');

    this.subElements.topPanel.append(this.rangePicker.element);
    this.subElements.rangePicker = element.querySelector('.rangepicker');

    this.subElements.charts = element.querySelector('.dashboard__charts');

    this.subElements.charts.append(this.ordersColumnChart.element);
    this.subElements.charts.append(this.salesColumnChart.element);
    this.subElements.charts.append(this.customersColumnChart.element);
    this.subElements.ordersChart = element.querySelector('.dashboard__chart_orders');
    this.subElements.salesChart = element.querySelector('.dashboard__chart_sales');
    this.subElements.customersChart = element.querySelector('.dashboard__chart_customers');

    this.element.append(this.sortableTable.element);
    this.subElements.sortableTable = element.querySelector('.sortable-table');

    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    this.element.addEventListener('date-select', this.onDateSelect);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.rangePicker.destroy();
    this.ordersColumnChart.destroy();
    this.salesColumnChart.destroy();
    this.customersColumnChart.destroy();
    this.sortableTable.destroy();

    this.remove();
    this.element = null;
  }
}
