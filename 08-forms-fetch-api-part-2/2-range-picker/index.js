const LAST_MONTH_NUMBER = 11;
const FIRST_MONTH_NUMBER = 0;

export default class RangePicker {
  element;
  subElements = {};
  cells = {};
  inputSubElements = {};

  onInputClick = (e) => {
    const targetInput = this.inputSubElements.hasOwnProperty(e.target.dataset.element);
    if (targetInput) {
      if (!this.subElements.selector.children.length) {
        this.renderSelector();
      }
      if (this.element.classList.contains('rangepicker_open')) {
        this.element.classList.remove('rangepicker_open');
      } else {
        this.element.classList.add('rangepicker_open');
      }
      if (!this.firstClick) {
        this.firstSelectedCell.classList.remove('rangepicker__selected-from');
        this.subElements.from.innerHTML = this.from.toLocaleDateString('ru-RU');
        this.firstClick = true;
      }
      this.setRange();
    }
  };

  onCellClick = (e) => {
    const targetCell = this.cells.hasOwnProperty(e.target.dataset.value);
    if (targetCell) {
      if (this.firstClick) {
        this.clearRange();

        this.firstSelectedCell = e.target;
        this.firstSelectedCell.classList.add('rangepicker__selected-from');
        this.firstSelectedDate = new Date(this.firstSelectedCell.dataset.value);
        this.subElements.from.innerHTML = this.firstSelectedDate.toLocaleDateString('ru-RU');
        this.firstClick = false;
      } else {
        const nextTo = new Date(e.target.dataset.value);
        this.from = this.firstSelectedDate;
        this.to = nextTo;
        this.cellFrom = this.firstSelectedCell;
        if (this.to < this.from) {
          const tmp = this.from;
          this.from = this.to;
          this.to = tmp;
        }
        this.cellTo = e.target;
        this.subElements.from.innerHTML = this.from.toLocaleDateString('ru-RU');
        this.subElements.to.innerHTML = this.to.toLocaleDateString('ru-RU');

        this.setRange();
        this.element.classList.remove('rangepicker_open');
        this.element.dispatchEvent(new CustomEvent('date-select',
          {
            bubbles: true,
          }));
        this.firstClick = true;
      }
    }
  };

  onArrowClick = (e) => {
    const rightArrow = e.target === this.subElements.rightArrow;
    const leftArrow = e.target === this.subElements.leftArrow;
    if (rightArrow) {
      this.firstMonth = parseInt(this.firstMonth) + 1;
      this.secondMonth = parseInt(this.secondMonth) + 1;
      if (this.secondMonth > LAST_MONTH_NUMBER) {
        this.secondMonth = FIRST_MONTH_NUMBER;
        this.secondYear = parseInt(this.secondYear) + 1;
      }
      if (this.firstMonth > LAST_MONTH_NUMBER) {
        this.firstMonth = FIRST_MONTH_NUMBER;
        this.firstYear = parseInt(this.firstYear) + 1;
      }
      this.renderCalendars();
    } else if (leftArrow) {
      this.firstMonth = parseInt(this.firstMonth) - 1;
      this.secondMonth = parseInt(this.secondMonth) - 1;
      if (this.firstMonth < FIRST_MONTH_NUMBER) {
        this.firstMonth = LAST_MONTH_NUMBER;
        this.firstYear = parseInt(this.firstYear) - 1;
      }
      if (this.secondMonth < FIRST_MONTH_NUMBER) {
        this.secondMonth = LAST_MONTH_NUMBER;
        this.secondYear = parseInt(this.secondYear) - 1;
      }
      this.renderCalendars();
    }
  };

  onOtherClick = (e) => {
    const targetInput = this.inputSubElements.hasOwnProperty(e.target.dataset.element);
    const targetCell = this.cells.hasOwnProperty(e.target.dataset.value);
    const rightArrow = e.target === this.subElements.rightArrow;
    const leftArrow = e.target === this.subElements.leftArrow;
    if (!targetInput && !targetCell && !rightArrow && !leftArrow) {
      if (!this.firstClick) {
        this.firstSelectedCell.classList.remove('rangepicker__selected-from');
        this.subElements.from.innerHTML = this.from.toLocaleDateString('ru-RU');
        this.setRange();
        this.firstClick = true;
      }
      this.firstMonth = this.from.getMonth();
      this.secondMonth = this.to.getMonth();
      this.element.classList.remove('rangepicker_open');
    }
  };

