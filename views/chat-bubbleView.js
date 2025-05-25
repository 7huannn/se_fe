// views/chat-bubbleView.js - UPDATED VERSION
/**
 * View cho Floating Chat Bubble
 * Xử lý hiển thị và tương tác UI
 */
export default class ChatBubbleView {
  constructor() {
    this.container = null;
    this.bubble = null;
    this.panel = null;
    this.messagesContainer = null;
    this.chatInput = null;
    this.sendButton = null;
    this.minimizeButton = null;
    this.closeButton = null;
    
    this.isExpanded = false;
    this.isMouseOver = false;
    this.opacity = 0.6;
    this.autoOpened = false; // NEW: Track if auto-opened
  }

  /**
   * Khởi tạo các DOM elements
   * @returns {HTMLElement} Container element chứa chat bubble
   */
  createElements() {
    // Tạo container chính
    this.container = document.createElement('div');
    this.container.className = 'floating-chat-container';
    
    // Tạo chat bubble
    this.bubble = document.createElement('div');
    this.bubble.className = 'floating-chat-bubble';
    this.bubble.innerHTML = '<i class="chat-icon">💬</i>';
    this.bubble.style.opacity = this.opacity.toString();
    
    // Tạo chat panel (ẩn ban đầu)
    this.panel = document.createElement('div');
    this.panel.className = 'floating-chat-panel';
    this.panel.style.display = 'none';
    this.panel.innerHTML = `
      <div class="chat-header-boxchat">
        <div class="chat-title">Trợ lý AI</div>
        <div class="chat-actions">
          <button class="minimize-btn" title="Thu nhỏ">-</button>
          <button class="close-btn" title="Đóng">×</button>
        </div>
      </div>
      <div class="chat-messages"></div>
      <div class="chat-input-container">
        <input type="text" class="chat-input" placeholder="Nhập tin nhắn...">
        <button class="send-btn" title="Gửi">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    `;
    
    // Thêm vào container
    this.container.appendChild(this.bubble);
    this.container.appendChild(this.panel);
    
    // Thêm vào body
    document.body.appendChild(this.container);
    
    // Lưu tham chiếu đến các elements
    this.messagesContainer = this.panel.querySelector('.chat-messages');
    this.chatInput = this.panel.querySelector('.chat-input');
    this.sendButton = this.panel.querySelector('.send-btn');
    this.minimizeButton = this.panel.querySelector('.minimize-btn');
    this.closeButton = this.panel.querySelector('.close-btn');
    
    return this.container;
  }

