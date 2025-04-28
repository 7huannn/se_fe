// controllers/responsiveController.js
import { mediaQuery, getCurrentDeviceType } from "../views/responsiveView.js";

/**
 * Controller cho responsive:
 * - Dispatch view-change nếu khởi tạo ở mobile
 * - Nghe sự kiện thay đổi media query để dispatch device-type-change và view-change
 */
export function initResponsiveController() {
  // Nếu khởi tạo ở mobile, chuyển sang week view
  if (getCurrentDeviceType() === "mobile") {
    document.dispatchEvent(new CustomEvent("view-change", {
      detail: { view: "week" },
      bubbles: true
    }));
  }

  // Lắng nghe thay đổi kích thước
  mediaQuery.addEventListener("change", () => {
    const deviceType = getCurrentDeviceType();

    // Dispatch device-type-change
    document.dispatchEvent(new CustomEvent("device-type-change", {
      detail: { deviceType },
      bubbles: true
    }));

    // Nếu chuyển sang mobile, đổi view thành week
    if (deviceType === "mobile") {
      document.dispatchEvent(new CustomEvent("view-change", {
        detail: { view: "week" },
        bubbles: true
      }));
    }
  });
}