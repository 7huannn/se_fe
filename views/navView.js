// views/navView.js
import {
  today,
  addDays,
  addMonths,
  subtractDays,
  subtractMonths
} from "../models/date.js";
import { getDate, setDate, getView } from "../models/url.js";

// Formatter cho hiển thị tháng và năm
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric"
});

/**
 * Cập nhật phần tử hiển thị ngày
 */
export function refreshNavDate(element, date) {
  element.textContent = dateFormatter.format(date);
}

/**
 * Xử lý nút Today: dispatch date-change về hôm nay
 */
export function handleNavToday(button) {
    button.addEventListener("click", () => {
        // Cập nhật ngày hôm nay vào model và URL, rồi emit date-change
        setDate(today());
     });
}

/**
 * Xử lý nút Previous: tính ngày trước đó theo view và dispatch date-change
 */
export function handleNavPrev(button) {
  button.addEventListener("click", () => {
       // Tính ngày trước theo view, cập nhật model & URL, rồi emit date-change
       const selectedView = getView();
       const selectedDate = getDate();
       let newDate;
           if (selectedView === "day") {
         newDate = subtractDays(selectedDate, 1);
       } else if (selectedView === "week") {
         newDate = subtractDays(selectedDate, 7);
       } else {
         newDate = subtractMonths(selectedDate, 1);
       }
           setDate(newDate);
      });
    }

/**
 * Xử lý nút Next: tính ngày kế tiếp theo view và dispatch date-change
 */
export function handleNavNext(button) {
  button.addEventListener("click", () => {
    const selectedView = getView();
    const selectedDate = getDate();
    let newDate;

    if (selectedView === "day") {
      newDate = addDays(selectedDate, 1);
    } else if (selectedView === "week") {
      newDate = addDays(selectedDate, 7);
    } else {
      newDate = addMonths(selectedDate, 1);
    }

    setDate(newDate);
  });
}
