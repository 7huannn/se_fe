// controllers/chat/index.js
import { initChatController } from '../group/chatController.js';
import { initChatUI } from '../../views/group/chatView.js';

/**
 * Khởi tạo tất cả controllers cho trang chat
 */
export function initChatControllers() {
    // Khởi tạo chat UI và controller
    initChatUI();
    initChatController();
    
    // Khởi tạo điều hướng sidebar - sử dụng controller chia sẻ
    import('../../controllers/sidebar-navigation.js').then(navModule => {
        navModule.initSidebarNav();
    });
}

// Chạy khi trang được tải
document.addEventListener('DOMContentLoaded', initChatControllers);