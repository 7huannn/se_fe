// controllers/group/index.js - Updated to include members controller

import { initTeamsListController, initCreateTeamFormController, loadSavedTeamsController, 
         handleTeamCreate, handleTeamEdit, handleTeamDelete, 
         handleTeamPrivacyUpdate, initEditTeamFormController } from './teamController.js';
import { initModalsController } from './modalController.js';
import { initDropdownController } from './dropdownController.js';
import { initTeamMembersController } from './membersController.js';
import { initNotificationsController } from "../notifications.js";
/**
 * Khởi tạo tất cả controllers cho trang group
 */
export function initGroupControllers() {
    // Khởi tạo dropdown
    initDropdownController();
    
    // Khởi tạo modals
    initModalsController();
    
    // Khởi tạo teams list
    initTeamsListController();
    
    // Khởi tạo form tạo team
    initCreateTeamFormController();
    
    // Khởi tạo form chỉnh sửa team
    initEditTeamFormController();
    
    // Khởi tạo controller quản lý thành viên
    initTeamMembersController();
    
    //thêm notification
    initNotificationsController();

    // Lắng nghe sự kiện tạo team
    document.addEventListener('team-create', handleTeamCreate);
    
    // Lắng nghe sự kiện chỉnh sửa team
    document.addEventListener('team-edit', handleTeamEdit);
    
    // Lắng nghe sự kiện xóa team
    document.addEventListener('team-delete', handleTeamDelete);
    
    // Lắng nghe sự kiện cập nhật quyền riêng tư team
    document.addEventListener('team-privacy-update', handleTeamPrivacyUpdate);
    
    // Khởi tạo điều hướng sidebar - sử dụng controller chia sẻ
    import('../../controllers/sidebar-navigation.js').then(navModule => {
        navModule.initSidebarNav();
    });
    
    // Load saved teams từ localStorage
    loadSavedTeamsController();
}

// Chạy khi trang được tải
document.addEventListener('DOMContentLoaded', initGroupControllers);