  constructor({
    from = new Date(to.getMonth() - 1 < 0
      ? to.getFullYear() - 1
      : to.getFullYear(), to.getMonth() - 1, to.getDate()),
    to = new Date()
  }) {
    this.from = from;
    this.timeOffset = this.from.getTimezoneOffset();
    this.from.setMinutes(this.from.getMinutes() - this.timeOffset);
    this.to = to;
    this.to.setMinutes(this.to.getMinutes() - this.timeOffset);

    this.firstMonth = this.from.getMonth();
    this.secondMonth = this.to.getMonth();
    this.firstYear = this.from.getFullYear();
    this.secondYear = this.to.getFullYear();
    this.firstSelectedDate = this.from;
    this.secondSelectedDate = this.to;
    this.firstSelectedCell = null;
    this.firstClick = true;

    this.days = [];
    const today = new Date();
    let firstWeekDay = ((today.getDate() - today.getDay()) + 1);
    for (let d = 0; d < 7; d++) {
      this.days.push(new Date(today.setDate(firstWeekDay++)).toLocaleString('ru', {weekday: "short"}));
    }

    this.render();
  }

  get template() {
    return `<div class="rangepicker">
    <div class="rangepicker__input" data-element="input">
      <span data-element="from">${this.from.toLocaleDateString('ru-RU')}</span> -
      <span data-element="to">${this.to.toLocaleDateString('ru-RU')}</span>
    </div>
    <div class="rangepicker__selector" data-element="selector"></div>
</div>`;
  }

  getDays() {
    return this.days.map((day) => `<div>${day}</div>`).join('');
  }

  getMonth(year, month) {
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
      <div class="rangepicker__calendar"></div>
      <div class="rangepicker__calendar"></div>`;
  }

  getCalendar(month, year) {
    return `<div class="rangepicker__month-indicator">
          <time datetime="${this.getMonthName(month, 'en')}">
            ${this.getMonthName(month, 'ru')}
          </time>
        </div>
        <div class="rangepicker__day-of-week">
            ${this.days.map((day) => `<div>${day}</div>`).join('')}
        </div>
        <div class="rangepicker__date-grid">
          ${this.getMonth(year, month)}
        </div>`;
  }

  renderCalendars() {
    this.calendars.first.innerHTML = this.getCalendar(this.firstMonth, this.firstYear);
    this.calendars.second.innerHTML = this.getCalendar(this.secondMonth, this.secondYear);
    this.cells = this.getCells(this.element);
    this.setRange();
  }

  getMonthName(month, locale) {
    const date = new Date();
    date.setMonth(month);
    return date.toLocaleString(locale, {month: 'long'});
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
    this.subElements.selector.innerHTML = this.getSelector();
    this.calendars = this.getCalendars(this.element);

    this.subElements.rightArrow = this.subElements.selector.querySelector('.rangepicker__selector-control-right');
    this.subElements.leftArrow = this.subElements.selector.querySelector('.rangepicker__selector-control-left');

    this.renderCalendars();
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;

      if (name === 'input') {
        this.inputSubElements[name] = subElement;
        const inputElements = subElement.querySelectorAll('[data-element]');

        for (const inputElement of inputElements) {
          this.inputSubElements[inputElement.dataset.element] = inputElement;
        }
      }
    }

    return result;
  }

  getCalendars(element) {
    const result = {};
    const elements = element.querySelectorAll('.rangepicker__calendar');

    result.first = elements[0];
    result.second = elements[1];

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
    if (!this.cellFrom) {
      this.cellFrom = this.element.querySelector(`[data-value='${this.from.toISOString()}']`);
    }
    if (!this.cellTo) {
      this.cellTo = this.element.querySelector(`[data-value='${this.to.toISOString()}']`);
    }
    this.cellFrom.classList.add('rangepicker__selected-from');
    this.cellTo.classList.add('rangepicker__selected-to');
    for (const cell of Object.values(this.cells)) {
      if (Date.parse(cell.dataset.value) > this.from.getTime()
        && Date.parse(cell.dataset.value) < this.to.getTime()) {
        cell.classList.add('rangepicker__selected-between');
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
    document.addEventListener('click', this.onOtherClick, true);
    document.addEventListener('click', this.onInputClick);
    document.addEventListener('click', this.onArrowClick);
    document.addEventListener('click', this.onCellClick);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('click', this.onOtherClick, true);
    document.removeEventListener('click', this.onInputClick);
    document.removeEventListener('click', this.onArrowClick);
    document.removeEventListener('click', this.onCellClick);
  }
}

