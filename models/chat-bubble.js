// models/chat-bubble.js
/**
 * Model cho Floating Chat Bubble
 * Xử lý dữ liệu và logic nghiệp vụ liên quan đến chat 
 */
export default class ChatBubbleModel {
  constructor() {
    this.messages = [];
    this.initializeResponses();
  }

  /**
   * Thêm tin nhắn mới vào lịch sử chat
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
    
    // Lưu vào localStorage để giữ lịch sử chat giữa các lần ghé thăm
    this._saveMessages();
    
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
   * Khởi tạo và load tin nhắn từ localStorage nếu có
   */
  loadMessages() {
    const savedMessages = localStorage.getItem('schedigo_chat_messages');
    if (savedMessages) {
      try {
        this.messages = JSON.parse(savedMessages);
      } catch (e) {
        console.error("Error loading messages:", e);
        this.messages = [];
      }
    }
    
    // Nếu không có tin nhắn, thêm tin nhắn chào mừng
    if (this.messages.length === 0) {
      this.addMessage("Xin chào! Tôi là trợ lý AI của Schedigo. Bạn cần tôi giúp gì hôm nay?", false);
    }
  }

  /**
   * Lưu tin nhắn vào localStorage
   * @private
   */
  _saveMessages() {
    try {
      localStorage.setItem('schedigo_chat_messages', JSON.stringify(this.messages));
    } catch (e) {
      console.error("Error saving messages:", e);
    }
  }

  /**
   * Xóa tất cả tin nhắn
   */
  clearMessages() {
    this.messages = [];
    this._saveMessages();
  }

  /**
   * Khởi tạo các phản hồi có sẵn từ AI
   */
  initializeResponses() {
    this.responses = {
      greetings: [
        "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
        "Chào bạn! Bạn cần tôi giúp đỡ về vấn đề gì?",
        "Xin chào! Tôi là trợ lý AI của Schedigo."
      ],
      calendar: [
        "Tôi có thể giúp bạn quản lý lịch. Bạn có muốn tạo sự kiện mới không?",
        "Lịch của bạn đang trống. Bạn có muốn thêm sự kiện không?",
        "Tôi có thể giúp bạn xem, tạo hoặc chỉnh sửa sự kiện lịch. Bạn muốn làm gì?"
      ],
      teams: [
        "Bạn có thể tạo hoặc tham gia nhóm từ trang Teams. Bạn có muốn tôi hướng dẫn bạn đến đó không?",
        "Không gian làm việc nhóm cho phép bạn cộng tác. Bạn cần trợ giúp về điều gì cụ thể?",
        "Teams giúp bạn cộng tác với người khác. Bạn có thể tạo nhóm mới hoặc tham gia nhóm hiện có."
      ],
      group_calendar: [
        "Lịch nhóm giúp bạn quản lý sự kiện chung. Bạn muốn xem lịch nhóm nào?",
        "Bạn có thể thêm sự kiện vào lịch nhóm. Bạn muốn làm điều đó không?",
        "Tôi có thể giúp bạn quản lý lịch nhóm. Bạn cần tạo hay xem sự kiện nào?"
      ],
      help: [
        "Tôi đang ở đây để giúp đỡ! Bạn có thể hỏi tôi về sự kiện lịch, nhóm hoặc điều hướng.",
        "Bạn cần trợ giúp? Tôi có thể giúp với lịch trình, quản lý nhóm và nhiều thứ khác.",
        "Tôi có thể hỗ trợ bạn điều gì? Tôi có thể giúp với lịch, nhóm, điều hướng và nhiều thứ khác."
      ],
      fallback: [
        "Tôi không chắc mình hiểu. Bạn có thể diễn đạt lại câu hỏi của mình không?",
        "Tôi vẫn đang học. Bạn có thể thử hỏi theo cách khác không?",
        "Tôi chưa có câu trả lời cho điều đó. Có điều gì khác tôi có thể giúp bạn không?"
      ]
    };
  }

  /**
   * Xử lý và trả về phản hồi dựa trên tin nhắn người dùng
   * @param {string} message - Tin nhắn của người dùng
   * @returns {string} Phản hồi từ AI
   */
  getAIResponse(message) {
    // Xử lý tin nhắn để xác định phản hồi
    let responseType = 'fallback';
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('xin chào') || lowerMsg.includes('chào') || lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
      responseType = 'greetings';
    } else if (lowerMsg.includes('lịch') || lowerMsg.includes('sự kiện') || lowerMsg.includes('event') || lowerMsg.includes('calendar')) {
      responseType = 'calendar';
    } else if (lowerMsg.includes('nhóm') || lowerMsg.includes('team') || lowerMsg.includes('group')) {
      if (lowerMsg.includes('lịch nhóm') || lowerMsg.includes('group calendar')) {
        responseType = 'group_calendar';
      } else {
        responseType = 'teams';
      }
    } else if (lowerMsg.includes('giúp') || lowerMsg.includes('trợ giúp') || lowerMsg.includes('help')) {
      responseType = 'help';
    }
    
    // Lấy phản hồi ngẫu nhiên từ danh mục đã chọn
    const responses = this.responses[responseType];
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }
}