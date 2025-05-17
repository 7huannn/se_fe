// controllers/navigationController.js

/**
 * Chuyển hướng trang
 * @param {string} page - đường dẫn đến trang
 */
export function redirectTo(page) {
  window.location.href = page;
}

/**
 * Mở demo view trong tab mới
 */
export function viewDemo() {
  window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
}

/**
 * Gán sự kiện click cho nút và redirect
 * @param {HTMLElement} buttonElement
 * @param {string} targetPage
 */
export function handleRedirectButton(buttonElement, targetPage) {
  buttonElement.addEventListener("click", () => {
    redirectTo(targetPage);
  });
}

/**
 * Gán sự kiện click cho thành phần Get Started
 * @param {HTMLElement} buttonElement
 * @param {string} targetPage
 */
export function handleGetStarted(buttonElement, targetPage) {
  buttonElement.addEventListener("click", () => {
    redirectTo(targetPage);
  });
}

/**
 * Khởi tạo tất cả các navigation handlers:
 * - nút Sign in/Sign up (Topbar)
 * - các nút primary (Try it now, View demo…)
 * - nút Get Started (CTA)
 * - nút demo nếu có data-demo-button
 */
export function initNavigationController() {
  // 1. Topbar Auth button
  const authBtn = document.querySelector(".auth-button");
  if (authBtn) {
    handleRedirectButton(authBtn, "login.html");
  }

  // 2. Tất cả nút .btn.primary (Try it now, View demo…)
  document
    .querySelectorAll(".btn.primary")
    .forEach(btn => handleRedirectButton(btn, "login.html"));

  // 3. CTA Get Started (nếu nằm trong .cta)
  const getStartedBtn = document.querySelector(".cta .btn.primary");
  if (getStartedBtn) {
    handleGetStarted(getStartedBtn, "login.html");
  }

  // 4. Nút demo (nếu dùng data-demo-button)
  const demoBtn = document.querySelector("[data-demo-button]");
  if (demoBtn) {
    demoBtn.addEventListener("click", viewDemo);
  }
}

// Chạy init khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", initNavigationController);
