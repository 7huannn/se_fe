// models/group/message.js

/**
 * Lưu tin nhắn vào localStorage
 * @param {Array} messages - Mảng chứa các tin nhắn
 */
export function saveMessages(messages) {
    localStorage.setItem('schedigo_messages', JSON.stringify(messages));
}

/**
 * Lấy danh sách tin nhắn từ localStorage
 * @returns {Array} Mảng chứa các tin nhắn
 */
export function loadMessages() {
    const messagesData = localStorage.getItem('schedigo_messages');
    return messagesData ? JSON.parse(messagesData) : [];
}

/**
 * Thêm tin nhắn mới vào danh sách
 * @param {Object} message - Thông tin tin nhắn
 */
export function addMessage(message) {
    const messages = loadMessages();
    messages.push({
        ...message,
        timestamp: new Date().toISOString(),
        sender: 'user' // Default là user hiện tại
    });
    saveMessages(messages);
    return messages;
}

/**
 * Định dạng thời gian tin nhắn
 * @param {string} timestamp - Thời gian dạng ISO string
 * @returns {string} Thời gian định dạng "HH:MM"
 */
export function formatMessageTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}