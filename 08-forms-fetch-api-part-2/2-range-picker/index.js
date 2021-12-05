export default class RangePicker {
  element;
  subElements = {};
  cells = {};

  onPointerDown = (e) => {
    const targetInput = e.target.closest('.rangepicker__input');
    const targetCell = e.target.closest('.rangepicker__cell');
    if (targetInput) {
      this.renderSelector();
      this.setRange();
      if (this.element.classList.contains('rangepicker_open')) {
        this.element.classList.remove('rangepicker_open');
      } else {
        this.element.classList.add('rangepicker_open');
      }
    } else if (targetCell) {
      if (this.to) {
        this.clearRange();

        targetCell.classList.add('rangepicker__selected-from');
        this.cellFrom = targetCell;
        this.from = new Date(targetCell.dataset.value);
        this.subElements.from.innerHTML = this.from.toLocaleDateString('ru-RU');
        this.to = null;
      } else {
        this.to = new Date(targetCell.dataset.value);

        if (this.to < this.from) {
          const tmp = this.from;
          this.from = this.to;
          this.to = tmp;
        }
        this.cellTo = targetCell;
        this.subElements.from.innerHTML = this.from.toLocaleDateString('ru-RU');
        this.subElements.to.innerHTML = this.to.toLocaleDateString('ru-RU');

        this.setRange();
        this.element.classList.remove('rangepicker_open');
        this.element.dispatchEvent(new CustomEvent('date-select',
          {
            bubbles: true,
          }));
      }
    } else {
      this.element.classList.remove('rangepicker_open');
    }
  };

  /*onInputPointerDown = (e) => {
    this.element.classList.add('rangepicker_open');
  };*/

  constructor({
    from = new Date(to.getMonth() - 1 < 0 ? to.getFullYear() - 1 : to.getFullYear(), to.getMonth() - 1, to.getDate()),
    to = new Date()
  }) {
    this.from = from;
    this.timeOffset = this.from.getTimezoneOffset();
    this.from.setMinutes(this.from.getMinutes() - this.timeOffset);
    this.to = to;
    this.to.setMinutes(this.to.getMinutes() - this.timeOffset);

    this.firstMonth = this.from.getMonth();
    this.secondMonth = this.to.getMonth();

    this.days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    this.render();
  }

  get template() {
    return `<div class="rangepicker">
    <div class="rangepicker__input" data-element="input">
      <span data-element="from">${this.from.toLocaleDateString('ru-RU')}</span> -
      <span data-element="to">${this.to.toLocaleDateString('ru-RU')}</span>
    </div>
    <div class="rangepicker__selector" data-element="selector">
    </div>
</div>`;
  }

  getDays() {
    return this.days.map((day) => `<div>${day}</div>`).join('');
  }

  getMonth(year, month) {
    //const date = new Date();
    let currentDate = new Date(year, month, 1, 0, -this.timeOffset);
    const firstDay = currentDate.getDay();
    const buttons = [];
    buttons.push(`<button type="button" class="rangepicker__cell"
            data-value="${currentDate.toISOString()}" style="--start-from: ${firstDay}">1
    </button>`);

    for (let d = 2; d <= 31; d++) {
      currentDate = new Date(year, month, d, 0, -this.timeOffset);
      if (currentDate.getMonth() === month) {
        buttons.push(`<button type="button" class="rangepicker__cell"
            data-value="${currentDate.toISOString()}">${d}
    </button>`);
      }
    }

    return buttons.join('');
  }

  getSelector() {
    return `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="${this.getMonthName(this.firstMonth, 'en')}">
            ${this.getMonthName(this.firstMonth, 'ru')}
          </time>
        </div>
        <div class="rangepicker__day-of-week">
            ${this.days.map((day) => `<div>${day}</div>`).join('')}
        </div>
        <div class="rangepicker__date-grid">
          ${this.getMonth(this.from.getFullYear(), this.firstMonth)}
        </div>
      </div>
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="${this.getMonthName(this.secondMonth, 'en')}">
            ${this.getMonthName(this.secondMonth, 'ru')}
          </time>
        </div>
        <div class="rangepicker__day-of-week">
          ${this.days.map((day) => `<div>${day}</div>`).join('')}
        </div>
        <div class="rangepicker__date-grid">
          ${this.getMonth(this.to.getFullYear(), this.secondMonth)}
        </div>
      </div>`;
  }

  getMonthName(month, locale) {
    const date = new Date();
    date.setMonth(month);
    return firstLetterCaps(date.toLocaleString(locale, {month: 'long'}));
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    document.body.append(this.element);

    this.initEventListeners();
  }

  renderSelector() {
    /*const selector = document.createElement('div');

    selector.innerHTML = this.getSelector();

    this.selector = selector.firstElementChild;*/


    this.subElements.selector.innerHTML = this.getSelector();
    this.cells = this.getCells(this.element);

    this.setRange();
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

  getCells(element) {
    const result = {};
    const elements = element.querySelectorAll('.rangepicker__cell');

    for (const cell of elements) {
      const name = cell.dataset.value;

      result[name] = cell;
    }

    return result;
  }

  setRange() {
    console.log(this.from.toISOString());

    if (!this.cellFrom) {
      this.cellFrom = this.element.querySelector(`[data-value='${this.from.toISOString()}']`);
    }
    if (this.to) {
      if (!this.cellTo) {
        this.cellTo = this.element.querySelector(`[data-value='${this.to.toISOString()}']`);
      }
      console.log(this.cellFrom);
      console.log(this.cellTo);
      this.cellFrom.classList.add('rangepicker__selected-from');
      this.cellTo.classList.add('rangepicker__selected-to');
      for (const cell of Object.values(this.cells)) {
        if (Date.parse(cell.dataset.value) > this.from
          && Date.parse(cell.dataset.value) < this.to) {
          cell.classList.add('rangepicker__selected-between');
        }
      }
    }
  }

  clearRange() {
    this.cellFrom.classList.remove('rangepicker__selected-from');
    this.cellTo.classList.remove('rangepicker__selected-to');
    for (const cell of Object.values(this.cells)) {
      if (Date.parse(cell.dataset.value) > this.from
        && Date.parse(cell.dataset.value) < this.to) {
        cell.classList.remove('rangepicker__selected-between');
      }
    }
  }

  initEventListeners() {
    document.addEventListener('pointerdown', this.onPointerDown);
    //this.subElements.input.addEventListener('pointerdown', this.onInputPointerDown);
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

function firstLetterCaps(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
