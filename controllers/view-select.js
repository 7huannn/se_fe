// controllers/viewSelectController.js
import { getView, setView } from "../models/url.js";
import {
  getViewSelectElement,
  bindViewSelectChange,
  updateViewSelectValue
} from "../views/view-selectView.js";

/**
 * Controller cho dropdown chọn view:
 * - Khởi tạo giá trị ban đầu từ URL
 * - Dispatch sự kiện view-change khi người dùng chọn mới
 * - Cập nhật lại dropdown khi có sự kiện view-change từ nơi khác
 */
export function initViewSelectController() {
  // Lấy giá trị khởi tạo
  const initialView = getView();
  updateViewSelectValue(initialView);

  // Khi user thay đổi dropdown, dispatch view-change
   bindViewSelectChange(newView => {
      setView(newView);
   });

  // Khi có view-change, sync dropdown value
  document.addEventListener("view-change", (e) => {
    updateViewSelectValue(e.detail.view);
  });
}
