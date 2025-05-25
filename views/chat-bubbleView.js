// views/chat-bubbleView.js - FIXED MVC COMPLIANT VERSION

/**
 * View chỉ chịu trách nhiệm về presentation và DOM manipulation
 * Không chứa business logic hoặc data processing
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
    this.autoOpened = false;
  }

  /**
   * Create DOM elements - PURE DOM CREATION
   */
  createElements() {
    this.container = document.createElement('div');
    this.container.className = 'floating-chat-container';
    
    this.bubble = document.createElement('div');
    this.bubble.className = 'floating-chat-bubble';
    this.bubble.innerHTML = '<i class="chat-icon">💬</i>';
    this.bubble.style.opacity = this.opacity.toString();
    
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
    
    this.container.appendChild(this.bubble);
    this.container.appendChild(this.panel);
    document.body.appendChild(this.container);
    
    // Store references
    this.messagesContainer = this.panel.querySelector('.chat-messages');
    this.chatInput = this.panel.querySelector('.chat-input');
    this.sendButton = this.panel.querySelector('.send-btn');
    this.minimizeButton = this.panel.querySelector('.minimize-btn');
    this.closeButton = this.panel.querySelector('.close-btn');
    
    return this.container;
  }

  /**
   * Attach event listeners - PURE EVENT BINDING
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
    
    // Click events - dispatch to controller
    this.bubble.addEventListener('click', events.expandChat);
    this.minimizeButton.addEventListener('click', events.collapseChat);
    this.closeButton.addEventListener('click', events.collapseChat);
    
    // Input events
    this.sendButton.addEventListener('click', events.sendMessage);
    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') events.sendMessage();
    });
  }

  /**
   * Get input message and clear field - PURE UI INTERACTION
   */
  getInputMessage() {
    const message = this.chatInput.value.trim();
    this.chatInput.value = '';
    return message;
  }

  /**
   * Add user message to chat - PURE DOM MANIPULATION
   * Text formatting is handled by controller/model
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
   * Add bot message to chat - PURE DOM MANIPULATION
   * Accepts pre-formatted HTML from controller
   */
  addBotMessage(formattedText, time) {
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message bot-message';
    messageEl.innerHTML = `
      <div class="message-bubble">${formattedText}</div>
      <div class="message-time">${time}</div>
    `;
    
    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }

  /**
   * Show typing indicator - PURE UI STATE
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
   * Remove typing indicator - PURE DOM MANIPULATION
   */
  removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  }

  /**
   * Expand chat with animation - PURE UI ANIMATION
   */
  expandChat() {
    this.isExpanded = true;
    this.autoOpened = true;
    
    this.panel.style.display = 'flex';
    this.panel.style.transform = 'translateY(20px)';
    this.panel.style.opacity = '0';
    this.bubble.style.display = 'none';
    
    setTimeout(() => {
      this.panel.style.transition = 'all 0.3s ease';
      this.panel.style.transform = 'translateY(0)';
      this.panel.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
      this.chatInput.focus();
      if (this.autoOpened) {
        this.addWelcomePulse();
      }
    }, 350);
  }

  /**
   * Collapse chat with animation - PURE UI ANIMATION
   */
  collapseChat() {
    this.isExpanded = false;
    this.autoOpened = false;
    
    this.panel.style.transition = 'all 0.3s ease';
    this.panel.style.transform = 'translateY(20px)';
    this.panel.style.opacity = '0';
    
    setTimeout(() => {
      this.panel.style.display = 'none';
      this.bubble.style.display = 'flex';
      this.panel.style.transition = '';
      this.panel.style.transform = '';
      this.panel.style.opacity = '';
    }, 300);
  }

  /**
   * Add welcome pulse effect - PURE UI ANIMATION
   */
  addWelcomePulse() {
    this.panel.classList.add('welcome-pulse');
    setTimeout(() => {
      this.panel.classList.remove('welcome-pulse');
    }, 2000);
  }

  /**
   * Update bubble opacity - PURE UI STATE
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
   * Scroll to bottom - PURE UI INTERACTION
   */
  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  /**
   * Render messages from data - PURE PRESENTATION
   * Accepts formatted message data from controller
   */
  renderMessages(formattedMessages) {
    this.messagesContainer.innerHTML = '';
    
    formattedMessages.forEach(msg => {
      if (msg.isUser) {
        this.addUserMessage(msg.content, msg.formattedTime);
      } else {
        this.addBotMessage(msg.formattedContent, msg.formattedTime);
      }
    });
    
    this.scrollToBottom();
  }

  /**
   * Clear all messages - PURE UI RESET
   */
  clearMessages() {
    this.messagesContainer.innerHTML = '';
  }

  /**
   * Set chat input value - PURE UI STATE
   */
  setChatInputValue(value) {
    this.chatInput.value = value;
  }

  /**
   * Focus on input - PURE UI INTERACTION
   */
  focusInput() {
    this.chatInput.focus();
  }

  /**
   * Check if chat is expanded - PURE STATE CHECK
   */
  isExpanded() {
    return this.isExpanded;
  }

  /**
   * Set bubble opacity - PURE UI STATE
   */
  setBubbleOpacity(opacity) {
    this.opacity = opacity;
    this.updateBubbleOpacity();
  }

  /**
   * Show/hide panel - PURE UI STATE CONTROL
   */
  showPanel() {
    this.panel.style.display = 'flex';
  }

  hidePanel() {
    this.panel.style.display = 'none';
  }

  /**
   * Show/hide bubble - PURE UI STATE CONTROL
   */
  showBubble() {
    this.bubble.style.display = 'flex';
  }

  hideBubble() {
    this.bubble.style.display = 'none';
  }
}