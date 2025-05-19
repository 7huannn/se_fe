// controllers/group/chatController.js
import { addMessage, formatMessageTime } from '../../models/group/message.js';
import { displayChatMessage } from '../../views/group/chatView.js';

/**
 * Khởi tạo controller cho chat
 */
export function initChatController() {
    // Lắng nghe sự kiện gửi tin nhắn
    document.addEventListener('chat-message-send', (event) => {
        const { message } = event.detail;
        handleSendMessage(message);
    });
}

/**
 * Xử lý khi gửi tin nhắn
 * @param {string} message - Nội dung tin nhắn
 * @returns {boolean} true nếu tin nhắn đã được gửi thành công
 */
export function handleSendMessage(message) {
    if (!message.trim()) return false;
    
    console.log('Controller: Sending message:', message);
    
    // Lưu tin nhắn vào model
    const messageData = {
        text: message,
        sender: 'user'
    };
    
    const updatedMessages = addMessage(messageData);
    const lastMessage = updatedMessages[updatedMessages.length - 1];
    
    // Hiển thị tin nhắn trên UI
    displayChatMessage(message, formatMessageTime(lastMessage.timestamp));
    
    return true;
}