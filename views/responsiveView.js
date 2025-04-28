// views/responsiveView.js
/**
 * Media query để kiểm tra kích thước desktop/mobile
 */
export const mediaQuery = window.matchMedia("(min-width: 768px)");

/**
 * Lấy loại thiết bị hiện tại
 * @returns {"desktop"|"mobile"}
 */
export function getCurrentDeviceType() {
  return mediaQuery.matches ? "desktop" : "mobile";
}