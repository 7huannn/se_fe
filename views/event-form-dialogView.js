// views/event-formView.js
import { generateEventId } from "../models/event.js";

/**
 * Khởi tạo logic cho form tạo/sửa event và emit sự kiện tương ứng
 * @param {{ toast: (msg: string, type?: string) => void }} toaster
 * @returns {{
 *   formElement: HTMLFormElement,
 *   switchToCreateMode: (date: Date, startTime: number, endTime: number) => void,
 *   switchToEditMode: (eventData: object) => void,
 *   reset: () => void
 * }}
 */
export function initEventForm(toaster) {
  const formElement = document.querySelector("[data-event-form]");
  const titleInput = formElement.querySelector("#title");
  const dateInput = formElement.querySelector("#date");
  const startInput = formElement.querySelector("#start-time");
  const endInput = formElement.querySelector("#end-time");
  const colorInputs = formElement.querySelectorAll(".color-select__input");

  // Chuyển form về mode "Create", với giá trị mặc định
  function switchToCreateMode(date, startTime, endTime) {
    formElement.dataset.mode = "create";
    delete formElement.dataset.id;               // Xóa id cũ nếu có
    titleInput.value = "";
    dateInput.value = date.toISOString().slice(0, 10);
    startInput.value = startTime;
    endInput.value = endTime;
    colorInputs[0].checked = true;
  }

  // Chuyển form về mode "Edit", với dữ liệu event hiện có
  function switchToEditMode(eventData) {
    formElement.dataset.mode = "edit";
    formElement.dataset.id = eventData.id;        // Giữ lại id
    titleInput.value = eventData.title;
    dateInput.value = eventData.date.toISOString().slice(0, 10);
    startInput.value = eventData.startTime;
    endInput.value = eventData.endTime;
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
      title: titleInput.value.trim(),
      date: new Date(dateInput.value),
      startTime: Number(startInput.value),
      endTime: Number(endInput.value),
      color: formElement.querySelector(
        ".color-select__input:checked"
      ).value
    };

    if (mode === "create") {
      // Tạo id mới
      detail.id = generateEventId();
      toaster.toast("Event created!", "success");
      formElement.dispatchEvent(
        new CustomEvent("event-create", { detail, bubbles: true })
      );
    } else {
      // Giữ nguyên id cũ
      detail.id = Number(formElement.dataset.id);  // 5 (number), will match evt.id === 5
      toaster.toast("Event updated!", "success");
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
