// controllers/miniCalendarController.js
import { today, subtractMonths, addMonths } from "../models/date.js";
import { getDate, setDate }               from "../models/url.js";
import {
  renderMiniCalendarHeader,
  renderMiniCalendarDays
} from "../views/mini-calendarView.js";

/**
 * Khởi tạo tất cả mini-calendar
 */
export function initMiniCalendars() {
  const calendars = document.querySelectorAll("[data-mini-calendar]");
  calendars.forEach(initSingleMiniCalendar);
}

/**
 * Controller cho 1 mini-calendar
 * @param {HTMLElement} calendarElement
 */
function initSingleMiniCalendar(calendarElement) {
  const prevBtn = calendarElement.querySelector("[data-mini-calendar-previous-button]");
  const nextBtn = calendarElement.querySelector("[data-mini-calendar-next-button]");

  // Đọc ngày hiện tại từ URL/model
  let selectedDate = getDate();

  // Khi Nav call setDate → emit date-change, mini + main đều lắng nghe
  document.addEventListener("date-change", e => {
    selectedDate = e.detail.date;
    refresh();
  });

  // Hàm render lại widget
  function refresh() {
    renderMiniCalendarHeader(calendarElement, selectedDate);
    renderMiniCalendarDays(calendarElement, selectedDate, selectedDate, today);
    // Luôn enable cả Prev và Next
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  }

  // Prev trong mini: lùi 1 tháng so với selectedDate, đồng bộ toàn cục
  prevBtn.addEventListener("click", () => {
    const newDate = subtractMonths(selectedDate, 1);
    setDate(newDate);
  });

  // Next trong mini: tiến 1 tháng, đồng bộ toàn cục
  nextBtn.addEventListener("click", () => {
    const newDate = addMonths(selectedDate, 1);
    setDate(newDate);
  });

  // Render lần đầu
  refresh();
}
