// controllers/chat-bubbleController.js - FIXED MVC COMPLIANT VERSION

import ChatBubbleModel from "../models/chat-bubble.js";
import ChatBubbleView from "../views/chat-bubbleView.js";

/**
 * Controller chỉ chịu trách nhiệm điều phối giữa Model và View
 * Xử lý business logic và user interactions
 * Không thao tác DOM trực tiếp
 */
export default class ChatBubbleController {
  constructor() {
    this.model = new ChatBubbleModel();
    this.view = new ChatBubbleView();
    
    this.init();
  }

  /**
   * Initialize controller - COORDINATION LOGIC
   */
  init() {
    // Initialize view
    this.view.createElements();
    
    // Attach event listeners with controller methods
    this.view.attachEventListeners({
      expandChat: this.expandChat.bind(this),
      collapseChat: this.collapseChat.bind(this),
      sendMessage: this.sendMessage.bind(this)
    });
    
    // Update opacity periodically
    setInterval(() => this.view.updateBubbleOpacity(), 100);
    
    // Load messages from model
    this.model.loadMessages();
    
    // Render messages with formatting
    this.renderMessagesFromModel();
    
    // Auto-open on home page if needed
    this.handleAutoOpenLogic();
  }

  /**
   * Handle auto-open logic - BUSINESS LOGIC
   */
  handleAutoOpenLogic() {
    if (this.isHomePage()) {
      setTimeout(() => {
        this.expandChat();
        this.addWelcomeMessageForHomePage();
      }, 1500);
    }
  }

  /**
   * Check if current page is home - BUSINESS LOGIC
   */
  isHomePage() {
    const currentPath = window.location.pathname;
    
    return currentPath.includes('home.html') || 
           currentPath === '/' || 
           currentPath.endsWith('/') ||
           currentPath === '' ||
           currentPath.includes('index') && !currentPath.includes('personal') ||
           document.title.toLowerCase().includes('schedigo') && !document.title.toLowerCase().includes('calendar');
  }

  /**
   * Add welcome message for home page - BUSINESS LOGIC
   */
  addWelcomeMessageForHomePage() {
    const messages = this.model.getMessages();
    
    if (messages.length <= 1) {
      this.model.clearMessages();
      
      const welcomeMessage = this.getHomeWelcomeMessage();
      this.model.addMessage(welcomeMessage, false);
      
      this.renderMessagesFromModel();
    }
  }

  /**
   * Get contextual welcome message - BUSINESS LOGIC
   */
  getHomeWelcomeMessage() {
    const welcomeMessages = [
      "🎉 Chào mừng bạn đến với Schedigo! Tôi là trợ lý AI sẵn sàng giúp bạn tối ưu hóa thời gian và cuộc sống. Bạn muốn bắt đầu từ đâu?",
      "👋 Xin chào! Schedigo giúp bạn quản lý thời gian hiệu quả hơn. Tôi có thể hướng dẫn bạn sử dụng các tính năng hoặc trả lời câu hỏi. Bạn cần gì?",
      "✨ Chào bạn! Tôi là trợ lý AI của Schedigo. Với tôi, bạn có thể tạo lịch trình, quản lý nhóm, và tối ưu hóa công việc. Hãy thử hỏi tôi điều gì đó!",
      "🚀 Welcome to Schedigo! Tôi ở đây để giúp bạn làm chủ thời gian. Bạn muốn tìm hiểu về tính năng nào của chúng tôi?"
    ];
    
    return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  }

  /**
   * Expand chat - COORDINATE VIEW ACTION
   */
  expandChat() {
    this.view.expandChat();
  }

  /**
   * Collapse chat - COORDINATE VIEW ACTION
   */
  collapseChat() {
    this.view.collapseChat();
  }

  /**
   * Handle send message - BUSINESS LOGIC COORDINATION
   */
  sendMessage() {
    // Get message from view
    const message = this.view.getInputMessage();
    if (!message) return;
    
    // Process through model
    const userMessage = this.model.addMessage(message, true);
    
    // Format time for display
    const formattedTime = this.formatTime(new Date(userMessage.timestamp));
    
    // Update view
    this.view.addUserMessage(userMessage.content, formattedTime);
    
    // Show typing indicator
    const typingIndicator = this.view.showTypingIndicator();
    
    // Simulate AI processing delay
    setTimeout(() => {
      // Get AI response with context
      const aiResponse = this.getContextualResponse(message);
      
      // Process AI response through model
      const botMessage = this.model.addMessage(aiResponse, false);
      
      // Format AI response content (handle line breaks)
      const formattedContent = this.formatMessageContent(botMessage.content);
      const formattedTime = this.formatTime(new Date(botMessage.timestamp));
      
      // Remove typing indicator
      this.view.removeTypingIndicator(typingIndicator);
      
      // Update view with formatted content
      this.view.addBotMessage(formattedContent, formattedTime);
      
    }, 1000 + Math.random() * 1000);
  }

  /**
   * Get contextual AI response - BUSINESS LOGIC
   */
  getContextualResponse(message) {
    if (this.isHomePage()) {
      return this.getHomeContextResponse(message);
    }
    
    return this.model.getAIResponse(message);
  }

  /**
   * Get home-specific contextual response - BUSINESS LOGIC
   */
  getHomeContextResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    // Home-specific responses
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
    
    // Get normal response but add home-specific CTA
    const normalResponse = this.model.getAIResponse(message);
    
    if (Math.random() > 0.7) {
      return normalResponse + "\n\n💡 Tip: Hãy thử đăng ký để trải nghiệm đầy đủ tính năng của Schedigo!";
    }
    
    return normalResponse;
  }

  /**
   * Format message content for display - DATA FORMATTING
   */
  formatMessageContent(content) {
    // Convert line breaks to HTML
    return content.replace(/\n/g, '<br>');
  }

  /**
   * Format time for display - DATA FORMATTING
   */
  formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Render messages from model with formatting - COORDINATION
   */
  renderMessagesFromModel() {
    const messages = this.model.getMessages();
    
    // Format messages for view
    const formattedMessages = messages.map(msg => ({
      ...msg,
      formattedTime: this.formatTime(new Date(msg.timestamp)),
      formattedContent: msg.isUser ? msg.content : this.formatMessageContent(msg.content)
    }));
    
    this.view.renderMessages(formattedMessages);
  }

  /**
   * Clear all messages - COORDINATE MODEL AND VIEW
   */
  clearMessages() {
    this.model.clearMessages();
    this.view.clearMessages();
  }

  /**
   * Get messages count - DELEGATE TO MODEL
   */
  getMessagesCount() {
    return this.model.getMessages().length;
  }

  /**
   * Check if chat is expanded - DELEGATE TO VIEW
   */
  isChatExpanded() {
    return this.view.isExpanded();
  }
}

/**
 * Initialize chat bubble when DOM is ready
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

// Auto-initialize
initChatBubble();