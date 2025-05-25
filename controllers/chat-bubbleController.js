// controllers/chat-bubbleController.js - UPDATED VERSION
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
    
    // NEW: Auto-open chat only on home page
    this.autoOpenOnHomePage();
  }

  /**
   * NEW: Tự động mở chat nếu đang ở trang home
   */
  autoOpenOnHomePage() {
    // Kiểm tra xem có phải trang home không
    if (this.isHomePage()) {
      // Delay một chút để đảm bảo trang đã load xong
      setTimeout(() => {
        this.expandChat();
        
        // Thêm tin nhắn chào mừng đặc biệt cho trang home
        this.addWelcomeMessage();
      }, 1500); // 1.5 giây sau khi trang load
    }
  }

  /**
   * NEW: Kiểm tra có phải trang home không
   * @returns {boolean}
   */
  isHomePage() {
    const currentPath = window.location.pathname;
    
    // Kiểm tra các pattern của trang home
    return currentPath.includes('home.html') || 
           currentPath === '/' || 
           currentPath.endsWith('/') ||
           currentPath === '' ||
           currentPath.includes('index') && !currentPath.includes('personal') ||
           document.title.toLowerCase().includes('schedigo') && !document.title.toLowerCase().includes('calendar');
  }

  /**
   * NEW: Thêm tin nhắn chào mừng đặc biệt cho trang home
   */
  addWelcomeMessage() {
    // Chỉ thêm tin nhắn chào mừng nếu chưa có tin nhắn nào hoặc chỉ có tin nhắn mặc định
    const messages = this.model.getMessages();
    
    // Nếu chỉ có 1 tin nhắn (tin nhắn mặc định) hoặc không có tin nhắn nào
    if (messages.length <= 1) {
      // Xóa tin nhắn cũ nếu có
      this.model.clearMessages();
      
      // Thêm tin nhắn chào mừng cho trang home
      const welcomeMessage = this.getHomeWelcomeMessage();
      const botMessage = this.model.addMessage(welcomeMessage, false);
      
      // Cập nhật giao diện
      this.view.renderMessages(this.model.getMessages());
    }
  }

  /**
   * NEW: Lấy tin nhắn chào mừng cho trang home
   * @returns {string}
   */
  getHomeWelcomeMessage() {
    const welcomeMessages = [
      "🎉 Chào mừng bạn đến với Schedigo! Tôi là trợ lý AI sẵn sàng giúp bạn tối ưu hóa thời gian và cuộc sống. Bạn muốn bắt đầu từ đâu?",
      "👋 Xin chào! Schedigo giúp bạn quản lý thời gian hiệu quả hơn. Tôi có thể hướng dẫn bạn sử dụng các tính năng hoặc trả lời câu hỏi. Bạn cần gì?",
      "✨ Chào bạn! Tôi là trợ lý AI của Schedigo. Với tôi, bạn có thể tạo lịch trình, quản lý nhóm, và tối ưu hóa công việc. Hãy thử hỏi tôi điều gì đó!",
      "🚀 Welcome to Schedigo! Tôi ở đây để giúp bạn làm chủ thời gian. Bạn muốn tìm hiểu về tính năng nào của chúng tôi?"
    ];
    
    // Chọn ngẫu nhiên một tin nhắn
    return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
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
      // Lấy phản hồi từ model với context cho trang home
      const aiResponse = this.getContextualResponse(message);
      
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

  /**
   * NEW: Lấy phản hồi có context tùy theo trang
   * @param {string} message - Tin nhắn của người dùng
   * @returns {string}
   */
  getContextualResponse(message) {
    // Nếu đang ở trang home, thêm context về việc bắt đầu sử dụng Schedigo
    if (this.isHomePage()) {
      return this.getHomeContextResponse(message);
    }
    
    // Nếu không phải trang home, dùng response thông thường
    return this.model.getAIResponse(message);
  }

  /**
   * NEW: Lấy phản hồi có context cho trang home
   * @param {string} message - Tin nhắn của người dùng
   * @returns {string}
   */
  getHomeContextResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    // Phản hồi đặc biệt cho trang home
    if (lowerMsg.includes('bắt đầu') || lowerMsg.includes('start') || lowerMsg.includes('begin')) {
      return "🎯 Tuyệt vời! Để bắt đầu với Schedigo, bạn có thể:\n\n📅 Tạo lịch cá nhân để quản lý công việc hàng ngày\n👥 Tham gia hoặc tạo nhóm để cộng tác\n🔍 Sử dụng AI để tối ưu hóa lịch trình\n\nBạn muốn thử tính năng nào trước?";
    }
    
    if (lowerMsg.includes('đăng ký') || lowerMsg.includes('sign up') || lowerMsg.includes('register')) {
      return "📝 Để đăng ký Schedigo, bạn chỉ cần click vào nút 'Sign in | Sign up' ở góc trên bên phải. Quá trình đăng ký rất đơn giản và nhanh chóng!";
    }
    
    if (lowerMsg.includes('tính năng') || lowerMsg.includes('feature') || lowerMsg.includes('làm được gì')) {
      return "⭐ Schedigo có nhiều tính năng mạnh mẽ:\n\n📊 Quản lý lịch cá nhân thông minh\n🤝 Cộng tác nhóm hiệu quả\n🔍 Tìm kiếm và phân tích lịch trình\n🤖 AI hỗ trợ tối ưu hóa thời gian\n📱 Đồng bộ đa thiết bị\n\nBạn muốn tìm hiểu chi tiết tính năng nào?";
    }
    
    if (lowerMsg.includes('giá') || lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('free')) {
      return "💰 Schedigo có cả phiên bản miễn phí và premium:\n\n🆓 Miễn phí: Quản lý lịch cơ bản, nhóm nhỏ\n⭐ Premium: Không giới hạn nhóm, AI advanced, analytics\n\nBạn có thể bắt đầu với phiên bản miễn phí ngay bây giờ!";
    }
    
    // Nếu không match các case đặc biệt, dùng response thông thường nhưng thêm context home
    const normalResponse = this.model.getAIResponse(message);
    
    // Thêm call-to-action cho trang home
    if (Math.random() > 0.7) { // 30% chance thêm CTA
      return normalResponse + "\n\n💡 Tip: Hãy thử đăng ký để trải nghiệm đầy đủ tính năng của Schedigo!";
    }
    
    return normalResponse;
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