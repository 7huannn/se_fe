// controllers/month-calendarView.js
import { renderMonthCalendar } from "../views/month-calendarView.js";

/**
 * Controller khởi tạo tháng calendar:
 * @param {HTMLElement} parent - phần tử chứa calendar
 * @param {Date} selectedDate - ngày được chọn để render tháng
 * @param {Object} eventStore - store chứa events và phương thức getEventsByDate
 */
export function initMonthCalendarController(parent, selectedDate, eventStore) {
  renderMonthCalendar(parent, selectedDate, eventStore);
}