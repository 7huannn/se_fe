// controllers/calendar.js - Updated to work with API
import { renderCalendar } from "../views/calendarView.js";
import { getDate, getView } from "../models/url.js";
import { getCurrentDeviceType as currentDeviceType } from "../views/responsiveView.js";

/**
 * Initialize Calendar controller với API support
 */
export function initCalendar(eventStore) {
  const calendarElement = document.querySelector("[data-calendar]");

  let selectedView = getView();
  let selectedDate = getDate();
  let deviceType = currentDeviceType();

  async function refreshCalendar() {
    const scrollable = calendarElement.querySelector("[data-calendar-scrollable]");
    const scrollTop = scrollable ? scrollable.scrollTop : 0;

    // Show loading state
    calendarElement.innerHTML = '<div class="loading">Loading events...</div>';

    try {
      // Render calendar với async event store
      await renderCalendar(calendarElement, selectedView, selectedDate, eventStore, deviceType);
      
      // Restore scroll position
      const newScrollable = calendarElement.querySelector("[data-calendar-scrollable]");
      if (newScrollable) {
        newScrollable.scrollTo({ top: scrollTop });
      }
    } catch (error) {
      console.error("Error refreshing calendar:", error);
      calendarElement.innerHTML = '<div class="error">Failed to load calendar. Please try again.</div>';
    }
  }

  document.addEventListener("view-change", event => {
    selectedView = event.detail.view;
    refreshCalendar();
  });

  document.addEventListener("date-change", event => {
    selectedDate = event.detail.date;
    refreshCalendar();
  });

  document.addEventListener("device-type-change", event => {
    deviceType = event.detail.deviceType;
    refreshCalendar();
  });

  document.addEventListener("events-change", () => {
    refreshCalendar();
  });

  // Initial render
  refreshCalendar();
}