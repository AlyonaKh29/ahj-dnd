import Column from "./columns";

export default class Board {
  static get selectors() {
    return {
      column: ".column",
      card: ".card",
      cardsContainer: ".cards",
      content: ".content",
      closeBtn: ".close-btn",
    };
  }

  constructor() {
    this.columns = Array.from(
      document.querySelectorAll(Board.selectors.column),
    ).map((colEl) => new Column(colEl));
    this.draggedCard = null;
    this.phantom = null;
    this.placeholder = null;
    this.offsetX = 0;
    this.offsetY = 0;
    document.addEventListener("mousedown", (e) => this.onMouseDown(e));
    document.addEventListener("touchstart", (e) => this.onTouchStart(e), {
      passive: false,
    });
  }

  onMouseDown(e) {
    if (e.target.closest(Board.selectors.closeBtn)) {
      return;
    }
    const cardEl = e.target.closest(Board.selectors.card);
    if (cardEl) {
      e.preventDefault();
      this.startDrag(cardEl, e);
    }
  }

  onTouchStart(e) {
    if (e.target.closest(Board.selectors.closeBtn)) {
      return;
    }
    const cardEl = e.target.closest(Board.selectors.card);
    if (cardEl) {
      e.preventDefault();
      this.startDrag(cardEl, e);
    }
  }

  startDrag(cardEl, e) {
    this.draggedCard = cardEl;

    const rect = cardEl.getBoundingClientRect();
    if (e.type.startsWith("touch")) {
      this.offsetX = e.touches[0].clientX - rect.left;
      this.offsetY = e.touches[0].clientY - rect.top;
    } else {
      this.offsetX = e.clientX - rect.left;
      this.offsetY = e.clientY - rect.top;
    }

    this.phantom = cardEl.cloneNode(true);
    this.phantom.style.position = "absolute";
    this.phantom.style.width = rect.width + "px";
    this.phantom.style.pointerEvents = "none";
    this.phantom.style.opacity = "0.8";
    document.body.append(this.phantom);

    this.moveAt(e);

    this.draggedCard.style.visibility = "hidden";

    document.addEventListener("mousemove", (ev) => this.onMouseMove(ev));
    document.addEventListener("mouseup", (ev) => this.onMouseUp(ev));
    document.addEventListener("touchmove", (ev) => this.onTouchMove(ev), {
      passive: false,
    });
    document.addEventListener("touchend", (ev) => this.onTouchEnd(ev));
  }

