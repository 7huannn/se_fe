// views/eventCreateView.js
import { handleEventCreateButton } from "../controllers/eventCreateController.js";

/**
 * Khởi tạo tất cả các nút tạo event trên trang
 */
export function initEventCreateButtons() {
  const buttonElements = document.querySelectorAll("[data-event-create-button]");
  buttonElements.forEach(handleEventCreateButton);
}