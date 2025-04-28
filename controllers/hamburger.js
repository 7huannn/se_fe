// controllers/hamburgerController.js

/**
 * Gán sự kiện click để dispatch yêu cầu mở sidebar
 * @param {HTMLElement} buttonElement - nút hamburger
 */
export function handleHamburgerClick(buttonElement) {
  buttonElement.addEventListener("click", () => {
    buttonElement.dispatchEvent(
      new CustomEvent("mobile-sidebar-open-request", {
        bubbles: true
      })
    );
  });
}
export { initHamburger } from "../views/hamburgerView.js";