// models/chat-bubble.js
import { apiClient } from '../services/api.js';

/**
 * Model cho Floating Chat Bubble với authentication
 * Xử lý dữ liệu và logic nghiệp vụ liên quan đến chat với backend
 */
export default class ChatBubbleModel {
  constructor() {
    this.messages = [];
    this.apiEndpoint = 'api/agents/call_event_agents'; // Endpoint tương đối cho chat API
    this.apiClient = apiClient;
  }

  /**
   * Thêm tin nhắn mới vào lịch sử chat (chỉ trong session hiện tại)
   * @param {string} content - Nội dung tin nhắn
   * @param {boolean} isUser - true nếu do người dùng gửi, false nếu do AI
   * @returns {object} Tin nhắn đã tạo
   */
  addMessage(content, isUser) {
    const message = {
      id: Date.now(),
      content,
      isUser,
      timestamp: new Date().toISOString()
    };
    
    this.messages.push(message);
    return message;
  }

  /**
   * Lấy tất cả tin nhắn
   * @returns {Array} Danh sách tin nhắn
   */
  getMessages() {
    return this.messages;
  }

  /**
   * Khởi tạo với tin nhắn chào mừng
   */
  initializeWelcomeMessage() {
    if (this.messages.length === 0) {
      this.addMessage("Xin chào! Tôi là trợ lý AI của Schedigo. Bạn cần tôi giúp gì hôm nay?", false);
    }
  }

  /**
   * Xóa tất cả tin nhắn (chỉ trong session hiện tại)
   */
  clearMessages() {
    this.messages = [];
  }

  /**
   * Kiểm tra trạng thái authentication
   * @returns {boolean} True nếu user đã authenticated
   */
  isAuthenticated() {
    return !!this.apiClient.token;
  }

  /**
   * Gửi tin nhắn đến backend và nhận phản hồi
   * @param {string} message - Tin nhắn của người dùng
   * @returns {Promise<string>} Phản hồi từ AI agent
   */
  async getAIResponse(message) {
    try {
      // Kiểm tra authentication
      if (!this.apiClient.token) {
        throw new Error('AUTHENTICATION_REQUIRED');
      }
      console.log('Calling AI agent with message:', message);
      const data = await this.apiClient.post(this.apiEndpoint, {
        user_input: message ,
      });
      console.log('AI agent response:', data);
      
      // Backend trả về { response: "AI response text" } hoặc { message: "AI response text" }
      return data.response || data.message.output || "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.";
      
    } catch (error) {
      console.error('Error calling AI agent:', error);
      
      // Xử lý lỗi authentication
      if (error.message === 'AUTHENTICATION_REQUIRED') {
        throw error;
      }
      
      // Fallback response cho các lỗi khác
      return this.getFallbackResponse(message);
    }
  }

  /**
   * Phản hồi dự phòng khi không thể kết nối backend
   * @param {string} message - Tin nhắn của người dùng
   * @returns {string} Phản hồi dự phòng
   */
  getFallbackResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('xin chào') || lowerMsg.includes('chào') || lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
      return "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?";
    } else if (lowerMsg.includes('lịch') || lowerMsg.includes('sự kiện') || lowerMsg.includes('event') || lowerMsg.includes('calendar')) {
      return "Tôi có thể giúp bạn quản lý lịch. Bạn có muốn tạo sự kiện mới không?";
    } else if (lowerMsg.includes('nhóm') || lowerMsg.includes('team') || lowerMsg.includes('group')) {
      return "Bạn có thể tạo hoặc tham gia nhóm từ trang Teams. Bạn có muốn tôi hướng dẫn bạn đến đó không?";
    } else if (lowerMsg.includes('giúp') || lowerMsg.includes('trợ giúp') || lowerMsg.includes('help')) {
      return "Tôi đang ở đây để giúp đỡ! Bạn có thể hỏi tôi về sự kiện lịch, nhóm hoặc điều hướng.";
    } else {
      return "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.";
    }
  }

  /**
   * Cập nhật API endpoint
   * @param {string} endpoint - URL endpoint mới
   */
  setApiEndpoint(endpoint) {
    this.apiEndpoint = endpoint;
  }

  /**
   * Lấy thông tin authentication status
   * @returns {object} Thông tin về authentication
   */
  getAuthStatus() {
    return {
      isAuthenticated: this.isAuthenticated(),
      hasToken: !!this.apiClient.token
    };
  }
}
