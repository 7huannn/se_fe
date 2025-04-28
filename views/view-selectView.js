// views/viewSelectView.js
/**
 * Lấy element dropdown
 * @returns {HTMLSelectElement}
 */
export function getViewSelectElement() {
    return document.querySelector("[data-view-select]");
  }
  
  /**
   * Thiết lập giá trị dropdown
   * @param {string} view
   */
  export function updateViewSelectValue(view) {
    const el = getViewSelectElement();
    if (el) el.value = view;
  }
  
  /**
   * Bind sự kiện change lên dropdown
   * @param {(newView: string) => void} callback
   */
  export function bindViewSelectChange(callback) {
    const el = getViewSelectElement();
    if (!el) return;
    el.addEventListener("change", () => {
      callback(el.value);
    });
  }
  