export default class Card {
  constructor(id, text, columnId) {
    this.columnId = columnId;
    this.id = id;
    this.element = this.createCardElement(text);
    this.element.querySelector(".close-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      this.remove();
    });
  }

  createCardElement(text) {
    const element = document.createElement("div");
    element.className = "card";
    element.setAttribute("data-id", this.id);
    element.setAttribute("data-column", this.columnId);
    element.draggable = false;
    element.innerHTML = `
      <div class="content">${text}</div>
      <div class="btn-close-card">
        <button class="close-btn">&#10007</button>
      </div>
    `;
    return element;
  }

  remove() {
    this.element.remove();
    this.updateLocalStorageOnRemove();
  }

  updateLocalStorageOnRemove() {
    const data = JSON.parse(localStorage.getItem("cards")) || [];
    const newData = data.filter((card) => card.id !== this.id);
    localStorage.setItem("cards", JSON.stringify(newData));
  }
}
