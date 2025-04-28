// controllers/navController.js
import { getDate, getView } from "../models/url.js";
import { refreshNavDate, handleNavToday, handleNavPrev, handleNavNext } from "../views/navView.js";

/**
 * Controller cho navigation (prev, today, next, hiển thị ngày)
 */
// controllers/nav.js
export function initNavController() {
  const dateEl = document.querySelector("[data-nav-date]");
  let selectedView = getView();
  let selectedDate = getDate();

  // --- xử lý nút Today
  document
    .querySelectorAll("[data-nav-today-button]")
    .forEach(btn => handleNavToday(btn));

  // --- BIND nút Previous + Next
  const prevBtn = document.querySelector("[data-nav-previous-button]");
  const nextBtn = document.querySelector("[data-nav-next-button]");
  handleNavPrev(prevBtn);
  handleNavNext(nextBtn);

  // lắng nghe view-change / date-change như cũ…
  document.addEventListener("view-change",  e => {
    selectedView = e.detail.view;
  });
  document.addEventListener("date-change",  e => {
    selectedDate = e.detail.date;
    refreshNavDate(dateEl, selectedDate);
  });

  // render lần đầu
  refreshNavDate(dateEl, selectedDate);
}
