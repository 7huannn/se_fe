// controllers/mobileSidebarController.js
import { openSidebar, closeSidebar } from "../views/mobile-sidebarView.js";

/**
 * Controller cho sidebar mobile:
 * - Nghe sự kiện mở và đóng
 */
export function initMobileSidebarController() {
  document.addEventListener("mobile-sidebar-open-request", () => {
    openSidebar();
  });

  document.addEventListener("date-change", () => {
    closeSidebar();
  });
}