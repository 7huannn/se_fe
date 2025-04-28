// views/eventDetailsDialogView.js
import { initDialog } from "./dialogView.js";
import { eventTimeToDate } from "../models/event.js";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
});
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: 'numeric', minute: 'numeric'
});

/**
 * Khởi tạo dialog chi tiết event và trả về API open/close
 */
export function initEventDetailsDialogView() {
  return initDialog("event-details");
}

/**
 * Fill thông tin event vào dialog
 * @param {HTMLElement} parent - phần tử dialog
 * @param {{title:string,date:Date,startTime:number,endTime:number,color:string}} event
 */
export function fillEventDetailsDialog(parent, event) {
  const container = parent.querySelector("[data-event-details]");
  container.querySelector("[data-event-details-title]").textContent = event.title;
  container.querySelector("[data-event-details-date]").textContent = dateFormatter.format(event.date);
  container.querySelector("[data-event-details-start-time]")
    .textContent = timeFormatter.format(eventTimeToDate(event, event.startTime));
  container.querySelector("[data-event-details-end-time]")
    .textContent = timeFormatter.format(eventTimeToDate(event, event.endTime));
  container.style.setProperty("--event-color", event.color);
}
