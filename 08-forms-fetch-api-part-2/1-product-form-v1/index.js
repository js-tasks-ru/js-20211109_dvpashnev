import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  product = {};
  categoriesNSubcategories = [];
  subElements = {};
  fields = {};

  onImageDeleteClick = (e) => {
    const li = e.target.closest('li');
    if (li && confirm('Удалить данное фото?')) {
      li.remove();
    }
  };

  onImageInputClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.addEventListener('change', this.onImageInputChange);

    this.subElements.fileInput = fileInput;

    //document.body.appendChild(fileInput);
    fileInput.click();
  };

  onImageInputChange = async () => {
    this.subElements.uploadImage.classList.add('is-loading');
    try {
      const [file] = this.subElements.fileInput.files;
      const result = await this.upload(file);

      alert('Изображение загружено');
      this.addImage(this.renderImage(result.data.link, file.name));
    } catch (error) {
      alert('Ошибка загрузки изображения');
      console.error(error);
    } finally {
      this.subElements.uploadImage.classList.remove('is-loading');
      alert('Готово!');
    }
  };

  onSubmit = async (event) => {
    event.preventDefault();

    await this.save();
  }

  constructor(productId) {
    this.productId = productId;

    this.categoriesNSubcategoriesUrl = new URL(`api/rest/categories`, BACKEND_URL);
    this.productUrl = new URL(`api/rest/products`, BACKEND_URL);
    this.productUrlWithId = new URL(`api/rest/products`, BACKEND_URL);
  }

  async loadCategoriesNSubcategories() {
    this.categoriesNSubcategoriesUrl.searchParams.set('_sort', 'weight');
    this.categoriesNSubcategoriesUrl.searchParams.set('_refs', 'subcategory');
    this.categoriesNSubcategories = await fetchJson(this.categoriesNSubcategoriesUrl);

    return this.categoriesNSubcategories;
  }

  getCategoriesOptions(data) {
    return data
      .map(category => category.subcategories
        .map(subcategory => `<option value="${subcategory.id}" ${this.product.subcategory === subcategory.id ? 'selected' : ''}>${category.title} &gt; ${subcategory.title}</option>`)
        .join(''))
      .join('');
  }

  async upload(file) {
    const formData = new FormData();

    formData.append('image', file);

    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
        },
        body: formData,
        referrer: ''
      });

      return await response.json();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  getImageList(images) {
    return images ? images
      .map(image => this.renderImage(image.url, image.source))
      .join('') : '';
  }

  addImage(image) {
    const ul = this.subElements.imageListContainer.firstElementChild;
    const li = document.createElement('li');
    li.innerHTML = image;
    ul.append(li);
  }

  renderImage(url = '', source = '') {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
               <input type="hidden" name="url" value="${url}">
               <input type="hidden" name="source" value="${source}">
              <span>
                <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                <img class="sortable-table__cell-img" alt="Image" src="${url}">
                <span>${source}</span>
              </span>
              <button type="button">
                <img src="icon-trash.svg" data-delete-handle="" alt="delete">
              </button>
            </li>`;
  }

  get template() {
    return `<div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" id="title"
          class="form-control" placeholder="Название товара"
          value="${this.product.title ? escapeHtml(this.product.title) : ''}" />
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" id="description"
          data-element="productDescription" placeholder="Описание товара">${this.product.description ? escapeHtml(this.product.description) : ''}</textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
          <ul class="sortable-list">
            ${this.getImageList(this.product.images)}
          </ul>
          </div>
        <button type="button" name="uploadImage" class="button-primary-outline">
          <span>Загрузить</span>
        </button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory" id="subcategory">
          ${this.getCategoriesOptions(this.categoriesNSubcategories)}
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" id="price" class="form-control" placeholder="100"
          value="${this.product.price ? this.product.price : ''}">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0"
          value="${this.product.discount ? this.product.discount : ''}">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1"
          value="${this.product.quantity ? this.product.quantity : ''}">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status" id="status">
          <option value="1" ${this.product.status === '1' ? 'selected' : ''}>Активен</option>
          <option value="0" ${this.product.status === '0' ? 'selected' : ''}>Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    </form>`;
  }

  async render() {
    await this.loadCategoriesNSubcategories();

    if (this.productId) {
      this.productUrlWithId.searchParams.set('id', this.productId);

      this.product = (await fetchJson(this.productUrlWithId))[0];
    }

    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
    this.fields = this.getFields(this.element);

    this.initEventListeners();
    document.body.append(this.element);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    result.imageListContainer
      = result['sortable-list-container'].querySelector('[data-element="imageListContainer"]');

    result.uploadImage = this.element.querySelector('[name="uploadImage"]');

    return result;
  }

  getFields(element) {
    const result = {};
    const fields = element.querySelectorAll('[id]');

    for (const field of fields) {
      result[field.id] = field;
    }

    return result;
  }

  initEventListeners() {
    this.subElements.uploadImage.addEventListener('click', this.onImageInputClick);
    this.element.addEventListener('pointerdown', this.onImageDeleteClick);
    this.element.addEventListener('submit', this.onSubmit);
  }

  async save() {
    let images = [];
    for (const elem of this.subElements.imageListContainer.firstElementChild.children) {
      const inputs = elem.querySelectorAll('input');

      if (inputs.length > 0) {
        images.push({url: inputs[0].value, source: inputs[1].value});
      }
    }

    for (const [field, element] of Object.entries(this.fields)) {
      this.product[field]
        = element.type === 'number' || field === 'status'
          ? parseInt(element.value)
          : escapeHtml(element.value);
    }

    this.product.images = images;

    try {
      const response = await fetch(this.productUrl.toString(), {
        method: this.product.id ? "PATCH" : "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(this.product),
        referrer: ''
      });

      alert('Товар сохранён');

      this.element.dispatchEvent(new CustomEvent(this.product.id ? 'product-updated' : 'product-saved',
        {
          bubbles: true,
        }));

      return await response.json();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
