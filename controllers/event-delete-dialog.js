// controllers/eventDeleteController.js
import { initEventDeleteDialogView, fillEventDeleteDialog } from "../views/event-delete-dialogView.js";

/**
 * Controller cho dialog xoá sự kiện:
 * - Lắng nghe event-delete-request
 * - Fill dữ liệu và mở dialog
 * - Bắt click nút delete, đóng dialog, dispatch event-delete
 */
export function initEventDeleteController() {
  const { dialogElement, open, close } = initEventDeleteDialogView();
  const deleteButton = dialogElement.querySelector("[data-event-delete-button]");
  let currentEvent = null;

  document.addEventListener("event-delete-request", (e) => {
    currentEvent = e.detail.event;
    fillEventDeleteDialog(dialogElement, currentEvent);
    open();
  });

  deleteButton.addEventListener("click", () => {
    close();
    deleteButton.dispatchEvent(new CustomEvent("event-delete", {
      detail: currentEvent,
      bubbles: true
    }));
  });
}