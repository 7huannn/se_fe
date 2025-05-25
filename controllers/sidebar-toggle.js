// controllers/sidebar-toggle.js - FIXED VERSION

/**
 * Toggle sidebar visibility bằng cách thêm/bỏ class "hidden"
 * FIXED: Ensure proper toggle behavior
 * @param {HTMLElement} sidebarMenu
 */
export function toggleSidebar(sidebarMenu) {
  if (!sidebarMenu) return;
  
  // FIXED: Use proper toggle logic
  const isHidden = sidebarMenu.classList.contains("hidden");
  
  if (isHidden) {
    // Show sidebar
    sidebarMenu.classList.remove("hidden");
    console.log("Sidebar opened");
  } else {
    // Hide sidebar
    sidebarMenu.classList.add("hidden");
    console.log("Sidebar closed");
  }
}

/**
 * Explicitly hide sidebar
 * @param {HTMLElement} sidebarMenu
 */
export function hideSidebar(sidebarMenu) {
  if (!sidebarMenu) return;
  sidebarMenu.classList.add("hidden");
}

/**
 * Explicitly show sidebar
 * @param {HTMLElement} sidebarMenu
 */
export function showSidebar(sidebarMenu) {
  if (!sidebarMenu) return;
  sidebarMenu.classList.remove("hidden");
}