// models/storage.js
import { isTheSameDay } from "./date.js";

const STORAGE_KEY = "events";

/**
 * Đọc toàn bộ events từ localStorage, parse ngày về Date object
 */
export function getAllEvents() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return parsed.map(evt => ({
      ...evt,
      date: new Date(evt.date)
    }));
  } catch (e) {
    console.error("Parse events failed", e);
    return [];
  }
}

/**
 * Ghi mảng events (chuyển Date→ISO) vào localStorage
 */
export function saveAllEvents(events) {
  const toSave = events.map(evt => ({
    ...evt,
    date: evt.date.toISOString()
  }));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error("Stringify events failed", e);
  }
}

/**
 * Lọc events theo ngày
 */
export function getEventsByDate(date) {
  return getAllEvents().filter(evt => isTheSameDay(evt.date, date));
}
