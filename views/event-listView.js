// views/eventListView.js
import { initStaticEvent } from "./eventView.js";

// Lấy template một lần, tái sử dụng
const templateEl = document.querySelector("[data-template='event-list-item']");

/**
 * Render một item event vào container
 * @param {HTMLElement} container
 * @param {Object} event
 */
export function renderEventListItem(container, event) {
  // Clone template
  const fragment = templateEl.content.cloneNode(true);
  const itemEl = fragment.querySelector("[data-event-list-item]");

  // Sử dụng hàm model để dựng nội dung cơ bản
  initStaticEvent(itemEl, event);

  // Thêm vào DOM
  container.appendChild(itemEl);
}