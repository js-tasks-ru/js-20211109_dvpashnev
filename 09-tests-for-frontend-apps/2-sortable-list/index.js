export default class SortableList {
  items;
  subElements = {};

  onMouseDown = (event) => {
    const li = event.target.closest('.sortable-list__item');
    if (!li || !Object.values(this.subElements).find(el => el === li)) {
      return false;
    }
    let currentDroppable = null;
    const liBoundingClientRect = li.getBoundingClientRect();

    let placeHolder = document.createElement('div');
    this.element.prepend(placeHolder);
    placeHolder.className = 'sortable-list__placeholder';
    placeHolder.style.width = liBoundingClientRect.width + 'px';
    placeHolder.style.height = liBoundingClientRect.height + 'px';
    placeHolder.style.top = liBoundingClientRect.top + 'px';
    placeHolder.style.left = liBoundingClientRect.left + 'px';
    //placeHolder.style.position = 'absolute';

    const shiftX = event.clientX - liBoundingClientRect.left;
    const shiftY = event.clientY - liBoundingClientRect.top;
    const width = liBoundingClientRect.width;
    //console.log(li.getBoundingClientRect());
    //li.style.position = 'absolute';
    li.style.display = 'flex';
    li.style.width = width + 'px';
    li.style.zIndex = 10000;
    //document.body.append(li);

    moveAt(event.pageX, event.pageY);

    function moveAt(pageX, pageY) {
      //li.style.left = pageX - shiftX + 'px';
      li.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(event) {
      moveAt(event.clientX, event.clientY);
      li.style.display = 'none';
      let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      li.style.display = 'flex';

      /*if (!elemBelow.classList.contains('sortable-list__item')) {
        elemBelow = elemBelow.closest('li');
      }*/

      if (!elemBelow) {
        return;
      }

      let droppableBelow = elemBelow.closest('.sortable-list__item');
      /*if (li === droppableBelow) {
        droppableBelow = droppableBelow.closest('.sortable-list__item');
      }*/
      if (currentDroppable !== droppableBelow) {
        if (currentDroppable) { // null если мы были не над droppable до этого события
          // (например, над пустым пространством)
          leaveDroppable(currentDroppable);
        }
        currentDroppable = droppableBelow;
        if (currentDroppable) { // null если мы не над droppable сейчас, во время этого события
          // (например, только что покинули droppable)
          enterDroppable(currentDroppable);
        }
      }
    }

    document.addEventListener('mousemove', onMouseMove);

    document.onmouseup = function () {
      document.removeEventListener('mousemove', onMouseMove);
      document.onmouseup = null;
      if (placeHolder) {
        li.style.left = placeHolder.getBoundingClientRect().left + 'px';
        li.style.top = placeHolder.getBoundingClientRect().top + 'px';
        placeHolder.remove();
        placeHolder = null;
      }
    };

    function enterDroppable(elem) {
      elem.after(placeHolder);

      /*const left = elem.getBoundingClientRect().left;
      const top = elem.getBoundingClientRect().top;
      elem.style.left = placeHolder.getBoundingClientRect().left + 'px';
      elem.style.top = placeHolder.getBoundingClientRect().top + 'px';
      placeHolder.style.left = left + 'px';
      placeHolder.style.top = top + 'px';*/

      elem.style.background = 'pink';
    }

    function leaveDroppable(elem) {
      /*if (placeHolder) {
        placeHolder.remove();
      }*/

      elem.style.background = '';
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

    this.element.innerHTML = this.template;

    this.subElements = this.getSubElements(this.element);

    this.initEventListeners();
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
    document.ondragstart = () => false;
    document.addEventListener('mousedown', this.onMouseDown);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
