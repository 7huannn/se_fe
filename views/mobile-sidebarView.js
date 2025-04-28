// views/mobileSidebarView.js
import { initDialog } from "./dialogView.js";

// Khởi tạo dialog "mobile-sidebar" và trả về API open/close
const { open: openSidebar, close: closeSidebar } = initDialog("mobile-sidebar");

export { openSidebar, closeSidebar };