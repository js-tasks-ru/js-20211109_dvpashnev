export default class SortableList {
  items;
  subElements = {};

  onPointerDown = event => {
    if (event.target.dataset.grabHandle === '') {
      const li = event.target.closest('.sortable-list__item')
          ?? event.target.parentElement.closest('.sortable-list__item');

      console.log(li);
      console.log(event.target);
      if (!li) {
        return false;
      }

      let droppableBelow = null;
      const liBoundingClientRect = li.getBoundingClientRect();

      let placeHolder = document.createElement('div');
      placeHolder.className = 'sortable-list__placeholder';
      placeHolder.style.width = liBoundingClientRect.width + 'px';
      placeHolder.style.height = liBoundingClientRect.height + 'px';
      placeHolder.style.top = liBoundingClientRect.top + 'px';
      placeHolder.style.left = liBoundingClientRect.left + 'px';
      li.before(placeHolder);

      const shiftX = event.clientX - liBoundingClientRect.left;
      const shiftY = event.clientY - liBoundingClientRect.top;
      const width = liBoundingClientRect.width;
      li.classList.add('sortable-list__item_dragging');
      li.style.width = width + 'px';
      this.element.append(li);

      moveAt(event.clientX, event.clientY);

      function moveAt(pageX, pageY) {
        li.style.left = pageX - shiftX + 'px';
        li.style.top = pageY - shiftY + 'px';
      }

      function onPointerMove(event) {
        moveAt(event.clientX, event.clientY);
        li.style.display = 'none';
        let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
        li.style.display = 'flex';

        if (!elemBelow) {
          return;
        }

        droppableBelow = elemBelow.closest('.sortable-list__item');
        if (droppableBelow) {
          enterDroppable(droppableBelow);
        }
      }

      document.addEventListener('pointermove', onPointerMove);

      document.onpointerup = function (event) {
        document.removeEventListener('pointermove', onPointerMove);
        document.onpointerup = null;
        if (placeHolder) {
          placeHolder.before(li);
          li.classList.remove('sortable-list__item_dragging');
          li.style = '';

          placeHolder.remove();
          placeHolder = null;
        }
      };

      function enterDroppable(elem) {
        if (elem.getBoundingClientRect().top > placeHolder.getBoundingClientRect().top) {
          elem.after(placeHolder);
        } else {
          elem.before(placeHolder);
        }
      }
    }
  }

  onItemDeleteClick = (e) => {
    if (e.target.dataset.deleteHandle === '') {
      const li = e.target.closest('li');
      if (li) {
        li.remove();
      }
    }
  };

  constructor({
    items = []
  }) {
    this.items = items;

    this.render();
  }

  get template() {
    return `${this.items.map(li => {
      li.classList.add('sortable-list__item');
      return li.outerHTML;
    }).join('')}`;
  }

  render() {
    this.element = document.createElement('ul');
    this.element.className = 'sortable-list';

    this.element.innerHTML = this.template;

    this.subElements = this.getSubElements(this.element);

    this.initEventListeners();

    return this.element;
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('.sortable-list__item');
    let i = 1;
    for (const subElement of elements) {
      result['item' + i++] = subElement;
    }

    return result;
  }

  initEventListeners() {
    document.addEventListener('pointerdown', this.onItemDeleteClick);
    document.ondragstart = () => false;
    document.addEventListener('pointerdown', this.onPointerDown);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointerdown', this.onItemDeleteClick);
    document.removeEventListener('pointerdown', this.onPointerDown);
  }
}
