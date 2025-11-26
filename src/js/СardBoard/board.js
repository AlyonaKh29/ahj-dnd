import Column from "./columns";
import Storage from "./storage";

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
    this._onMouseMove = this.onMouseMove.bind(this);
    this._onMouseUp = this.onMouseUp.bind(this);
    this._onTouchMove = this.onTouchMove.bind(this);
    this._onTouchEnd = this.onTouchEnd.bind(this);
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
    this.originalContainer = cardEl.closest(Board.selectors.cardsContainer);
    const rect = cardEl.getBoundingClientRect();
    this.placeholderHeight = rect.height;
    if (e.type.startsWith("touch")) {
      this.offsetX = e.touches[0].clientX - rect.left;
      this.offsetY = e.touches[0].clientY - rect.top;
    } else {
      this.offsetX = e.clientX - rect.left;
      this.offsetY = e.clientY - rect.top;
    }

    this.createPlaceholder();
    cardEl.parentNode.replaceChild(this.placeholder, cardEl);

    this.phantom = cardEl.cloneNode(true);
    this.phantom.style.position = "absolute";
    this.phantom.style.width = rect.width + "px";
    this.phantom.style.pointerEvents = "none";
    this.phantom.style.opacity = "0.8";
    document.body.append(this.phantom);

    this.moveAt(e);

    this.draggedCard.style.visibility = "hidden";

    document.addEventListener("mousemove", this._onMouseMove);
    document.addEventListener("mouseup", this._onMouseUp);
    document.addEventListener("touchmove", this._onTouchMove, {
      passive: false,
    });
    document.addEventListener("touchend", this._onTouchEnd);
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

    if (!this.phantom) return;

    const containerRect = this.originalContainer.getBoundingClientRect();
    if (y - this.offsetY < containerRect.top) {
      y = containerRect.top + this.offsetY;
    }
    this.phantom.style.left = x - this.offsetX + "px";
    this.phantom.style.top = y - this.offsetY + "px";
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
    if (!container || !this.draggedCard) {
      if (
        this.placeholder &&
        this.originalContainer &&
        !this.originalContainer.contains(this.placeholder)
      ) {
        this.originalContainer.append(this.placeholder);
      }
      return;
    }
    const children = Array.from(
      container.querySelectorAll(Board.selectors.card),
    );

    // Если колонка пустая (нет карточек кроме возможно перетаскиваемой).
    if (children.length === 0) {
      if (!this.placeholder || this.placeholder.parentNode !== container) {
        this.createPlaceholder();
        container.append(this.placeholder);
      }
      return;
    }
    // Если картчка перетаскивается в другую колонку, то создать там плейсхолдер.
    if (!this.placeholder || this.placeholder.parentNode !== container) {
      this.createPlaceholder();
    }
    // Если карточка в колонке единственная.
    if (children.length === 1 && children[0] === this.draggedCard) {
      return;
    }
    const firstCardRect = children[0].getBoundingClientRect();
    const isBeforeFirst = y < firstCardRect.top + firstCardRect.height * 0.3;
    const lastCardRect = children[children.length - 1].getBoundingClientRect();
    const isAfterLast = y > lastCardRect.bottom - lastCardRect.height * 0.3;
    if (isBeforeFirst) {
      // позиционируем плейсхолдер.
      container.insertBefore(this.placeholder, children[0]);
    } else if (isAfterLast) {
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
    this.placeholder.style.height = this.placeholderHeight + "px";
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
    document.removeEventListener("mousemove", this._onMouseMove);
    document.removeEventListener("mouseup", this._onMouseUp);
    document.removeEventListener("touchmove", this._onTouchMove);
    document.removeEventListener("touchend", this._onTouchEnd);
    if (!this.draggedCard) return;

    const { clientX, clientY } = e.type.startsWith("touch")
      ? e.changedTouches[0]
      : e;
    const elemBelow = document.elementFromPoint(clientX, clientY);
    const container = elemBelow
      ? elemBelow.closest(Board.selectors.cardsContainer)
      : null;

    // Если отпустили мышь не над контейнером, то вернуть карточку на прежнее место.
    if (!container) {
      if (this.placeholder && this.originalContainer) {
        this.originalContainer.insertBefore(this.draggedCard, this.placeholder);
      } else if (this.originalContainer) {
        this.originalContainer.append(this.draggedCard);
      }
      this.resetDragState();
      return;
    }

    if (!this.placeholder || this.placeholder.parentNode !== container) {
      this.resetDragState();
      return;
    }
    if (this.draggedCard.parentNode === container) {
      this.draggedCard.remove();
    }

    container.insertBefore(this.draggedCard, this.placeholder);
    const storage = new Storage();
    storage.updateCardMetadataAndStorage(
      container.id,
      this.draggedCard,
      this.columns,
    );
    this.resetDragState();
  }

  removePlaceholder() {
    if (this.placeholder && this.placeholder.parentNode) {
      this.placeholder.remove();
      this.placeholder = null;
    }
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
}
