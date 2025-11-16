import Board from "../СardBoard/board";
import Card from "../СardBoard/card";

export function boardStart() {
  new Board();
  const data = JSON.parse(localStorage.getItem("cards")) || [];
  console.log(data);
  data.forEach(({ id, content, columnId, order }) => {
    const card = new Card(id, content, columnId, order);
    const columnContainer = document.querySelector(`#${columnId}`);
    if (columnContainer) {
      columnContainer.append(card.element);
    }
  });
}

document.addEventListener("DOMContentLoaded", boardStart);
