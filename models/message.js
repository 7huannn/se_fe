// models/message.js

// Định nghĩa lớp Message
export class Message {
    constructor(text, sender, timestamp = new Date()) {
        this.text = text;
        this.sender = sender;
        this.timestamp = timestamp;
    }
    
    // Chuyển đổi thành chuỗi hiển thị thời gian
    getFormattedTime() {
        return this.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

// Lưu và lấy tin nhắn từ localStorage
export function saveMessage(message) {
    const messages = getMessages();
    messages.push(message);
    localStorage.setItem('chat_messages', JSON.stringify(messages));
}

export function getMessages() {
    const messagesJson = localStorage.getItem('chat_messages');
    return messagesJson ? JSON.parse(messagesJson) : [];
}