
// views/weekCalendarView.js
import { generateWeekDays, today, isTheSameDay } from "../models/date.js";
import { isEventAllDay, eventStartsBefore, eventEndsBefore, eventCollidesWith }         from "../models/event.js";
import { renderEventListItem }          from "./event-listView.js";
import { initEventListController as initEventList } from "../controllers/event-list.js";
import { initDynamicEvent, adjustDynamicEventMaxLines } from "./eventView.js";
const calendarTemplateElement = document.querySelector("[data-template='week-calendar']");
const dayOfWeekTemplate = document.querySelector("[data-template='week-calendar-day-of-week']");
const allDayListItemTemplate = document.querySelector("[data-template='week-calendar-all-day-list-item']");
const columnTemplate = document.querySelector("[data-template='week-calendar-column']");
const dateFormatter = new Intl.DateTimeFormat("en-US", { weekday: 'short' });

/**
 * View: render tuần calendar với tất cả các ngày và sự kiện
 */
export function renderWeekCalendar(parent, selectedDate, eventStore, isSingleDay, deviceType) {
  const content = calendarTemplateElement.content.cloneNode(true);
  const calendarEl = content.querySelector("[data-week-calendar]");
  const daysOfWeekEl = calendarEl.querySelector("[data-week-calendar-day-of-week-list]");
  const allDayListEl = calendarEl.querySelector("[data-week-calendar-all-day-list]");
  const columnsEl = calendarEl.querySelector("[data-week-calendar-columns]");

  const weekDays = isSingleDay ? [selectedDate] : generateWeekDays(selectedDate);
  weekDays.forEach(day => {
    const events = eventStore.getEventsByDate(day);
    const allDay = events.filter(e => isEventAllDay(e));
    const nonAllDay = events.filter(e => !isEventAllDay(e));
    sortEventsByTime(nonAllDay);

    renderDayOfWeek(daysOfWeekEl, selectedDate, day, deviceType);

    if (deviceType === "desktop" || (deviceType === "mobile" && isTheSameDay(day, selectedDate))) {
      renderAllDayList(allDayListEl, allDay);
      renderWeekColumn(columnsEl, day, nonAllDay);
    }
  });

  if (isSingleDay) {
    calendarEl.classList.add("week-calendar--day");
  }
  parent.appendChild(calendarEl);

  // adjust dynamic events
  calendarEl.querySelectorAll("[data-event-dynamic]").forEach(el => {
    adjustDynamicEventMaxLines(el);
  });
}

function renderDayOfWeek(parent, selectedDate, weekDay, deviceType) {
  const fragment = dayOfWeekTemplate.content.cloneNode(true);
  const el = fragment.querySelector("[data-week-calendar-day-of-week]");
  const btn = el.querySelector("[data-week-calendar-day-of-week-button]");
  const dayLabel = el.querySelector("[data-week-calendar-day-of-week-number]");
  const dayName = el.querySelector("[data-week-calendar-day-of-week-day]");

  dayLabel.textContent = weekDay.getDate();
  dayName.textContent = dateFormatter.format(weekDay);
  if (isTheSameDay(weekDay, today())) btn.classList.add("week-calendar__day-of-week-button--highlight");
  if (isTheSameDay(weekDay, selectedDate)) btn.classList.add("week-calendar__day-of-week-button--selected");

  btn.addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("date-change", { detail: { date: weekDay }, bubbles: true }));
    if (deviceType !== "mobile") {
      document.dispatchEvent(new CustomEvent("view-change", { detail: { view: 'day' }, bubbles: true }));
    }
  });
  parent.appendChild(el);
}

function renderAllDayList(parent, events) {
  const fragment = allDayListItemTemplate.content.cloneNode(true);
  const el = fragment.querySelector("[data-week-calendar-all-day-list-item]");
  initEventList(el, events);
  parent.appendChild(el);
}

function renderWeekColumn(parent, weekDay, events) {
  const fragment = columnTemplate.content.cloneNode(true);
  const el = fragment.querySelector("[data-week-calendar-column]");
  const cells = el.querySelectorAll("[data-week-calendar-cell]");

  const styled = calculateEventsDynamicStyles(events);
  styled.forEach(item => {
    initDynamicEvent(el, item.event, item.styles);
  });

  cells.forEach(cell => {
    const start = parseInt(cell.dataset.weekCalendarCell, 10);
    const end = start + 60;
    cell.addEventListener("click", e => {
      if (e.target.closest("[data-event]")) return;
      document.dispatchEvent(new CustomEvent("event-create-request", { detail: { date: weekDay, startTime: start, endTime: end }, bubbles: true }));
    });
  });

  parent.appendChild(el);
}

function calculateEventsDynamicStyles(events) {
  const { eventGroups, totalColumns } = groupEvents(events);
  const colWidth = 100 / totalColumns;
  const initialItems = eventGroups.flatMap(group => group.filter(item => item.isInitial));

  return initialItems.map(item => {
    const top = 100 * (item.event.startTime / 1440);
    const bottom = 100 - 100 * (item.event.endTime / 1440);
    const left = colWidth * item.columnIndex;
    const right = colWidth * (totalColumns - item.columnIndex - item.columnSpan);
    return { event: item.event, styles: { top: `${top}%`, bottom: `${bottom}%`, left: `${left}%`, right: `${right}%` } };
  });
}

function groupEvents(events) {
  if (!events.length) return { eventGroups: [], totalColumns: 0 };
  const groups = [[{ event: events[0], columnIndex: 0, isInitial: true, eventIndex: 0 }]];
  for (let i = 1; i < events.length; i++) {
    const e = events[i];
    const last = groups[groups.length - 1];
    const colliding = last.filter(item => eventCollidesWith(item.event, e));
    if (!colliding.length) {
      last.push({ event: e, columnIndex: 0, isInitial: true, eventIndex: i });
    } else if (colliding.length === last.length) {
      last.push({ event: e, columnIndex: last.length, isInitial: true, eventIndex: i });
    } else {
      let idx = 0;
      while (colliding.some(item => item.columnIndex === idx)) idx++;
      groups.push([{ event: e, columnIndex: idx, isInitial: true, eventIndex: i }]);
    }
  }
  const total = Math.max(...groups.flatMap(g => g.map(item => item.columnIndex + 1)));
  groups.forEach(g => g.sort((a,b) => a.columnIndex - b.columnIndex));
  groups.flat().forEach(item => {
    const span = (groups.find(g => g.some(i => i.eventIndex === item.eventIndex)).length);
    item.columnSpan = span;
  });
  return { eventGroups: groups, totalColumns: total };
}

function sortEventsByTime(events) {
  events.sort((a, b) => {
    if (eventStartsBefore(a, b)) return -1;
    if (eventStartsBefore(b, a)) return 1;
    return eventEndsBefore(a, b) ? 1 : -1;
  });
}