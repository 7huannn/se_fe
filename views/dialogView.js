// views/dialogView.js
import { closeDialog } from "../controllers/dialog.js";

/**
 * Khởi tạo dialog:
 * - Bind sự kiện đóng
 * - Trả về API open/close
 * @param {string} name - data-dialog attribute
 */
export function initDialog(name) {
  const dialogSelector = `[data-dialog=${name}]`;
  const dialogElement = document.querySelector(dialogSelector);

  // Bind nút đóng
  const closeButtons = dialogElement.querySelectorAll("[data-dialog-close-button]");
  closeButtons.forEach(button => {
    button.addEventListener("click", () => {
      closeDialog(dialogElement);
    });
  });

  // Click ngoài vùng nội dung
  dialogElement.addEventListener("click", event => {
    if (event.target === dialogElement) {
      closeDialog(dialogElement);
    }
  });

  // ESC hoặc cancel
  dialogElement.addEventListener("cancel", event => {
    event.preventDefault();
    closeDialog(dialogElement);
  });

  return {
    dialogElement,
    open() {
      dialogElement.showModal();
    },
    close() {
      return closeDialog(dialogElement);
    }
  };
}
