// models/event.js

/**
 * Chuyển eventTime (phút trong ngày) thành Date object tại ngày event.date
 */
export function eventTimeToDate(event, eventTime) {
  return new Date(
    event.date.getFullYear(),
    event.date.getMonth(),
    event.date.getDate(),
    0, eventTime
  );
}

/** Event all-day = bắt đầu 0 phút, kết thúc 1440 phút */
export function isEventAllDay(event) {
  return event.startTime === 0 && event.endTime === 1440;
}

/** So sánh bắt đầu trước */
export function eventStartsBefore(a, b) {
  return a.startTime < b.startTime;
}

/** So sánh kết thúc trước */
export function eventEndsBefore(a, b) {
  return a.endTime < b.endTime;
}

/** Xem hai event có va chạm (overlay) không */
export function eventCollidesWith(a, b) {
  const maxStart = Math.max(a.startTime, b.startTime);
  const minEnd   = Math.min(a.endTime,   b.endTime);
  return minEnd > maxStart;
}

/** Validate formEvent, trả về chuỗi lỗi nếu có, null nếu OK */
export function validateEvent(event) {
  if (event.startTime >= event.endTime) {
    return "Event end time must be after start time";
  }
  return null;
}

/** Sinh ID đơn giản bằng timestamp */
export function generateEventId() {
  return Date.now();
}
