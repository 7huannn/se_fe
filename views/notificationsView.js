// views/notificationsView.js - Updated version
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
  
  // Đảm bảo container có positioning
  const notificationsIcon = notificationBtn.closest('.notifications-icon');
  if (notificationsIcon) {
    notificationsIcon.style.position = 'relative';
  }
  
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
        <div class="empty-noti hidden">No notifications</div>
      </div>
    `;
    
    // Thêm vào container thay vì body
    if (notificationsIcon) {
      notificationsIcon.appendChild(notificationDropdown);
    } else {
      // Fallback: thêm vào body với positioning tuyệt đối
      document.body.appendChild(notificationDropdown);
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
  
  // Thêm styles ngay khi khởi tạo
  if (!document.getElementById('notification-styles')) {
    addNotificationStyles();
  }
  
  /**
   * Toggle dropdown hiển thị
   */
  function toggleDropdown() {
    if (!notificationDropdown) return;
    
    const isShowing = notificationDropdown.classList.contains('show');
    
    if (isShowing) {
      notificationDropdown.classList.remove('show');
    } else {
      // Đóng các dropdown khác trước khi mở
      closeOtherDropdowns();
      notificationDropdown.classList.add('show');
      
      // Tính toán vị trí nếu cần thiết
      positionDropdown();
    }
  }
  
  /**
   * Đóng các dropdown khác
   */
  function closeOtherDropdowns() {
    // Đóng team dropdown nếu có
    const teamDropdown = document.getElementById('teamDropdown');
    if (teamDropdown) {
      teamDropdown.classList.remove('show');
    }
    
    // Đóng profile dropdown nếu có
    const profileMenu = document.getElementById('profile-menu');
    if (profileMenu) {
      profileMenu.classList.remove('show');
    }
  }
  
  /**
   * Tính toán và điều chỉnh vị trí dropdown
   */
  function positionDropdown() {
    if (!notificationDropdown || !notificationBtn) return;
    
    const btnRect = notificationBtn.getBoundingClientRect();
    const dropdownRect = notificationDropdown.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    
    // Nếu dropdown vượt quá màn hình bên phải, điều chỉnh
    if (btnRect.right + dropdownRect.width > viewportWidth) {
      notificationDropdown.style.right = '0';
      notificationDropdown.style.left = 'auto';
    }
  }
  
  /**
   * Thêm CSS styles - PHIÊN BẢN CẬP NHẬT
   */
  function addNotificationStyles() {
    const styleEl = document.createElement('style');
    styleEl.id = 'notification-styles';
    styleEl.textContent = `
      /* Container chứa notification */
      .notifications-icon {
        position: relative !important;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 1rem;
        height: 100%;
      }
      
      /* Notification Button */
      .notification-btn {
        position: relative;
        background: transparent !important;
        border: none !important;
        padding: 8px !important;
        margin: 0 !important;
        outline: none !important;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background-color 0.2s;
      }
      
      .notification-btn:hover {
        background-color: rgba(0, 0, 0, 0.05) !important;
      }
      
      /* Notification Badge */
      .notification-badge {
        position: absolute;
        top: 2px;
        right: 2px;
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
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 1;
      }
      
      .notification-badge.has-notifications {
        opacity: 1;
      }
      
      /* Notification Dropdown - FIX CHÍNH */
      .notification-dropdown {
        position: absolute !important;
        top: calc(100% + 8px) !important;
        right: 0 !important;
        background: #fff;
        border: 1px solid #e1e1e1;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        border-radius: 8px;
        width: 320px;
        max-height: 400px;
        overflow: visible;
        z-index: 2100 !important;
        display: none;
        animation: fadeInDown 0.2s ease;
      }
      
      .notification-dropdown.show {
        display: block !important;
      }
      
      /* Header của dropdown */
      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #eee;
        background-color: #f9f9f9;
        border-radius: 8px 8px 0 0;
      }
      
      .notification-header h3 {
        margin: 0;
        font-size: 16px;
        color: #333;
        font-weight: 600;
      }
      
      .notification-clear-btn {
        background: none;
        border: none;
        color: #0078d4;
        cursor: pointer;
        font-size: 14px;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }
      
      .notification-clear-btn:hover {
        background-color: rgba(0, 120, 212, 0.1);
        text-decoration: underline;
      }
      
      /* List container */
      .notification-list-container {
        max-height: 320px;
        overflow-y: auto;
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
        cursor: pointer;
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
        color: #333;
        line-height: 1.4;
      }
      
      .notification-time {
        font-size: 12px;
        color: #666;
      }
      
      .notification-item.unread {
        background-color: #f0f7ff;
        border-left: 3px solid #0078d4;
      }
      
      .notification-item.unread:hover {
        background-color: #e5f1ff;
      }
      
      .empty-noti {
        padding: 32px 16px;
        text-align: center;
        color: #999;
        font-style: italic;
      }
      
      .hidden {
        display: none !important;
      }
      
      /* Animation */
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
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .notification-dropdown {
          width: 280px;
          right: -20px;
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
    
    // Đóng dropdown
    if (notificationDropdown) {
      notificationDropdown.classList.remove('show');
    }
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

// Các function khác giữ nguyên như cũ...
export function renderNotificationItem(notification) {
  const item = document.createElement('li');
  item.className = `notification-item ${notification.read ? '' : 'unread'}`;
  
  const timeAgo = formatTimeAgo(notification.timestamp);
  
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

export function notifyEventCreated(toaster) {
  toaster.success("Event has been created");
}

export function notifyEventDeleted(toaster) {
  toaster.success("Event has been deleted");
}

export function notifyEventEdited(toaster) {
  toaster.success("Event has been edited");
}