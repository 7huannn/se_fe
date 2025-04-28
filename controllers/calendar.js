// controllers/calendarController.js
import { renderCalendar } from "../views/calendarView.js";
import { getDate, getView } from "../models/url.js";
import { getCurrentDeviceType as currentDeviceType } from "../views/responsiveView.js";

/**
 * Khởi tạo Calendar controller:
 * - Lắng nghe thay đổi view, date, device hoặc data
 * - Gọi renderCalendar để cập nhật UI
 */
export function initCalendar(eventStore) {
  const calendarElement = document.querySelector("[data-calendar]");

  let selectedView = getView();
  let selectedDate = getDate();
  let deviceType = currentDeviceType();

  function refreshCalendar() {
    const scrollable = calendarElement.querySelector("[data-calendar-scrollable]");
    const scrollTop = scrollable ? scrollable.scrollTop : 0;

    calendarElement.replaceChildren();
    renderCalendar(calendarElement, selectedView, selectedDate, eventStore, deviceType);
    calendarElement.querySelector("[data-calendar-scrollable]")
      .scrollTo({ top: scrollTop });
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

  refreshCalendar();
}
