// controllers/notificationsController.js
import { initToaster } from "../views/toasterView.js";
import { notifyEventCreated, notifyEventDeleted, notifyEventEdited } from "../views/notificationsView.js";

/**
 * Controller để khởi tạo notifications:
 * - Bắt các sự kiện event-create, event-delete, event-edit
 * - Gọi hàm view tương ứng để hiển thị toaster
 */
export function initNotificationsController() {
  const toaster = initToaster(document.body);

  document.addEventListener("event-create", () => {
    notifyEventCreated(toaster);
  });

  document.addEventListener("event-delete", () => {
    notifyEventDeleted(toaster);
  });

  document.addEventListener("event-edit", () => {
    notifyEventEdited(toaster);
  });
}