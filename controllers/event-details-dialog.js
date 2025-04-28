// controllers/eventDetailsController.js
import { initEventDetailsDialogView, fillEventDetailsDialog } from "../views/event-details-dialogView.js";

/**
 * Controller cho dialog chi tiết event:
 * - Nghe sự kiện 'event-click'
 * - Fill dữ liệu và mở dialog
 * - Bắt sự kiện click nút Delete/Edit, đóng dialog và dispatch request phù hợp
 */
export function initEventDetailsController() {
  const { dialogElement, open, close } = initEventDetailsDialogView();
  const deleteBtn = dialogElement.querySelector("[data-event-details-delete-button]");
  const editBtn = dialogElement.querySelector("[data-event-details-edit-button]");
  let currentEvent = null;

  document.addEventListener("event-click", (e) => {
    currentEvent = e.detail.event;
    fillEventDetailsDialog(dialogElement, currentEvent);
    open();
  });

  deleteBtn.addEventListener("click", () => {
    close().then(() => {
      deleteBtn.dispatchEvent(new CustomEvent("event-delete-request", {
        detail: { event: currentEvent },
        bubbles: true
      }));
    });
  });

  editBtn.addEventListener("click", () => {
    close().then(() => {
      editBtn.dispatchEvent(new CustomEvent("event-edit-request", {
        detail: { event: currentEvent },
        bubbles: true
      }));
    });
  });
}
