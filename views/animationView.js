import { waitUntilAnimationsFinish } from "../controllers/animation.js";

/**
 * Áp dụng CSS animation class lên phần tử,
 * chờ animation kết thúc rồi remove class.
 *
 * @param {HTMLElement} element - Phần tử cần animate
 * @param {string} animationClass - Tên CSS class animation
 * @returns {Promise<void>}
 */
export function animateElement(element, animationClass) {
  element.classList.add(animationClass);
  return waitUntilAnimationsFinish(element)
    .finally(() => {
      element.classList.remove(animationClass);
    });
}