  /**
   * Đính kèm các event listener cho tương tác
   * @param {Object} events - Các hàm callback cho sự kiện
   */
  attachEventListeners(events) {
    // Bubble hover effects
    this.bubble.addEventListener('mouseenter', () => {
      this.isMouseOver = true;
      this.updateBubbleOpacity();
    });
    
    this.bubble.addEventListener('mouseleave', () => {
      this.isMouseOver = false;
      this.updateBubbleOpacity();
    });
    
    // Click để mở rộng/thu gọn
    this.bubble.addEventListener('click', events.expandChat);
    this.minimizeButton.addEventListener('click', events.collapseChat);
    this.closeButton.addEventListener('click', events.collapseChat);
    
    // Gửi tin nhắn
    this.sendButton.addEventListener('click', events.sendMessage);
    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') events.sendMessage();
    });
  }

  /**
   * Thêm tin nhắn từ người dùng vào chat
   * @param {string} text - Nội dung tin nhắn
   * @param {string} time - Thời gian định dạng
   */
  addUserMessage(text, time) {
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message user-message';
    messageEl.innerHTML = `
      <div class="message-bubble">${text}</div>
      <div class="message-time">${time}</div>
    `;
    
    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }

  /**
   * Thêm tin nhắn từ bot vào chat
   * @param {string} text - Nội dung tin nhắn
   * @param {string} time - Thời gian định dạng
   */
  addBotMessage(text, time) {
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message bot-message';
    
    // NEW: Support for formatted messages (with line breaks)
    const formattedText = text.replace(/\n/g, '<br>');
    
    messageEl.innerHTML = `
      <div class="message-bubble">${formattedText}</div>
      <div class="message-time">${time}</div>
    `;
    
    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }

  /**
   * Hiển thị chỉ báo đang nhập
   * @returns {HTMLElement} Element chỉ báo đang nhập
   */
  showTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    this.messagesContainer.appendChild(typingIndicator);
    this.scrollToBottom();
    return typingIndicator;
  }

  /**
   * Xóa chỉ báo đang nhập
   * @param {HTMLElement} indicator - Element chỉ báo đang nhập
   */
  removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  }

  /**
   * Mở rộng chat panel - UPDATED with animation support
   */
  expandChat() {
    this.isExpanded = true;
    this.autoOpened = true; // Mark as auto-opened
    
    // NEW: Add smooth opening animation
    this.panel.style.display = 'flex';
    this.panel.style.transform = 'translateY(20px)';
    this.panel.style.opacity = '0';
    
    // Hide bubble
    this.bubble.style.display = 'none';
    
    // Animate in
    setTimeout(() => {
      this.panel.style.transition = 'all 0.3s ease';
      this.panel.style.transform = 'translateY(0)';
      this.panel.style.opacity = '1';
    }, 10);
    
    // Focus vào input sau khi animation
    setTimeout(() => {
      this.chatInput.focus();
      
      // NEW: Add welcome pulse effect for auto-opened chat
      if (this.autoOpened) {
        this.addWelcomePulse();
      }
    }, 350);
  }

  /**
   * NEW: Add welcome pulse effect
   */
  addWelcomePulse() {
    this.panel.classList.add('welcome-pulse');
    
    // Remove the effect after animation
    setTimeout(() => {
      this.panel.classList.remove('welcome-pulse');
    }, 2000);
  }

  /**
   * Thu gọn chat panel - UPDATED with animation
   */
  collapseChat() {
    this.isExpanded = false;
    this.autoOpened = false;
    
    // Animate out
    this.panel.style.transition = 'all 0.3s ease';
    this.panel.style.transform = 'translateY(20px)';
    this.panel.style.opacity = '0';
    
    // Hide panel and show bubble after animation
    setTimeout(() => {
      this.panel.style.display = 'none';
      this.bubble.style.display = 'flex';
      
      // Reset transform for next opening
      this.panel.style.transition = '';
      this.panel.style.transform = '';
      this.panel.style.opacity = '';
    }, 300);
  }

  /**
   * Cập nhật độ mờ của bubble dựa trên trạng thái hover
   */
  updateBubbleOpacity() {
    if (this.isExpanded) return;
    
    if (this.isMouseOver) {
      this.bubble.style.opacity = '1';
    } else {
      this.bubble.style.opacity = this.opacity.toString();
    }
  }

  /**
   * Cuộn chat xuống cuối
   */
  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  /**
   * Lấy nội dung tin nhắn từ input và xóa input
   * @returns {string} Nội dung tin nhắn
   */
  getInputMessage() {
    const message = this.chatInput.value.trim();
    this.chatInput.value = '';
    return message;
  }

  /**
   * Vẽ lại tất cả tin nhắn trong lịch sử - UPDATED with formatting support
   * @param {Array} messages - Danh sách tin nhắn
   */
  renderMessages(messages) {
    this.messagesContainer.innerHTML = '';
    
    messages.forEach(msg => {
      const time = this.formatTime(new Date(msg.timestamp));
      if (msg.isUser) {
        this.addUserMessage(msg.content, time);
      } else {
        this.addBotMessage(msg.content, time);
      }
    });
    
    this.scrollToBottom();
  }

  /**
   * Định dạng thời gian
   * @param {Date} date - Đối tượng Date
   * @returns {string} Thời gian đã định dạng
   */
  formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}