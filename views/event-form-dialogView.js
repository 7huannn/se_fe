// views/event-form-dialogView.js - FIXED VERSION
import { generateEventId } from "../models/event.js";

/**
 * Khởi tạo logic cho form tạo/sửa event và emit sự kiện tương ứng
 * @param {{ success: (msg: string) => void, error: (msg: string) => void }} toaster
 * @returns {{
 *   formElement: HTMLFormElement,
 *   switchToCreateMode: (date: Date, startTime: number, endTime: number) => void,
 *   switchToEditMode: (eventData: object) => void,
 *   reset: () => void
 * }}
 */
export function initEventForm(toaster) {
  const formElement = document.querySelector("[data-event-form]");
  
  // FIX: Kiểm tra formElement có tồn tại không
  if (!formElement) {
    console.error("Event form element not found");
    return null;
  }
  
  const titleInput = formElement.querySelector("#title");
  const dateInput = formElement.querySelector("#date");
  const startInput = formElement.querySelector("#start-time");
  const endInput = formElement.querySelector("#end-time");
  const colorInputs = formElement.querySelectorAll(".color-select__input");

  // Chuyển form về mode "Create", với giá trị mặc định
  function switchToCreateMode(date, startTime, endTime) {
    formElement.dataset.mode = "create";
    delete formElement.dataset.id;               // Xóa id cũ nếu có
    if (titleInput) titleInput.value = "";
    if (dateInput) dateInput.value = date.toISOString().slice(0, 10);
    if (startInput) startInput.value = startTime;
    if (endInput) endInput.value = endTime;
    if (colorInputs.length > 0) colorInputs[0].checked = true;
  }

  // Chuyển form về mode "Edit", với dữ liệu event hiện có
  function switchToEditMode(eventData) {
    formElement.dataset.mode = "edit";
    formElement.dataset.id = eventData.id;        // Giữ lại id
    if (titleInput) titleInput.value = eventData.title;
    if (dateInput) dateInput.value = eventData.date.toISOString().slice(0, 10);
    if (startInput) startInput.value = eventData.startTime;
    if (endInput) endInput.value = eventData.endTime;
    
    const matched = Array.from(colorInputs).find(
      inp => inp.value === eventData.color
    );
    if (matched) matched.checked = true;
  }

  // Reset form về trạng thái ban đầu
  function reset() {
    formElement.reset();
    delete formElement.dataset.mode;
    delete formElement.dataset.id;
  }

  // Bắt sự kiện submit để emit custom event và toast
  formElement.addEventListener("submit", e => {
    e.preventDefault();
    const mode = formElement.dataset.mode || "create";

    // Xây dựng detail payload
    const detail = {
      event: {
        title: titleInput ? titleInput.value.trim() : "",
        date: dateInput ? new Date(dateInput.value) : new Date(),
        startTime: startInput ? Number(startInput.value) : 0,
        endTime: endInput ? Number(endInput.value) : 60,
        color: formElement.querySelector(".color-select__input:checked")?.value || "#2563eb"
      }
    };

    if (mode === "create") {
      // Tạo id mới
      detail.event.id = generateEventId();
      
      // FIX: Sử dụng đúng method của toaster
      if (toaster && toaster.success) {
        toaster.success("Event created!");
      }
      
      formElement.dispatchEvent(
        new CustomEvent("event-create", { detail, bubbles: true })
      );
    } else {
      // Giữ nguyên id cũ
      detail.event.id = Number(formElement.dataset.id);
      
      // FIX: Sử dụng đúng method của toaster
      if (toaster && toaster.success) {
        toaster.success("Event updated!");
      }
      
      formElement.dispatchEvent(
        new CustomEvent("event-edit", { detail, bubbles: true })
      );
    }
  });

  return {
    formElement,
    switchToCreateMode,
    switchToEditMode,
    reset
  };
}