// views/sidebar-toggleView.js - FIXED VERSION
import { toggleSidebar } from "../controllers/sidebar-toggle.js";

/**
 * Khởi tạo view cho nút toggle sidebar:
 * - Lắng nghe DOMContentLoaded
 * - Bind click event lên nút và gọi controller
 * - FIXED: Ensure sidebar is hidden by default
 */
export function initSidebarToggleView() {
  document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("sidebar-toggle");
    const sidebarMenu = document.getElementById("sidebar-menu");
    
    if (!toggleBtn || !sidebarMenu) return;

    // FIXED: Ensure sidebar starts hidden
    sidebarMenu.classList.add("hidden");

    toggleBtn.addEventListener("click", () => {
      toggleSidebar(sidebarMenu);
    });

    // FIXED: Close sidebar when clicking outside
    document.addEventListener("click", (event) => {
      // Check if click is outside sidebar and toggle button
      if (!sidebarMenu.contains(event.target) && 
          !toggleBtn.contains(event.target) && 
          !sidebarMenu.classList.contains("hidden")) {
        sidebarMenu.classList.add("hidden");
      }
    });

    // FIXED: Close sidebar on escape key
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !sidebarMenu.classList.contains("hidden")) {
        sidebarMenu.classList.add("hidden");
      }
    });
  });
}