class Tooltip {
  element;
  tooltip = '';
  static instance;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    this.move = this.move.bind(this);

    Tooltip.instance = this;
  }

  get template() {
    return `<div class="tooltip">${this.tooltip}</div>`;
  }

  render(tooltip) {
    this.tooltip = tooltip;

    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    if (tooltip !== undefined) {
      document.body.prepend(this.element);
    }
  }

  initialize() {
    this.render();
    this.initEventListeners();
  }

  move(event) {
    this.element.style.left = (event.pageX + 5) + 'px';
    this.element.style.top = (event.pageY + 5) + 'px';
  }

  initEventListeners() {
    document.addEventListener('pointerover', (event) => {
      if (event.target.dataset.tooltip !== undefined) {
        this.render(event.target.dataset.tooltip);
        this.move(event);

        event.target.addEventListener('pointermove', this.move);
      }
    });

    document.addEventListener('pointerout', (event) => {
      if (event.target.dataset.tooltip !== undefined) {
        event.target.removeEventListener('pointermove', this.move);
        this.remove();
      }
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}

export default Tooltip;