  moveAt(e) {
    let x, y;
    if (e.type.startsWith("touch")) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }
    if (this.phantom) {
      this.phantom.style.left = x - this.offsetX + "px";
      this.phantom.style.top = y - this.offsetY + "px";
    }
  }

  onMouseMove(e) {
    e.preventDefault();
    this.moveAt(e);
    this.handleHover(e);
  }

  onTouchMove(e) {
    e.preventDefault();
    this.moveAt(e);
    this.handleHover(e);
  }

  handleHover(e) {
    const x = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
    const y = e.type.startsWith("touch") ? e.touches[0].clientY : e.clientY;
    const elemBelow = document.elementFromPoint(x, y);
    if (!elemBelow) return;

    const container = elemBelow.closest(Board.selectors.cardsContainer);
    if (!container || !this.draggedCard) return;

    const children = Array.from(container.children).filter(
      (c) => !c.classList.contains("placeholder"),
    );

    // Если колонка пустая (нет карточек кроме возможно перетаскиваемой).
    if (
      children.length === 0 ||
      (children.length === 1 && children[0] === this.draggedCard)
    ) {
      if (!this.placeholder || this.placeholder.parentNode !== container) {
        this.createPlaceholder();
        container.append(this.placeholder);
      }
      return;
    }

    if (!this.placeholder || this.placeholder.parentNode !== container) {
      this.createPlaceholder();
    }
    // при перемещении над своими краями - игнор.
    if (container.contains(this.draggedCard) && children.length <= 1) {
      this.removePlaceholder();
      return;
    }
    // проверка верхней границы. Вставляем перед первой карточкой.
    const firstCardRect = children[0].getBoundingClientRect();
    const isBeforeFirst = y < firstCardRect.top + firstCardRect.height * 0.3;

    // Проверка нижней границы. Вставляем после последней карточки.
    const lastCardRect = children[children.length - 1].getBoundingClientRect();
    const isAfterLast = y > lastCardRect.bottom - lastCardRect.height * 0.3;

    if (isBeforeFirst) {
      // позиционируем плейсхолдер.
      container.insertBefore(this.placeholder, children[0]);
    } else if (isAfterLast) {
      // проверка, что не пытаемся вставить после себя же.
      if (children[children.length - 1] !== this.draggedCard) {
        container.append(this.placeholder);
      }
    } else {
      this.positionPlaceholderBetweenCards(container, children, y); // Ищем позицию между карточками.
    }
  }

  createPlaceholder() {
    this.removePlaceholder();
    this.placeholder = document.createElement("div");
    this.placeholder.className = "placeholder";
    this.placeholder.style.height = this.draggedCard.offsetHeight + "px";
  }

  positionPlaceholderBetweenCards(container, children, y) {
    let foundPosition = false;

    for (let i = 0; i < children.length; i++) {
      if (children[i] === this.draggedCard) continue;
      const cardRect = children[i].getBoundingClientRect();
      const cardMiddle = cardRect.top + cardRect.height / 2;
      if (y < cardMiddle) {
        if (children[i] !== this.draggedCard) {
          container.insertBefore(this.placeholder, children[i]);
          foundPosition = true;
          break;
        }
      }
    }
    if (!foundPosition) {
      container.append(this.placeholder);
    }
  }

  onMouseUp(e) {
    this.finishDrag(e);
  }

  onTouchEnd(e) {
    this.finishDrag(e);
  }

  finishDrag(e) {
    const eventHandlers = {
      mousemove: (ev) => this.onMouseMove(ev),
      mouseup: (ev) => this.onMouseUp(ev),
      touchmove: (ev) => this.onTouchMove(ev),
      touchend: (ev) => this.onTouchEnd(ev),
    };
    Object.keys(eventHandlers).forEach((eventType) => {
      document.removeEventListener(eventType, eventHandlers[eventType]);
    });

    if (!this.draggedCard) return;

    const { clientX, clientY } = e.type.startsWith("touch")
      ? e.changedTouches[0]
      : e;
    const elemBelow = document.elementFromPoint(clientX, clientY);
    const container = elemBelow
      ? elemBelow.closest(Board.selectors.cardsContainer)
      : null;
    if (!this.placeholder || this.placeholder.parentNode !== container) {
      this.resetDragState();
      return;
    }
    if (this.draggedCard.parentNode === container) {
      this.draggedCard.remove();
    }

    container.insertBefore(this.draggedCard, this.placeholder);
    this.updateCardMetadataAndStorage(container);
    this.resetDragState();
  }

  resetDragState() {
    if (this.draggedCard) {
      this.draggedCard.style.visibility = "visible";
      this.draggedCard = null;
    }
    if (this.phantom) {
      this.phantom.remove();
      this.phantom = null;
    }
    this.removePlaceholder();
  }

  updateCardMetadataAndStorage(container) {
    const columnId = container.id;
    this.draggedCard.setAttribute("data-column", columnId);
    const cardId = this.draggedCard.dataset.id;
    this.updateCardColumnInStorage(cardId, columnId);
    this.updateCardsOrderInStorage();
  }

  updateCardColumnInStorage(cardId, newColumnId) {
    const data = JSON.parse(localStorage.getItem("cards")) || [];
    const cardIndex = data.findIndex((c) => c.id === cardId);
    if (cardIndex !== -1) {
      data[cardIndex].columnId = newColumnId;
      localStorage.setItem("cards", JSON.stringify(data));
    }
  }

  updateCardsOrderInStorage() {
    const data = [];
    this.columns.forEach((column) => {
      const colCards = column.element.querySelector(
        Board.selectors.cardsContainer,
      );
      const cards = Array.from(colCards.querySelectorAll(Board.selectors.card));
      const colId = colCards.id;
      cards.forEach((card, index) => {
        data.push({
          id: card.getAttribute("data-id"),
          content: card.querySelector(Board.selectors.content).textContent,
          columnId: colId,
          order: index,
        });
      });
    });
    localStorage.setItem("cards", JSON.stringify(data));
  }

  removePlaceholder() {
    if (this.placeholder && this.placeholder.parentNode) {
      this.placeholder.remove();
      this.placeholder = null;
    }
  }
}
