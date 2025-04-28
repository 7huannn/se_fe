// controllers/event-create-button.js
import { getDate } from "../models/url.js";

// Lưu trữ ngày hiện tại và cập nhật khi URL thay đổi
let selectedDate = getDate();
document.addEventListener("date-change", event => {
  selectedDate = event.detail.date;
});

/**
 * Xử lý sự kiện click cho một nút tạo event
 * @param {HTMLElement} buttonElement
 */
export function handleEventCreateButton(buttonElement) {
  buttonElement.addEventListener("click", () => {
    buttonElement.dispatchEvent(new CustomEvent("event-create-request", {
      detail: {
        date: selectedDate,
        startTime: 600,
        endTime: 960
      },
      bubbles: true
    }));
  });
}

/**
 * Khởi tạo tất cả nút [data-event-create-button]
 */
export function initEventCreateController() {
  const buttons = document.querySelectorAll("[data-event-create-button]");
  buttons.forEach(handleEventCreateButton);
}
