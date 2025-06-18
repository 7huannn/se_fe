// controllers/chat-bubbleController.js
import ChatBubbleModel from "../models/chat-bubble.js";
import ChatBubbleView from "../views/chat-bubbleView.js";

/**
 * Controller cho Floating Chat Bubble với backend integration
 * Kết nối model và view, xử lý logic
 */
export default class ChatBubbleController {
  constructor(apiEndpoint = 'api/agents/call_event_agents') {
    this.model = new ChatBubbleModel();
    this.view = new ChatBubbleView();
    
    // Cấu hình API endpoint
    this.model.setApiEndpoint(apiEndpoint);
    
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
    
    // Khởi tạo với tin nhắn chào mừng
    this.model.initializeWelcomeMessage();
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
   * Xử lý gửi tin nhắn với backend API
   */
  async sendMessage() {
    // Lấy tin nhắn từ input
    const message = this.view.getInputMessage();
    if (!message) return;
    
    // Disable input khi đang xử lý
    this.view.setInputDisabled(true);
    
    // Lưu tin nhắn người dùng vào model
    const userMessage = this.model.addMessage(message, true);
    
    // Hiển thị tin nhắn người dùng trên giao diện
    this.view.addUserMessage(
      userMessage.content, 
      this.view.formatTime(new Date(userMessage.timestamp))
    );
    
    // Hiển thị trạng thái đang nhập
    const typingIndicator = this.view.showTypingIndicator();
    
    try {
      // Gửi request đến backend và nhận phản hồi
      const aiResponse = await this.model.getAIResponse(message);
      
      // Lưu tin nhắn AI vào model
      const botMessage = this.model.addMessage(aiResponse, false);
      
      // Xóa trạng thái đang nhập
      this.view.removeTypingIndicator(typingIndicator);
      
      // Hiển thị tin nhắn AI
      this.view.addBotMessage(
        botMessage.content,
        this.view.formatTime(new Date(botMessage.timestamp))
      );
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Xóa trạng thái đang nhập
      this.view.removeTypingIndicator(typingIndicator);
      
      // Hiển thị thông báo lỗi
      this.view.showError("Không thể kết nối đến server. Vui lòng thử lại.");
      
    } finally {
      // Enable lại input
      this.view.setInputDisabled(false);
    }
  }

  /**
   * Cập nhật API endpoint
   * @param {string} endpoint - URL endpoint mới
   */
  setApiEndpoint(endpoint) {
    this.model.setApiEndpoint(endpoint);
  }

  /**
   * Xóa lịch sử chat hiện tại
   */
  clearChat() {
    this.model.clearMessages();
    this.model.initializeWelcomeMessage();
    this.view.renderMessages(this.model.getMessages());
  }
}

/**
 * Khởi tạo ChatBubbleController khi DOM sẵn sàng
 * @param {string} apiEndpoint - URL endpoint cho API backend
 */
export function initChatBubble(apiEndpoint = '/api/chat') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new ChatBubbleController(apiEndpoint);
    });
  } else {
    new ChatBubbleController(apiEndpoint);
  }
}

// Khởi động chat bubble
// Thay đổi URL này để phù hợp với backend của bạn
initChatBubble('api/agents/call_event_agents');