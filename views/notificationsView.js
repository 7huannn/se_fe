// views/notificationsView.js
import { initToaster } from "./toasterView.js";

/**
 * Khởi tạo view cho notifications:
 * - Tạo cấu trúc dropdown nếu chưa có
 * - Trả về các elements và API
 */
export function initNotificationsView() {
  const notificationBtn = document.querySelector('.notification-btn');
  if (!notificationBtn) return {};
  
  // Khởi tạo toaster
  const toaster = initToaster(document.body);
  
  // Tìm hoặc tạo badge
  let notificationBadge = notificationBtn.querySelector('.notification-badge');
  if (!notificationBadge) {
    notificationBadge = document.createElement('span');
    notificationBadge.className = 'notification-badge';
    notificationBtn.appendChild(notificationBadge);
  }
  
  // Tìm hoặc tạo dropdown
  let notificationDropdown = document.querySelector('.notification-dropdown');
  let notificationList, emptyNotification;
  
  if (!notificationDropdown) {
    // Tạo dropdown nếu chưa có
    notificationDropdown = document.createElement('div');
    notificationDropdown.className = 'notification-dropdown';
    notificationDropdown.innerHTML = `
      <div class="notification-header">
        <h3>Notifications</h3>
        <button class="notification-clear-btn" title="Clear all">Clear all</button>
      </div>
      <div class="notification-list-container">
        <ul class="notification-list"></ul>
        <div class="empty-noti">No notifications</div>
      </div>
    `;
    
    // Thêm vào parent container
    const notificationsIcon = notificationBtn.closest('.notifications-icon');
    if (notificationsIcon) {
      notificationsIcon.style.position = 'relative';
      notificationsIcon.appendChild(notificationDropdown);
    }
  }
  
  // Lấy elements trong dropdown
  notificationList = notificationDropdown.querySelector('.notification-list');
  emptyNotification = notificationDropdown.querySelector('.empty-noti');
  
  // Nút Clear all
  const clearBtn = notificationDropdown.querySelector('.notification-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearNotifications();
    });
  }
  
  /**
   * Toggle dropdown hiển thị
   */
  function toggleDropdown() {
    if (!notificationDropdown) return;
    
    notificationDropdown.classList.toggle('show');
    
    // Thêm style cho notification dropdown nếu chưa có
    if (!document.getElementById('notification-styles')) {
      addNotificationStyles();
    }
  }
  
  /**
   * Thêm CSS styles nếu chưa có
   */
  function addNotificationStyles() {
    const styleEl = document.createElement('style');
    styleEl.id = 'notification-styles';
    styleEl.textContent = `
      /* Notification Badge */
      .notification-badge {
        position: absolute;
        top: 0;
        right: 0;
        background-color: #e74c3c;
        color: white;
        font-size: 10px;
        min-width: 16px;
        height: 16px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        transform: translate(25%, -25%);
        opacity: 0;
        transition: opacity 0.2s;
      }
      
      .notification-badge.has-notifications {
        opacity: 1;
      }
      
      /* Notification Dropdown */
      .notification-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: #fff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        width: 300px;
        max-height: 400px;
        overflow-y: auto;
        border-radius: 4px;
        z-index: 100;
        display: none;
        animation: fadeInDown 0.3s;
      }
      
      .notification-dropdown.show {
        display: block;
      }
      
      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #eee;
        background-color: #f9f9f9;
      }
      
      .notification-header h3 {
        margin: 0;
        font-size: 16px;
        color: #333;
      }
      
      .notification-clear-btn {
        background: none;
        border: none;
        color: #0078d4;
        cursor: pointer;
        font-size: 14px;
        padding: 4px 8px;
      }
      
      .notification-clear-btn:hover {
        text-decoration: underline;
      }
      
      .notification-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      
      .notification-item {
        padding: 12px 16px;
        border-bottom: 1px solid #eee;
        transition: background-color 0.2s;
      }
      
      .notification-item:hover {
        background-color: #f5f5f5;
      }
      
      .notification-item:last-child {
        border-bottom: none;
      }
      
      .notification-message {
        font-size: 14px;
        margin-bottom: 4px;
      }
      
      .notification-time {
        font-size: 12px;
        color: #666;
      }
      
      .notification-item.unread {
        background-color: #f0f7ff;
      }
      
      .notification-item.unread:hover {
        background-color: #e5f1ff;
      }
      
      .empty-noti {
        padding: 16px;
        text-align: center;
        color: #999;
      }
      
      .hidden {
        display: none;
      }
      
      @keyframes fadeInDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    
    document.head.appendChild(styleEl);
  }
  
  /**
   * Cập nhật badge hiển thị số thông báo
   * @param {number} count - Số thông báo chưa đọc
   */
  function updateBadge(count) {
    if (!notificationBadge) return;
    
    if (count > 0) {
      notificationBadge.textContent = count > 9 ? '9+' : count;
      notificationBadge.classList.add('has-notifications');
    } else {
      notificationBadge.textContent = '';
      notificationBadge.classList.remove('has-notifications');
    }
  }
  
  /**
   * Xóa tất cả thông báo
   */
  function clearNotifications() {
    // Xóa từ localStorage
    localStorage.removeItem('schedigo_notifications');
    
    // Cập nhật UI
    if (notificationList) {
      notificationList.innerHTML = '';
    }
    
    if (emptyNotification) {
      emptyNotification.classList.remove('hidden');
    }
    
    // Cập nhật badge
    updateBadge(0);
  }
  
  return {
    notificationBtn,
    notificationBadge,
    notificationDropdown,
    notificationList,
    emptyNotification,
    toggleDropdown,
    updateBadge,
    toaster
  };
}

/**
 * Render một notification item
 * @param {Object} notification - Thông tin notification
 * @returns {HTMLElement} Element đã render
 */
export function renderNotificationItem(notification) {
  const item = document.createElement('li');
  item.className = `notification-item ${notification.read ? '' : 'unread'}`;
  
  // Format thời gian
  const timeAgo = formatTimeAgo(notification.timestamp);
  
  // Thêm icon phù hợp với loại thông báo
  let icon = '📅';
  if (notification.type === 'create') icon = '➕';
  else if (notification.type === 'edit') icon = '✏️';
  else if (notification.type === 'delete') icon = '🗑️';
  
  item.innerHTML = `
    <div class="notification-message">${icon} ${notification.message}</div>
    <div class="notification-time">${timeAgo}</div>
  `;
  
  return item;
}

/**
 * Format timestamp thành định dạng "x phút/giờ/ngày trước"
 * @param {number} timestamp - Timestamp cần format
 * @returns {string} Chuỗi đã format
 */
function formatTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

/**
 * View layer cho notifications toast:
 * - Sử dụng instance toaster để hiển thị thông báo
 */
export function notifyEventCreated(toaster) {
  toaster.success("Event has been created");
}

export function notifyEventDeleted(toaster) {
  toaster.success("Event has been deleted");
}

export function notifyEventEdited(toaster) {
  toaster.success("Event has been edited");
}