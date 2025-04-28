// controllers/eventListController.js
import { renderEventListItem } from "../views/event-listView.js";

/**
 * Controller cho danh sách sự kiện:
 * @param {HTMLElement} parent - phần tử chứa toàn bộ calendar hoặc section list
 * @param {Array<Object>} events - mảng event data
 */
export function initEventListController(parent, events) {
  const listEl = parent.querySelector("[data-event-list]");

  // Ngăn sự kiện click lan lên parent (ví dụ để đóng dialog)
  listEl.addEventListener("click", e => e.stopPropagation());

  // Render từng event
  events.forEach(evt => {
    renderEventListItem(listEl, evt);
  });
}