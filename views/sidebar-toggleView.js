// views/sidebarToggleView.js
import { toggleSidebar } from "../controllers/sidebar-toggle.js";

/**
 * Khởi tạo view cho nút toggle sidebar:
 * - Lắng nghe DOMContentLoaded
 * - Bind click event lên nút và gọi controller
 */
export function initSidebarToggleView() {
  document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("sidebar-toggle");
    const sidebarMenu = document.getElementById("sidebar-menu");
    if (!toggleBtn || !sidebarMenu) return;

    toggleBtn.addEventListener("click", () => {
      toggleSidebar(sidebarMenu);
    });
  });
}
