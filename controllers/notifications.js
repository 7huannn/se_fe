// controllers/notifications.js
import { initNotificationsView, renderNotificationItem } from "../views/notificationsView.js";

/**
 * Controller để khởi tạo notifications:
 * - Bắt các sự kiện liên quan đến notifications
 * - Xử lý thông báo event, cập nhật badge, toggle dropdown
 */
export function initNotificationsController() {
  // Khởi tạo view, lấy các elements và API
  const { 
    notificationBtn, 
    notificationBadge,
    notificationDropdown,
    notificationList,
    emptyNotification,
    toggleDropdown, 
    updateBadge,
    toaster
  } = initNotificationsView();
  
  if (!notificationBtn) return;
  
  // Mảng lưu trữ thông báo
  let notifications = loadNotifications();
  let unreadCount = countUnreadNotifications(notifications);
  
  // Cập nhật badge ban đầu
  updateBadge(unreadCount);
  
  // Toggle dropdown khi click vào button
  notificationBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown();
    renderNotifications();
    
    // Đánh dấu tất cả là đã đọc khi mở dropdown
    if (unreadCount > 0) {
      markAllAsRead();
    }
  });
  
  // Đóng dropdown khi click ra ngoài
  document.addEventListener("click", (e) => {
    if (notificationDropdown && notificationDropdown.classList.contains('show')) {
      if (!notificationDropdown.contains(e.target) && e.target !== notificationBtn) {
        toggleDropdown();
      }
    }
  });
  
  // Lắng nghe sự kiện tạo event để thêm notification
  document.addEventListener("event-create", (e) => {
    const eventData = e.detail;
    addNotification({
      type: 'create',
      message: `Event "${eventData.event.title}" created`,
      timestamp: Date.now(),
      read: false,
      eventId: eventData.event.id
    });
    
    // Hiển thị toast nếu đã khởi tạo
    if (toaster) {
      toaster.success("Event has been created");
    }
  });
  
  // Lắng nghe sự kiện sửa event
  document.addEventListener("event-edit", (e) => {
    const eventData = e.detail;
    addNotification({
      type: 'edit',
      message: `Event "${eventData.event.title}" updated`,
      timestamp: Date.now(),
      read: false,
      eventId: eventData.event.id
    });
    
    // Hiển thị toast nếu đã khởi tạo
    if (toaster) {
      toaster.success("Event has been edited");
    }
  });
  
  // Lắng nghe sự kiện xoá event
  document.addEventListener("event-delete", (e) => {
    const eventData = e.detail;
    addNotification({
      type: 'delete',
      message: `Event "${eventData.title || 'Event'}" deleted`,
      timestamp: Date.now(),
      read: false
    });
    
    // Hiển thị toast nếu đã khởi tạo
    if (toaster) {
      toaster.success("Event has been deleted");
    }
  });
  
  /**
   * Thêm notification mới
   * @param {Object} notification - Thông tin notification
   */
  function addNotification(notification) {
    // Thêm vào đầu mảng
    notifications.unshift(notification);
    
    // Giới hạn số lượng thông báo (giữ 20 thông báo gần nhất)
    if (notifications.length > 20) {
      notifications = notifications.slice(0, 20);
    }
    
    // Lưu vào localStorage
    saveNotifications(notifications);
    
    // Cập nhật số lượng chưa đọc
    unreadCount++;
    updateBadge(unreadCount);
  }
  
  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  function markAllAsRead() {
    notifications.forEach(notification => {
      notification.read = true;
    });
    
    // Lưu vào localStorage
    saveNotifications(notifications);
    
    // Cập nhật badge
    unreadCount = 0;
    updateBadge(0);
  }
  
  /**
   * Render danh sách thông báo
   */
  function renderNotifications() {
    if (!notificationList || !emptyNotification) return;
    
    // Clear current list
    notificationList.innerHTML = '';
    
    if (notifications.length === 0) {
      // Show empty message
      emptyNotification.classList.remove('hidden');
    } else {
      // Hide empty message
      emptyNotification.classList.add('hidden');
      
      // Render each notification
      notifications.forEach(notification => {
        const notificationItem = renderNotificationItem(notification);
        notificationList.appendChild(notificationItem);
      });
    }
  }
  
  /**
   * Lấy thông báo từ localStorage
   * @returns {Array} Danh sách thông báo
   */
  function loadNotifications() {
    try {
      const stored = localStorage.getItem('schedigo_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading notifications', error);
      return [];
    }
  }
  
  /**
   * Lưu thông báo vào localStorage
   * @param {Array} notifications - Danh sách thông báo
   */
  function saveNotifications(notifications) {
    try {
      localStorage.setItem('schedigo_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications', error);
    }
  }
  
  /**
   * Đếm số thông báo chưa đọc
   * @param {Array} notifications - Danh sách thông báo
   * @returns {number} Số thông báo chưa đọc
   */
  function countUnreadNotifications(notifications) {
    return notifications.filter(notification => !notification.read).length;
  }
  
  // Public API
  return {
    toaster
  };
}