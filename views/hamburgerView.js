// views/hamburgerView.js
import { handleHamburgerClick } from "../controllers/hamburger.js";

/**
 * Khởi tạo view cho hamburger button:
 * - Lấy button từ DOM và đăng ký sự kiện click
 */
export function initHamburger() {
  const button = document.querySelector("[data-hamburger-button]");
  if (!button) return;
  handleHamburgerClick(button);
}