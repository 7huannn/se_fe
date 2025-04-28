// views/eventDeleteDialogView.js
import { initDialog } from "./dialogView.js";

/**
 * Khởi tạo view cho dialog xoá sự kiện
 * @returns {{dialogElement: HTMLDialogElement, open: Function, close: Function}}
 */
export function initEventDeleteDialogView() {
  const dialogApi = initDialog("event-delete");
  return {
    dialogElement: dialogApi.dialogElement,
    open: dialogApi.open,
    close: dialogApi.close
  };
}

/**
 * Gán tiêu đề vào dialog xoá
 * @param {HTMLElement} parent - phần tử dialog
 * @param {{title: string}} event - đối tượng sự kiện
 */
export function fillEventDeleteDialog(parent, event) {
  const titleEl = parent.querySelector("[data-event-delete-title]");
  titleEl.textContent = event.title;
}
