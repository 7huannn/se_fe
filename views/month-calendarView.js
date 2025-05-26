// views/month-calendarView.js - Updated to work with async API
import { generateMonthCalendarDays, today, isTheSameDay } from "../models/date.js";
import { isEventAllDay, eventStartsBefore } from "../models/event.js";
import { renderEventListItem } from "./event-listView.js";

// Template elements và mapping class tuần
const calendarTemplateElement = document.querySelector("[data-template='month-calendar']");
const calendarDayTemplateElement = document.querySelector("[data-template='month-calendar-day']");
const calendarWeekClasses = { 4: "four-week", 5: "five-week", 6: "six-week" };

/**
 * Render toàn bộ month calendar với async support
 */
export async function renderMonthCalendar(parent, selectedDate, eventStore) {
  // Clone template
  const content = calendarTemplateElement.content.cloneNode(true);
  const calendarEl = content.querySelector("[data-month-calendar]");
  const dayListEl = calendarEl.querySelector("[data-month-calendar-day-list]");

  // Tính tuần, thêm class tương ứng
  const days = generateMonthCalendarDays(selectedDate);
  const weeks = days.length / 7;
  calendarEl.classList.add(calendarWeekClasses[weeks]);

  // Create all day elements với async events
  const dayPromises = days.map(async (day) => {
    try {
      const events = await eventStore.getEventsByDate(day);
      sortCalendarDayEvents(events);
      return createCalendarDay(day, events);
    } catch (error) {
      console.error("Error loading events for day:", day, error);
      return createCalendarDay(day, []); // Fallback với empty events
    }
  });

  // Wait for all days to be created
  const dayElements = await Promise.all(dayPromises);
  
  // Append all day elements
  dayElements.forEach(dayEl => {
    dayListEl.appendChild(dayEl);
  });

  // Clear parent and append new calendar
  parent.replaceChildren();
  parent.appendChild(calendarEl);
}

/**
 * Tạo một ngày trong month calendar
 */
function createCalendarDay(calendarDay, events) {
  const content = calendarDayTemplateElement.content.cloneNode(true);
  const dayEl = content.querySelector("[data-month-calendar-day]");
  const labelEl = content.querySelector("[data-month-calendar-day-label]");
  const wrapperEl = dayEl.querySelector("[data-month-calendar-event-list-wrapper]");

  // 1) Highlight ngày hôm nay
  if (isTheSameDay(today(), calendarDay)) {
    dayEl.classList.add("month-calendar__day--highlight");
  }

  // 2) Click vào số ngày: chuyển sang view "day"
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

  // 3) Click vào vùng sự kiện (wrapper) → dispatch event-create-request
  wrapperEl.addEventListener("click", e => {
    if (e.target.closest("[data-event]")) return;
    document.dispatchEvent(new CustomEvent("event-create-request", {
      detail: {
        date: calendarDay,
        startTime: 600, // 10:00 AM
        endTime: 660    // 11:00 AM
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
    if (isEventAllDay(b)) return 1;
    return eventStartsBefore(a, b) ? -1 : 1;
  });
}