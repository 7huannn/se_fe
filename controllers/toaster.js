// controllers/toasterController.js
import {
  createToasterElement,
  createToastElement,
  animateToast
} from "../views/toasterView.js";

/**
 * Khởi tạo toaster trên parent và trả về API success/error
 * @param {HTMLElement} parent
 * @returns {{success: (msg:string)=>void, error:(msg:string)=>void}}
 */
export function initToaster(parent) {
  const toasterEl = createToasterElement(parent);

  return {
    success(message) {
      const toast = createToastElement(message, "success");
      animateToast(toasterEl, toast);
    },
    error(message) {
      const toast = createToastElement(message, "error");
      animateToast(toasterEl, toast);
    }
  };
}