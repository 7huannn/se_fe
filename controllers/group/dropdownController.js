// controllers/group/dropdownController.js
import { initDropdown } from '../../views/group/dropdownView.js';

/**
 * Khởi tạo controller cho dropdown
 */
export function initDropdownController() {
    // Khởi tạo dropdown cho team
    const dropdown = initDropdown('teamDropdownBtn', 'teamDropdown');
    
    return dropdown;
}