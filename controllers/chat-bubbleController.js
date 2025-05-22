// controllers/chat-bubbleController.js
import ChatBubbleModel from "../models/chat-bubble.js";
import ChatBubbleView from "../views/chat-bubbleView.js";

/**
 * Controller cho Floating Chat Bubble
 * Kết nối model và view, xử lý logic
 */
export default class ChatBubbleController {
  constructor() {
    this.model = new ChatBubbleModel();
    this.view = new ChatBubbleView();
    
    // Khởi tạo view
    this.view.createElements();
    
    // Đính kèm các event listeners với các hàm xử lý
    this.view.attachEventListeners({
      expandChat: this.expandChat.bind(this),
      collapseChat: this.collapseChat.bind(this),
      sendMessage: this.sendMessage.bind(this)
    });
    
    // Cập nhật opacity định kỳ
    setInterval(() => this.view.updateBubbleOpacity(), 100);
    
    // Tải tin nhắn từ localStorage
    this.model.loadMessages();
    
    // Hiển thị tin nhắn đã lưu
    this.view.renderMessages(this.model.getMessages());
  }

  /**
   * Mở rộng chat panel
   */
  expandChat() {
    this.view.expandChat();
  }

  /**
   * Thu gọn chat panel
   */
  collapseChat() {
    this.view.collapseChat();
  }

  /**
   * Xử lý gửi tin nhắn
   */
  sendMessage() {
    // Lấy tin nhắn từ input
    const message = this.view.getInputMessage();
    if (!message) return;
    
    // Lưu tin nhắn người dùng vào model
    const userMessage = this.model.addMessage(message, true);
    
    // Hiển thị tin nhắn người dùng trên giao diện
    this.view.addUserMessage(
      userMessage.content, 
      this.view.formatTime(new Date(userMessage.timestamp))
    );
    
    // Hiển thị trạng thái đang nhập
    const typingIndicator = this.view.showTypingIndicator();
    
    // Tạo độ trễ để mô phỏng AI đang xử lý
    setTimeout(() => {
      // Lấy phản hồi từ model
      const aiResponse = this.model.getAIResponse(message);
      
      // Lưu tin nhắn AI vào model
      const botMessage = this.model.addMessage(aiResponse, false);
      
      // Xóa trạng thái đang nhập
      this.view.removeTypingIndicator(typingIndicator);
      
      // Hiển thị tin nhắn AI
      this.view.addBotMessage(
        botMessage.content,
        this.view.formatTime(new Date(botMessage.timestamp))
      );
    }, 1000 + Math.random() * 1000); // Độ trễ ngẫu nhiên 1-2 giây
  }
}

/**
 * Khởi tạo ChatBubbleController khi DOM sẵn sàng
 */
export function initChatBubble() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new ChatBubbleController();
    });
  } else {
    new ChatBubbleController();
  }
}

// Khởi động chat bubble
initChatBubble();