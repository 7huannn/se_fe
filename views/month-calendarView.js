// views/monthCalendarView.js
import { generateMonthCalendarDays, today, isTheSameDay } from "../models/date.js";
import { isEventAllDay, eventStartsBefore } from "../models/event.js";
import { renderEventListItem } from "./event-listView.js";

// Template elements và mapping class tuần
const calendarTemplateElement    = document.querySelector("[data-template='month-calendar']");
const calendarDayTemplateElement = document.querySelector("[data-template='month-calendar-day']");
const calendarWeekClasses        = { 4: "four-week", 5: "five-week", 6: "six-week" };

/**
 * Render toàn bộ month calendar
 * @param {HTMLElement} parent
 * @param {Date} selectedDate
 * @param {Object} eventStore
 */
export function renderMonthCalendar(parent, selectedDate, eventStore) {
  // Clone template
  const content   = calendarTemplateElement.content.cloneNode(true);
  const calendarEl= content.querySelector("[data-month-calendar]");
  const dayListEl = calendarEl.querySelector("[data-month-calendar-day-list]");

  // Tính tuần, thêm class tương ứng
  const days  = generateMonthCalendarDays(selectedDate);
  const weeks = days.length / 7;
  calendarEl.classList.add(calendarWeekClasses[weeks]);

  // Tạo từng ngày
  days.forEach(day => {
    const events = eventStore.getEventsByDate(day);
    sortCalendarDayEvents(events);
    const dayEl = createCalendarDay(day, events);
    dayListEl.appendChild(dayEl);
  });

  parent.appendChild(calendarEl);
}

/**
 * Tạo một ngày trong month calendar
 * @param {Date} calendarDay
 * @param {Array} events
 * @returns {HTMLElement}
 */
function createCalendarDay(calendarDay, events) {
  const content = calendarDayTemplateElement.content.cloneNode(true);
  const dayEl   = content.querySelector("[data-month-calendar-day]");
  const labelEl = content.querySelector("[data-month-calendar-day-label]");
  const wrapperEl = dayEl.querySelector("[data-month-calendar-event-list-wrapper]");

  // 1) Highlight ngày hôm nay
  if (isTheSameDay(today(), calendarDay)) {
    dayEl.classList.add("month-calendar__day--highlight");
  }

  // 2) Click vào số ngày: chuyển sang view “day”
  labelEl.textContent = calendarDay.getDate();
  labelEl.addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("date-change", {
      detail: { date: calendarDay },
      bubbles: true
    }));
    document.dispatchEvent(new CustomEvent("view-change", {
      detail: { view: "day" },
      bubbles: true
    }));
  });

  // 3) **Click vào vùng sự kiện (wrapper)** → dispatch event-create-request
  wrapperEl.addEventListener("click", e => {
    if (e.target.closest("[data-event]")) return;
    document.dispatchEvent(new CustomEvent("event-create-request", {
      detail: {
        date: calendarDay,
        startTime: 600,
        endTime:   960
      },
      bubbles: true
    }));
  });

  // 4) Render từng event
  events.forEach(ev => renderEventListItem(wrapperEl, ev));

  return dayEl;
}

/**
 * Sắp xếp events (all-day lên trước, sau đó theo giờ bắt đầu)
 */
function sortCalendarDayEvents(events) {
  events.sort((a, b) => {
    if (isEventAllDay(a)) return -1;
    if (isEventAllDay(b)) return  1;
    return eventStartsBefore(a, b) ? -1 : 1;
  });
}
