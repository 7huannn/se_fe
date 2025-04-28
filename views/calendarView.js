// views/calendarView.js
import { renderMonthCalendar } from "./month-calendarView.js";
import { renderWeekCalendar  } from "./week-calendarView.js";

/**
 * Hiển thị calendar theo view type
 * @param {HTMLElement} container - Element chứa calendar
 * @param {"month"|"week"} view - Loại view
 * @param {Date} date - Ngày được chọn
 * @param {*} eventStore - Store chứa events
 * @param {string} deviceType - Loại thiết bị (mobile/desktop)
 */
export function renderCalendar(container, view, date, eventStore, deviceType) {
  if (view === "month") {
    renderMonthCalendar(container, date, eventStore);
  } else if (view === "week") {
    renderWeekCalendar(container, date, eventStore, false, deviceType);
  } else {
    // compact week view
    renderWeekCalendar(container, date, eventStore, true, deviceType);
  }
}