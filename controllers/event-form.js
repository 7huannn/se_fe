// controllers/eventFormController.js
import { initEventForm } from "../views/event-form-dialogView.js";  
import { validateEvent, generateEventId } from "../models/event.js";
import { initEventForm } from "../views/event-form-dialogView.js";

/**
 * Controller cho form tạo/sửa event:
 * - Bắt sự kiện submit
 * - Kiểm tra validate, dispatch event-create hoặc event-edit
 * - Nghe event-create-request và event-edit-request để set mode và fill form
 * - Nghe dialog-close để reset form
 */
export function initEventFormController(toaster) {
  // Lấy tất cả API của view
  const {
    formElement,
    switchToCreateMode,
    switchToEditMode,
    reset
  } = initEventForm(toaster);

  let mode = "create";

  // Bắt sự kiện submit (mà view đã bind sẵn dưới initEventForm)
  formElement.addEventListener("submit", (e) => {
    e.preventDefault();
    const formEvent = {
      id: mode === "create" ? generateEventId() : Number(formElement.id.value),
      title: formElement.title.value,
      date: new Date(formElement.date.value),
      startTime: Number(formElement["start-time"].value),
      endTime:   Number(formElement["end-time"].value),
      color: formElement.color.value
    };

    const err = validateEvent(formEvent);
    if (err) {
      toaster.error(err);
      return;
    }

    // Dispatch sự kiện tạo/sửa với object đầy đủ trường date
    formElement.dispatchEvent(
      new CustomEvent(
        mode === "create" ? "event-create" : "event-edit",
        { detail: { event: formEvent }, bubbles: true }
      )
    );
  });

  // Request mở form có data
  document.addEventListener("event-create-request", (e) => {
    mode = "create";
    switchToCreateMode(e.detail.date, e.detail.startTime, e.detail.endTime);
  });
  document.addEventListener("event-edit-request", (e) => {
    mode = "edit";
    switchToEditMode(e.detail.event);
  });
  document.addEventListener("dialog-close", () => {
    reset();
  });
}