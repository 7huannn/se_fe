// views/toasterView.js
import { waitUntilAnimationsFinish } from "../controllers/animation.js";

/**
 * Tạo và append toaster container
 * @param {HTMLElement} parent
 * @returns {HTMLElement} toaster element
 */
export function createToasterElement(parent) {
  const el = document.createElement("div");
  el.classList.add("toaster");
  parent.appendChild(el);
  return el;
}

/**
 * Tạo toast element với message và type
 * @param {string} message
 * @param {"success"|"error"} type
 * @returns {HTMLElement} toast element
 */
export function createToastElement(message, type) {
  const el = document.createElement("div");
  el.textContent = message;
  el.classList.add("toast", `toast--${type}`);
  return el;
}

/**
 * Hiển thị animation cho toast và tự remove sau khi xong
 * @param {HTMLElement} toasterEl
 * @param {HTMLElement} toastEl
 */
export function animateToast(toasterEl, toastEl) {
  const beforeHeight = toasterEl.offsetHeight;
  toasterEl.appendChild(toastEl);
  const afterHeight = toasterEl.offsetHeight;
  const diff = afterHeight - beforeHeight;

  toasterEl.animate([
    { transform: `translate(0, ${diff}px)` },
    { transform: "translate(0, 0)" }
  ], {
    duration: 150,
    easing: "ease-out"
  });

  waitUntilAnimationsFinish(toastEl)
    .then(() => {
      toasterEl.removeChild(toastEl);
    })
    .catch(error => {
      console.error("Finish toast animation promise failed", error);
    });
}

export function initToaster(parent) {
  const toasterEl = createToasterElement(parent);

  function _toast(message, type = "success") {
    const toastEl = createToastElement(message, type);
    animateToast(toasterEl, toastEl);
  }

  return {
    toast: _toast,
    success(message) { _toast(message, "success"); },
    error(message)   { _toast(message, "error");   },
  };
}
