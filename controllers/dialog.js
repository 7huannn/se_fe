// controllers/dialogController.js
import { waitUntilAnimationsFinish } from "./animation.js";

/**
 * Đóng dialog với animation đóng
 * @param {HTMLDialogElement} dialogElement
 * @returns {Promise<({status: string, value?: any, reason?: any})[]>}
 */
export function closeDialog(dialogElement) {
  dialogElement.classList.add("dialog--closing");

  return waitUntilAnimationsFinish(dialogElement)
    .then(() => {
      dialogElement.classList.remove("dialog--closing");
      dialogElement.close();
    })
    .catch(error => {
      console.error("Finish dialog animation promise failed", error);
    });
}