// models/url.js
import { today } from "./date.js";

let view = getViewFromLocation();
let date = getDateFromLocation();

function getViewFromLocation() {
  const p = new URLSearchParams(window.location.search);
  return p.get("view") || "month";
}

function getDateFromLocation() {
  const p = new URLSearchParams(window.location.search);
  return p.get("date") ? new Date(p.get("date")) : today();
}

function syncLocation() {
  const u = new URL(window.location);
  u.searchParams.set("view", view);
  u.searchParams.set("date", date.toISOString());
  history.replaceState(null, "", u);
}

export function getView() { return view; }
export function getDate() { return date; }

export function setView(v) {
  if (v === view) return;      // ← bỏ qua nếu không thay đổi
  view = v;
  syncLocation();
  document.dispatchEvent(
    new CustomEvent("view-change", { detail: { view } })
  );
}

export function setDate(d) {
  if (d.getTime() === date.getTime()) return;
  date = d;
  syncLocation();
  document.dispatchEvent(
    new CustomEvent("date-change", { detail: { date } })
  );
}

export function initUrlSync() {
  // Khi người dùng dùng back/forward browser sẽ sinh popstate
  window.addEventListener("popstate", () => {
    const newView = getViewFromLocation();
    if (newView !== view) {
      setView(newView);
    }
    const newDate = getDateFromLocation();
    if (newDate.getTime() !== date.getTime()) {
      setDate(newDate);
    }
  });
}
