// controllers/chat.js
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo view
    import("../views/chatView.js").then(viewModule => {
        viewModule.initChatView();
    });
    
    // Khởi tạo điều hướng
    import("../controllers/sidebar-navigation.js").then(navModule => {
        navModule.initSidebarNav();
    });
});

// Xử lý khi gửi tin nhắn
export function handleSendMessage(message) {
    if (!message.trim()) return false;
    
    console.log('Controller: Sending message:', message);
    
    // Đây sẽ là nơi gọi model để lưu tin nhắn vào cơ sở dữ liệu
    // hoặc gửi đến server trong ứng dụng thực tế
    
    return true;
}