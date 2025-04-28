// controllers/weekCalendarController.js
import { renderWeekCalendar } from "../views/weekCalendarView.js";

/**
 * Controller khởi tạo tuần calendar:
 * @param {HTMLElement} parent - phần tử chứa tuần calendar
 * @param {Date} selectedDate
 * @param {Object} eventStore
 * @param {boolean} isSingleDay
 * @param {string} deviceType
 */
export function initWeekCalendarController(parent, selectedDate, eventStore, isSingleDay, deviceType) {
  renderWeekCalendar(parent, selectedDate, eventStore, isSingleDay, deviceType);
}