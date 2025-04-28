// controllers/sidebarToggleController.js

/**
 * Toggle sidebar visibility bằng cách thêm/bỏ class "hidden"
 * @param {HTMLElement} sidebarMenu
 */
export function toggleSidebar(sidebarMenu) {
  sidebarMenu.classList.toggle("hidden");
}