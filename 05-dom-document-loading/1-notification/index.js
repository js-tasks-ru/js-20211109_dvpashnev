export default class NotificationMessage {
  static element;
  element = NotificationMessage.element;

  constructor(
    note = 'Hello World',
    {
      duration = 200,
      type = 'success'
    } = {}) {
    this.note = note;
    this.duration = duration;
    this.type = type;

    this.render();
    this.initEventListeners();
  }

  get template() {
    return `
    <div class="notification ${this.type}" style="--value:${(this.duration/1000).toFixed()}s">
    <div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">${this.type}</div>
      <div class="notification-body">
        ${this.note}
      </div>
    </div>
  </div>
    `;
  }

  render() {
    if (NotificationMessage.element) {
      this.destroy();
    }
    const element = document.createElement('div');

    element.innerHTML = this.template;

    NotificationMessage.element = element.firstElementChild;
    this.element = NotificationMessage.element;

    setTimeout(() => this.destroy(), this.duration);
  }

  show(targetElement = document.body) {
    this.render();
    targetElement.append(this.element);
  }

  initEventListeners() {

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
