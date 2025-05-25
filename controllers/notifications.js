// controllers/notifications.js - FIXED VERSION

/**
 * Initialize notifications controller
 * This file was missing and causing errors
 */
export function initNotificationsController() {
  console.log("Initializing Notifications Controller");
  
  // Find notification button
  const notificationBtn = document.querySelector('.notification-btn');
  if (!notificationBtn) {
    console.warn("Notification button not found, creating basic structure");
    return createBasicNotificationStructure();
  }

  // Initialize notification system
  let notifications = loadNotifications();
  let isDropdownOpen = false;

  // Create dropdown if it doesn't exist
  let dropdown = createNotificationDropdown();
  
  // Update badge with current notification count
  updateNotificationBadge(getUnreadCount(notifications));

  // Bind events
  bindNotificationEvents();

  // Listen for new notifications
  listenForAppEvents();

  /**
   * Create basic notification structure if elements are missing
   */
  function createBasicNotificationStructure() {
    // Find a suitable container (like header or top navigation)
    const header = document.querySelector('header') || document.querySelector('.topbar') || document.querySelector('nav');
    if (!header) {
      console.warn("No suitable container found for notifications");
      return {};
    }

    // Create notification button
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'notifications-icon';
    notificationContainer.innerHTML = `
      <button class="notification-btn" title="Notifications">
        🔔
        <span class="notification-badge"></span>
      </button>
    `;

    header.appendChild(notificationContainer);
    
    // Reinitialize with the new elements
    return initNotificationsController();
  }

  /**
   * Create notification dropdown
   */
  function createNotificationDropdown() {
    let dropdown = document.querySelector('.notification-dropdown');
    if (dropdown) return dropdown;

    dropdown = document.createElement('div');
    dropdown.className = 'notification-dropdown';
    dropdown.innerHTML = `
      <div class="notification-header">
        <h3>Notifications</h3>
        <button class="notification-clear-btn">Clear all</button>
      </div>
      <div class="notification-list-container">
        <ul class="notification-list"></ul>
        <div class="empty-noti hidden">No notifications</div>
      </div>
    `;

    // Position dropdown relative to notification button
    const container = notificationBtn.closest('.notifications-icon') || notificationBtn.parentElement;
    if (container) {
      container.style.position = 'relative';
      container.appendChild(dropdown);
    } else {
      document.body.appendChild(dropdown);
    }

    // Add basic styles
    addNotificationStyles();

    return dropdown;
  }

  /**
   * Bind notification events
   */
  function bindNotificationEvents() {
    // Toggle dropdown on notification button click
    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown();
    });

    // Clear all notifications
    const clearBtn = dropdown.querySelector('.notification-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        clearAllNotifications();
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (isDropdownOpen && !dropdown.contains(e.target) && e.target !== notificationBtn) {
        closeDropdown();
      }
    });
  }

  /**
   * Listen for application events to create notifications
   */
  function listenForAppEvents() {
    // Event notifications
    document.addEventListener('event-create', (e) => {
      const eventData = e.detail.event || e.detail;
      addNotification({
        type: 'event-create',
        message: `Event "${eventData.title}" created`,
        timestamp: Date.now(),
        read: false,
        icon: '➕'
      });
    });

    document.addEventListener('event-edit', (e) => {
      const eventData = e.detail.event || e.detail;
      addNotification({
        type: 'event-edit',
        message: `Event "${eventData.title}" updated`,
        timestamp: Date.now(),
        read: false,
        icon: '✏️'
      });
    });

    document.addEventListener('event-delete', (e) => {
      const eventData = e.detail.event || e.detail;
      addNotification({
        type: 'event-delete',
        message: `Event "${eventData.title || 'Event'}" deleted`,
        timestamp: Date.now(),
        read: false,
        icon: '🗑️'
      });
    });

    // Team notifications
    document.addEventListener('team-create', (e) => {
      const teamData = e.detail.team;
      addNotification({
        type: 'team-create',
        message: `Team "${teamData.name}" created`,
        timestamp: Date.now(),
        read: false,
        icon: '👥'
      });
    });
  }

  /**
   * Toggle notification dropdown
   */
  function toggleDropdown() {
    if (isDropdownOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  /**
   * Open notification dropdown
   */
  function openDropdown() {
    dropdown.classList.add('show');
    isDropdownOpen = true;
    renderNotifications();
    markAllAsRead();
  }

  /**
   * Close notification dropdown
   */
  function closeDropdown() {
    dropdown.classList.remove('show');
    isDropdownOpen = false;
  }

  /**
   * Add new notification
   */
  function addNotification(notification) {
    notifications.unshift({
      id: Date.now(),
      ...notification
    });

    // Limit to 50 notifications
    if (notifications.length > 50) {
      notifications = notifications.slice(0, 50);
    }

    saveNotifications(notifications);
    updateNotificationBadge(getUnreadCount(notifications));
  }

  /**
   * Mark all notifications as read
   */
  function markAllAsRead() {
    notifications = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(notifications);
    updateNotificationBadge(0);
  }

  /**
   * Clear all notifications
   */
  function clearAllNotifications() {
    notifications = [];
    saveNotifications(notifications);
    updateNotificationBadge(0);
    renderNotifications();
  }

  /**
   * Render notifications in dropdown
   */
  function renderNotifications() {
    const notificationList = dropdown.querySelector('.notification-list');
    const emptyNotification = dropdown.querySelector('.empty-noti');

    notificationList.innerHTML = '';

    if (notifications.length === 0) {
      emptyNotification.classList.remove('hidden');
      return;
    }

    emptyNotification.classList.add('hidden');

    notifications.forEach(notification => {
      const item = document.createElement('li');
      item.className = `notification-item ${notification.read ? '' : 'unread'}`;
      item.innerHTML = `
        <div class="notification-icon">${notification.icon || '🔔'}</div>
        <div class="notification-content">
          <div class="notification-message">${notification.message}</div>
          <div class="notification-time">${formatTimeAgo(notification.timestamp)}</div>
        </div>
      `;
      notificationList.appendChild(item);
    });
  }

  /**
   * Update notification badge
   */
  function updateNotificationBadge(count) {
    const badge = notificationBtn.querySelector('.notification-badge');
    if (!badge) return;

    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.classList.add('has-notifications');
    } else {
      badge.textContent = '';
      badge.classList.remove('has-notifications');
    }
  }

  /**
   * Get unread notification count
   */
  function getUnreadCount(notifications) {
    return notifications.filter(n => !n.read).length;
  }

  /**
   * Format timestamp to relative time
   */
  function formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  /**
   * Load notifications from storage
   */
  function loadNotifications() {
    try {
      const stored = localStorage.getItem('schedigo_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading notifications:', e);
      return [];
    }
  }

  /**
   * Save notifications to storage
   */
  function saveNotifications(notifications) {
    try {
      localStorage.setItem('schedigo_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error('Error saving notifications:', e);
    }
  }

  /**
   * Add basic notification styles
   */
  function addNotificationStyles() {
    if (document.getElementById('notification-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
      .notifications-icon {
        position: relative;
        display: inline-block;
      }
      
      .notification-btn {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        position: relative;
        padding: 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }
      
      .notification-btn:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
      
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
        display: none;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }
      
      .notification-badge.has-notifications {
        display: flex;
      }
      
      .notification-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        width: 300px;
        max-height: 400px;
        z-index: 1000;
        display: none;
      }
      
      .notification-dropdown.show {
        display: block;
      }
      
      .notification-header {
        padding: 12px 16px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .notification-header h3 {
        margin: 0;
        font-size: 16px;
      }
      
      .notification-clear-btn {
        background: none;
        border: none;
        color: #007bff;
        cursor: pointer;
        font-size: 14px;
      }
      
      .notification-list-container {
        max-height: 300px;
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
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      
      .notification-item:last-child {
        border-bottom: none;
      }
      
      .notification-item.unread {
        background-color: #f8f9fa;
        border-left: 3px solid #007bff;
      }
      
      .notification-icon {
        font-size: 16px;
        flex-shrink: 0;
      }
      
      .notification-content {
        flex: 1;
      }
      
      .notification-message {
        font-size: 14px;
        margin-bottom: 4px;
      }
      
      .notification-time {
        font-size: 12px;
        color: #666;
      }
      
      .empty-noti {
        padding: 20px;
        text-align: center;
        color: #666;
      }
      
      .hidden {
        display: none;
      }
    `;
    
    document.head.appendChild(styles);
  }

  console.log("Notifications Controller initialized successfully");

  return {
    addNotification,
    clearAllNotifications,
    markAllAsRead,
    getNotifications: () => notifications,
    getUnreadCount: () => getUnreadCount(notifications)
  };
}