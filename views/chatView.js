// views/chatView.js
import { handleSendMessage } from "../controllers/chat.js";

export function initChatView() {
    // Khởi tạo UI chat
    initChatUI();
}

function initChatUI() {
    // Xử lý toggle các section
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const toggle = this.querySelector('.section-toggle');
            
            if (content && toggle) {
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    toggle.textContent = '▼';
                } else {
                    content.style.display = 'none';
                    toggle.textContent = '►';
                }
            }
        });
    });
    
    // Xử lý khi nhấn nút gửi
    const sendButton = document.querySelector('.send-button');
    const chatInput = document.querySelector('.chat-input');
    
    if (sendButton && chatInput) {
        sendButton.addEventListener('click', function() {
            sendMessage();
        });
        
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (handleSendMessage(message)) {
            // Xóa nội dung input
            chatInput.value = '';
            
            // Xóa trạng thái trống
            const emptyChat = document.querySelector('.empty-chat');
            if (emptyChat) {
                emptyChat.style.display = 'none';
            }
            
            // Hiển thị tin nhắn
            displayMessage(message);
        }
    }
}

// Hiển thị tin nhắn trong giao diện
export function displayMessage(message) {
    const chatContent = document.querySelector('.chat-content');
    if (chatContent) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message-container sent';
        messageElement.innerHTML = `
            <div class="message-bubble">
                <div class="message-text">${message}</div>
                <div class="message-time">Just now</div>
            </div>
        `;
        chatContent.appendChild(messageElement);
        
        // Scroll xuống cuối
        chatContent.scrollTop = chatContent.scrollHeight;
    }
}