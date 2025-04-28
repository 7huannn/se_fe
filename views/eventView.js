// views/eventView.js
import {
    eventTimeToDate,
    isEventAllDay
  } from "../models/event.js";
  
  // Lấy template & formatter
  const templateEl = document.querySelector("[data-template='event']");
  const dateFmt   = new Intl.DateTimeFormat("en-US", {
    hour:   "numeric",
    minute: "numeric"
  });
  
  /** Clone template, fill nội dung và trả về element */
  function initEventElement(event) {
    const frag      = templateEl.content.cloneNode(true);
    const evEl      = frag.querySelector("[data-event]");
    const titleEl   = evEl.querySelector("[data-event-title]");
    const startEl   = evEl.querySelector("[data-event-start-time]");
    const endEl     = evEl.querySelector("[data-event-end-time]");
  
    titleEl.textContent = event.title;
    startEl.textContent = dateFmt.format(eventTimeToDate(event, event.startTime));
    endEl.textContent   = dateFmt.format(eventTimeToDate(event, event.endTime));
    evEl.style.setProperty("--event-color", event.color);
  
    // Click vào event, đẩy custom event ra ngoài
    evEl.addEventListener("click", () => {
      evEl.dispatchEvent(new CustomEvent("event-click", {
        detail: { event }, bubbles: true
      }));
    });
  
    return evEl;
  }
  
  /** Render event tĩnh (static) */
  export function initStaticEvent(parent, event) {
    const evEl = initEventElement(event);
    if (isEventAllDay(event)) evEl.classList.add("event--filled");
    parent.appendChild(evEl);
  }
  
  /** Render event động (drag/resize) */
  export function initDynamicEvent(parent, event, styles) {
    const evEl = initEventElement(event);
    evEl.classList.add("event--filled", "event--dynamic");
    Object.assign(evEl.style, styles);
    parent.appendChild(evEl);
  }
  
  export function adjustDynamicEventMaxLines(dynamicEventElement) {
    const availableHeight = dynamicEventElement.offsetHeight;
    const lineHeight       = 16;
    const padding          = 8;
    const maxTitleLines    = Math.floor((availableHeight - lineHeight - padding) / lineHeight);
    dynamicEventElement.style.setProperty("--event-title-max-lines", maxTitleLines);
  }