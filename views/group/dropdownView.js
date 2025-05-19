// views/group/dropdownView.js

/**
 * Khởi tạo dropdown
 * @param {string} buttonId - ID của nút dropdown
 * @param {string} dropdownId - ID của dropdown menu
 */
export function initDropdown(buttonId, dropdownId) {
    const dropdownBtn = document.getElementById(buttonId);
    const dropdown = document.getElementById(dropdownId);
    
    if (!dropdownBtn || !dropdown) return;
    
    // Toggle dropdown khi nhấn nút
    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    
    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', () => {
        dropdown.classList.remove('show');
    });
    
    // Ngăn không đóng dropdown khi click vào dropdown menu
    dropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    return {
        hide: () => dropdown.classList.remove('show'),
        show: () => dropdown.classList.add('show'),
        toggle: () => dropdown.classList.toggle('show')
    };
}