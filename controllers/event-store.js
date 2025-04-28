// controllers/event-store.js
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

  document.addEventListener("event-create", ({ detail: newEvt }) => {
    const all = getAllEvents();
    all.push(newEvt);
    saveAllEvents(all);
    notify();
  });

  document.addEventListener("event-delete", ({ detail: delEvt }) => {
    const all = getAllEvents().filter(evt => evt.id !== delEvt.id);
    saveAllEvents(all);
    notify();
  });

  document.addEventListener("event-edit", ({ detail: updatedEvt }) => {
    const all = getAllEvents().map(evt =>
      evt.id === updatedEvt.id ? updatedEvt : evt
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
