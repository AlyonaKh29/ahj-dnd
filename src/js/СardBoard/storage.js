export default class Storage {
  static get selectors() {
    return {
      card: ".card",
      cardsContainer: ".cards",
      content: ".content",
    };
  }

  updateCardMetadataAndStorage(containerId, draggedCard, columns) {
    const columnId = containerId;
    draggedCard.setAttribute("data-column", columnId);
    const cardId = draggedCard.dataset.id;
    this.updateCardColumnInStorage(cardId, columnId);
    this.updateCardsOrderInStorage(columns);
  }

  updateCardColumnInStorage(cardId, newColumnId) {
    const data = JSON.parse(localStorage.getItem("cards")) || [];
    const cardIndex = data.findIndex((c) => c.id === cardId);
    if (cardIndex !== -1) {
      data[cardIndex].columnId = newColumnId;
      localStorage.setItem("cards", JSON.stringify(data));
    }
  }

  updateCardsOrderInStorage(columns) {
    const data = [];
    columns.forEach((column) => {
      const colCards = column.element.querySelector(
        Storage.selectors.cardsContainer,
      );
      const cards = Array.from(
        colCards.querySelectorAll(Storage.selectors.card),
      );
      const colId = colCards.id;
      cards.forEach((card, index) => {
        data.push({
          id: card.getAttribute("data-id"),
          content: card.querySelector(Storage.selectors.content).textContent,
          columnId: colId,
          order: index,
        });
      });
    });
    localStorage.setItem("cards", JSON.stringify(data));
  }

  updateLocalStorageOnRemove(dataId) {
    const data = JSON.parse(localStorage.getItem("cards")) || [];
    const newData = data.filter((card) => card.id !== dataId);
    localStorage.setItem("cards", JSON.stringify(newData));
  }

  saveToLocalStorage(id, text, columnId, index) {
    const data = JSON.parse(localStorage.getItem("cards")) || [];
    data.push({ id, content: text, columnId, order: index });
    localStorage.setItem("cards", JSON.stringify(data));
  }
}
