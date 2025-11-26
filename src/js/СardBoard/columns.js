import Card from "./card";
import Storage from "./storage";

export default class Column {
  static get selectors() {
    return {
      cardsContainer: ".cards",
      card: ".card",
      addButton: ".add-card-button",
      form: ".card-form",
      input: ".text-input",
      closeForm: ".close-form",
    };
  }

  constructor(element) {
    this.element = element;
    this.cardsContainer = this.element.querySelector(
      Column.selectors.cardsContainer,
    );
    this.addButton = this.element.querySelector(Column.selectors.addButton);
    this.form = this.element.querySelector(Column.selectors.form);
    this.input = this.element.querySelector(Column.selectors.input);
    this.closeForm = this.element.querySelector(Column.selectors.closeForm);

    if (!this.cardsContainer || !this.addButton) {
      throw new Error("Не удалось найти основные DOM элементы");
    }

    if (this.form && this.input && this.closeForm) {
      this.bindToDOM();
    }
  }

  bindToDOM() {
    this.element.addEventListener("click", this.handleElementClick.bind(this));
    this.form.addEventListener("submit", this.handleFormSubmit.bind(this));
    this.closeForm.addEventListener("click", this.hideForm.bind(this));
  }

  handleElementClick(e) {
    if (e.target.classList.contains("add-card-button")) {
      this.showForm();
      return;
    }
  }

  showForm() {
    this.form.style.display = "block";
    this.addButton.style.display = "none";
    this.input.focus();
  }

  hideForm() {
    this.form.style.display = "none";
    this.addButton.style.display = "block";
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const text = this.input.value.trim();
    if (!text) return;
    const id = this.generateUniqueId();
    const columnId = this.cardsContainer.id;
    const card = new Card(id, text, columnId);
    this.addCard(card);
    this.clearForm();
    this.hideForm();
    const index =
      Array.from(this.cardsContainer.querySelectorAll(Column.selectors.card))
        .length - 1;
    const storage = new Storage();
    storage.saveToLocalStorage(id, text, columnId, index);
  }

  addCard(card) {
    this.cardsContainer.append(card.element);
  }

  clearForm() {
    this.input.value = "";
  }

  generateUniqueId() {
    return (
      "id-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).substr(2, 9)
    );
  }

  getCards() {
    return Array.from(this.cardsContainer.children);
  }
}
