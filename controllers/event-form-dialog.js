// controllers/eventFormController.js
import { initDialog } from "../views/dialogView.js";
import { initEventForm } from "../views/event-form-dialogView.js";
import { initToaster } from "../views/toasterView.js";

/**
 * Controller cho dialog tạo/sửa event:
 * - Lắng nghe event-create-request và event-edit-request
 * - Thay đổi tiêu đề dialog, chuyển form sang đúng mode và mở dialog
 * - Đóng dialog khi form phát ra sự kiện tạo/sửa
 */
export function initEventFormController() {
  const { dialogElement, open, close } = initDialog("event-form");
  const toaster = initToaster(dialogElement);
  const eventForm = initEventForm(toaster);
  const titleEl = dialogElement.querySelector("[data-dialog-title]");
  

  document.addEventListener("event-create-request", e => {
    titleEl.textContent = "Create event";
    eventForm.switchToCreateMode(
      e.detail.date,
      e.detail.startTime,
      e.detail.endTime
    );
    open();
  });

  document.addEventListener("event-edit-request", e => {
    titleEl.textContent = "Edit event";
    eventForm.switchToEditMode(e.detail.event);
    open();
  });

  dialogElement.addEventListener("close", () => {
    eventForm.reset();
  });

  eventForm.formElement.addEventListener("event-create", () => {
    close();
  });

  eventForm.formElement.addEventListener("event-edit", () => {
    close();
  });
}