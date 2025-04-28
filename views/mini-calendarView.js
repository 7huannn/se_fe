// views/miniCalendarView.js
import { generateMonthCalendarDays, isTheSameDay } from "../models/date.js";

const dayListItemTemplate = document.querySelector("[data-template='mini-calendar-day-list-item']");

const headerFormatter = new Intl.DateTimeFormat("en-US", { month: 'long', year: 'numeric' });

/**
 * Render tiêu đề (tháng/năm) của mini-calendar
 * @param {HTMLElement} parent
 * @param {Date} date
 */
export function renderMiniCalendarHeader(parent, date) {
  const headerEl = parent.querySelector("[data-mini-calendar-date]");
  headerEl.textContent = headerFormatter.format(date);
}

/**
 * Render danh sách ngày trong mini-calendar
 * @param {HTMLElement} parent
 * @param {Date} miniCalendarDate - tháng đang hiển thị
 * @param {Date} selectedDate - ngày được chọn trên calendar chính
 * @param {function(): Date} todayFn - hàm trả về ngày hôm nay
 */
export function renderMiniCalendarDays(parent, miniCalendarDate, selectedDate, todayFn) {
  const listEl = parent.querySelector("[data-mini-calendar-day-list]");
  listEl.replaceChildren();

  const days = generateMonthCalendarDays(miniCalendarDate);
  days.forEach(day => {
    const fragment = dayListItemTemplate.content.cloneNode(true);
    const itemEl = fragment.querySelector("[data-mini-calendar-day-list-item]");
    const dayEl = itemEl.querySelector("[data-mini-calendar-day]");

    dayEl.textContent = day.getDate();
    if (day.getMonth() !== miniCalendarDate.getMonth()) {
      dayEl.classList.add("mini-calendar__day--other");
    }
    if (isTheSameDay(selectedDate, day)) {
      dayEl.classList.add("button--primary");
    } else {
      dayEl.classList.add("button--secondary");
    }
    if (isTheSameDay(todayFn(), day)) {
      dayEl.classList.add("mini-calendar__day--highlight");
    }

    dayEl.addEventListener("click", () => {
      dayEl.dispatchEvent(new CustomEvent("date-change", {
        detail: { date: day },
        bubbles: true
      }));
    });

    listEl.appendChild(itemEl);
  });
}
