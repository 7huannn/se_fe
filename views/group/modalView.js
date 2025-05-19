// views/group/modalView.js

/**
 * Hiển thị modal
 * @param {HTMLElement} modal - Element modal cần hiển thị
 */
export function showModal(modal) {
    if (!modal) return;
    
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.style.display = 'block';
    modal.style.display = 'block';
    
    // Ngăn scroll trên body
    document.body.style.overflow = 'hidden';
}

/**
 * Ẩn modal
 * @param {HTMLElement} modal - Element modal cần ẩn
 */
export function hideModal(modal) {
    if (!modal) return;
    
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.style.display = 'none';
    modal.style.display = 'none';
    
    // Cho phép scroll trên body
    document.body.style.overflow = '';
}

/**
 * Ẩn tất cả các modal
 */
export function hideAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        hideModal(modal);
    });
}

/**
 * Khởi tạo sự kiện cho các nút đóng modal
 * @param {HTMLElement} modal - Element modal
 * @param {string} closeButtonId - ID của nút đóng
 * @param {string} cancelButtonId - ID của nút cancel
 */
export function initModalCloseButtons(modal, closeButtonId, cancelButtonId) {
    const closeButton = document.getElementById(closeButtonId);
    const cancelButton = document.getElementById(cancelButtonId);
    
    if (closeButton) {
        closeButton.addEventListener('click', () => hideModal(modal));
    }
    
    if (cancelButton) {
        cancelButton.addEventListener('click', () => hideModal(modal));
    }
}