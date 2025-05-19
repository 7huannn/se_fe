// views/group/chatView.js

/**
 * Khởi tạo UI chat
 */
export function initChatUI() {
    // Xử lý toggle các section
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
        header.addEventListener('click', () => toggleChatSection(header));
    });
    
    // Xử lý khi nhấn nút gửi
    const sendButton = document.querySelector('.send-button');
    const chatInput = document.querySelector('.chat-input');
    
    if (sendButton && chatInput) {
        sendButton.addEventListener('click', () => {
            sendMessage(chatInput);
        });
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage(chatInput);
            }
        });
    }
    
    return {
        sendButton,
        chatInput
    };
}

/**
 * Xử lý khi gửi tin nhắn
 * @param {HTMLInputElement} chatInput - Input nhập tin nhắn
 */
export function sendMessage(chatInput) {
    const message = chatInput.value.trim();
    if (message) {
        // Dispatch event để controller xử lý
        document.dispatchEvent(new CustomEvent('chat-message-send', {
            detail: { message },
            bubbles: true
        }));
        
        // Xóa nội dung input
        chatInput.value = '';
    }
}

/**
 * Toggle hiển thị section trong chat
 * @param {HTMLElement} header - Element header của section
 */
export function toggleChatSection(header) {
    const content = header.nextElementSibling;
    const toggle = header.querySelector('.section-toggle');
    
    if (content && toggle) {
        if (content.style.display === 'none') {
            content.style.display = 'block';
            toggle.textContent = '▼';
        } else {
            content.style.display = 'none';
            toggle.textContent = '►';
        }
    }
}

/**
 * Hiển thị một tin nhắn trong chat
 * @param {string} message - Nội dung tin nhắn
 * @param {string} timestamp - Thời gian gửi tin nhắn
 */
export function displayChatMessage(message, timestamp) {
    // Xóa trạng thái trống
    const emptyChat = document.querySelector('.empty-chat');
    if (emptyChat) {
        emptyChat.style.display = 'none';
    }
    
    // Hiển thị tin nhắn
    const chatContent = document.querySelector('.chat-content');
    if (chatContent) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message-container sent';
        messageElement.innerHTML = `
            <div class="message-bubble">
                <div class="message-text">${message}</div>
                <div class="message-time">${timestamp || 'Just now'}</div>
            </div>
        `;
        chatContent.appendChild(messageElement);
        
        // Scroll xuống cuối
        chatContent.scrollTop = chatContent.scrollHeight;
    }
}