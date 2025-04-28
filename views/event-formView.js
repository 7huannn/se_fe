// views/eventFormView.js
/**
 * View layer cho form tạo/sửa event: thao tác DOM và emit sự kiện
 */
export const formElement = document.querySelector("[data-event-form]");

/**
 * Đăng ký callback cho sự kiện submit form
 * @param {Function} callback
 */
export function onFormSubmit(callback) {
  formElement.addEventListener("submit", (event) => {
    event.preventDefault();
    callback();
  });
}

/**
 * Đọc dữ liệu từ form và chuyển thành object event
 * @returns {{id: number, title: string, date: Date, startTime: number, endTime: number, color: string}}
 */
export function getFormData() {
  const formData = new FormData(formElement);
  const id = formData.get("id");
  const title = formData.get("title");
  const date = formData.get("date");
  const startTime = formData.get("start-time");
  const endTime = formData.get("end-time");
  const color = formData.get("color");

  return {
    id: id ? Number.parseInt(id, 10) : null,
    title,
    date: new Date(date),
    startTime: Number.parseInt(startTime, 10),
    endTime: Number.parseInt(endTime, 10),
    color
  };
}

/**
 * Fill form khi tạo mới
 * @param {Date} date
 * @param {number} startTime
 * @param {number} endTime
 */
export function fillFormWithDate(date, startTime, endTime) {
  formElement.querySelector("#id").value = null;
  formElement.querySelector("#date").value = date.toISOString().substr(0, 10);
  formElement.querySelector("#start-time").value = startTime;
  formElement.querySelector("#end-time").value = endTime;
}

/**
 * Fill form khi chỉnh sửa
 * @param {{id: number, title: string, date: Date, startTime: number, endTime: number, color: string}} event
 */
export function fillFormWithEvent(event) {
  formElement.querySelector("#id").value = event.id;
  formElement.querySelector("#title").value = event.title;
  formElement.querySelector("#date").value = event.date.toISOString().substr(0, 10);
  formElement.querySelector("#start-time").value = event.startTime;
  formElement.querySelector("#end-time").value = event.endTime;
  formElement.querySelector(`[value='${event.color}']`).checked = true;
}

/**
 * Reset form về trạng thái ban đầu
 */
export function resetForm() {
  formElement.querySelector("#id").value = null;
  formElement.reset();
}
