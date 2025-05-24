// controllers/event-store.js - FIXED VERSION
import {
  getAllEvents,
  saveAllEvents,
  getEventsByDate as fetchEventsByDate
} from "../models/storage.js";

export function initEventStore() {
  // helper nhỏ để dispatch change
  function notify() {
    document.dispatchEvent(new CustomEvent("events-change", {
      bubbles: true
    }));
  }

  document.addEventListener("event-create", ({ detail }) => {
    // FIX: Xử lý đúng format data từ event-form
    const newEvent = detail.event || detail; // Support both formats
    const all = getAllEvents();
    all.push(newEvent);
    saveAllEvents(all);
    notify();
  });

  document.addEventListener("event-delete", ({ detail }) => {
    // FIX: Xử lý đúng format data
    const delEvent = detail.event || detail;
    const all = getAllEvents().filter(evt => evt.id !== delEvent.id);
    saveAllEvents(all);
    notify();
  });

  document.addEventListener("event-edit", ({ detail }) => {
    // FIX: Xử lý đúng format data
    const updatedEvent = detail.event || detail;
    const all = getAllEvents().map(evt =>
      evt.id === updatedEvent.id ? updatedEvent : evt
    );
    saveAllEvents(all);
    notify();
  });

  return {
    // controller expose cho calendar view
    getEventsByDate(date) {
      return fetchEventsByDate(date);
    }
  };
}