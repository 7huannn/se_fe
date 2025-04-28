// views/navigationView.js
import {
    handleRedirectButton,
    handleGetStarted,
    viewDemo
  } from "../controllers/nav.js";
  
  /**
   * Khởi tạo tất cả handler cho navigation
   */
  export function initNavigation() {
    document.addEventListener("DOMContentLoaded", () => {
      // Nút Auth (Topbar)
      const authBtn = document.querySelector(".auth-button");
      if (authBtn) {
        handleRedirectButton(authBtn, "../public/login.html");
      }
  
      // Nút chính (Main Section)
      const primaryBtn = document.querySelector(".btn.primary");
      if (primaryBtn) {
        handleRedirectButton(primaryBtn, "../public/login.html");
      }
    });
  
    // Nút Get Started (có thể nằm ngoài DOMContentLoaded)
    const getStartedBtn = document.querySelector(".cta .btn.primary");
    if (getStartedBtn) {
      handleGetStarted(getStartedBtn, "../public/login.html");
    }
  }
  
  /**
   * Ví dụ mở demo (nếu cần ở một chỗ khác)
   */
  export function initDemo() {
    const demoTrigger = document.querySelector("[data-demo-button]");
    if (demoTrigger) {
      demoTrigger.addEventListener("click", viewDemo);
    }
  }