// services/notificationsService.js - Notifications management service
import { apiClient } from './api.js';

class NotificationsService {
  constructor() {
    this.notifications = [];
    this.unreadCount = 0;
    this.listeners = [];
  }

  // Get all notifications for current user
  async getNotifications() {
    try {
      const response = await apiClient.get('/api/notifications/');
      
      this.notifications = response.map(notification => this.parseNotificationData(notification));
      this.unreadCount = this.notifications.filter(n => !n.read).length;
      
      // Notify listeners
      this.notifyListeners('notifications_updated', {
        notifications: this.notifications,
        unreadCount: this.unreadCount
      });
      
      return {
        success: true,
        notifications: this.notifications,
        unreadCount: this.unreadCount
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status,
        notifications: [],
        unreadCount: 0
      };
    }
  }

  // Mark notification as read (frontend only - API doesn't have this endpoint)
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      
      // Notify listeners
      this.notifyListeners('notification_read', {
        notificationId,
        unreadCount: this.unreadCount
      });
    }
  }

  // Mark all notifications as read (frontend only)
  markAllAsRead() {
    let readCount = 0;
    this.notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        readCount++;
      }
    });
    
    this.unreadCount = 0;
    
    // Notify listeners
    this.notifyListeners('all_notifications_read', {
      readCount,
      unreadCount: this.unreadCount
    });
  }

  // Clear all notifications (frontend only)
  clearAllNotifications() {
    const clearedCount = this.notifications.length;
    this.notifications = [];
    this.unreadCount = 0;
    
    // Notify listeners
    this.notifyListeners('notifications_cleared', {
      clearedCount
    });
  }

  // Filter notifications by type
  filterNotifications(type = 'all') {
    if (type === 'all') {
      return this.notifications;
    }
    
    return this.notifications.filter(notification => {
      switch (type) {
        case 'event':
          return ['event_created', 'event_updated', 'event_deleted'].includes(notification.type);
        case 'group':
          return [
            'group_invite', 'kicked_from_group', 'role_updated', 
            'leader_transferred', 'group_deleted'
          ].includes(notification.type);
        default:
          return notification.type === type;
      }
    });
  }

  // Get notifications by category with counts
  getNotificationsByCategory() {
    const categories = {
      all: this.notifications,
      event: this.filterNotifications('event'),
      group: this.filterNotifications('group')
    };

    return {
      categories,
      counts: {
        all: this.notifications.length,
        event: categories.event.length,
        group: categories.group.length,
        unread: this.unreadCount
      }
    };
  }

  // Parse notification data from API
  parseNotificationData(notificationData) {
    const parsed = { ...notificationData };
    
    // Convert timestamps
    if (parsed.created_at) {
      parsed.createdAt = new Date(parsed.created_at);
      parsed.timestamp = parsed.created_at;
    }
    
    // Map backend field names
    if (parsed.user_id) {
      parsed.userId = parsed.user_id;
    }
    
    if (parsed.group_id) {
      parsed.groupId = parsed.group_id;
    }
    
    if (parsed.event_id) {
      parsed.eventId = parsed.event_id;
    }
    
    // Add read status (API doesn't provide this, so default to false for new notifications)
    if (parsed.read === undefined) {
      parsed.read = false;
    }
    
    // Format display data
    parsed.formattedTime = this.formatTimeAgo(parsed.createdAt || new Date());
    parsed.displayIcon = this.getNotificationIcon(parsed.type);
    parsed.category = this.getNotificationCategory(parsed.type);
    parsed.priority = this.getNotificationPriority(parsed.type);
    
    return parsed;
  }

  // Get notification icon
  getNotificationIcon(type) {
    const iconMap = {
      'event_created': '➕',
      'event_updated': '✏️',
      'event_deleted': '🗑️',
      'group_invite': '📩👥',
      'kicked_from_group': '➖👤',
      'role_updated': '👑',
      'leader_transferred': '👑',
      'group_deleted': '🗑️👥',
    };
    
    return iconMap[type] || '🔔';
  }

  // Get notification category
  getNotificationCategory(type) {
    const eventTypes = ['event_created', 'event_updated', 'event_deleted'];
    const groupTypes = ['group_invite', 'kicked_from_group', 'role_updated', 'leader_transferred', 'group_deleted'];
    
    if (eventTypes.includes(type)) return 'event';
    if (groupTypes.includes(type)) return 'group';
    return 'general';
  }

  // Get notification priority
  getNotificationPriority(type) {
    const highPriority = ['group_invite', 'kicked_from_group', 'leader_transferred', 'group_deleted'];
    const mediumPriority = ['role_updated', 'event_created', 'event_updated'];
    
    if (highPriority.includes(type)) return 'high';
    if (mediumPriority.includes(type)) return 'medium';
    return 'low';
  }

  // Format time ago
  formatTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - new Date(timestamp);
    
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

  // ============ EVENT LISTENERS ============

  // Add event listener
  addEventListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // Remove event listener
  removeEventListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  // Notify listeners
  notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in notification listener:', error);
        }
      });
    }
  }

  // ============ BROWSER NOTIFICATIONS ============

  // Request notification permission
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      return 'not-supported';
    }
    
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission;
    }
    
    return Notification.permission;
  }

  // Show browser notification
  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const options = {
        body: notification.message,
        icon: '/favicon.ico', // Adjust path as needed
        tag: `schedigo-${notification.category}-${notification.id}`,
        requireInteraction: notification.priority === 'high'
      };
      
      const browserNotification = new Notification('Schedigo - New Notification', options);
      
      // Auto close after 5 seconds if not high priority
      if (notification.priority !== 'high') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
      
      // Handle click
      browserNotification.onclick = () => {
        window.focus();
        this.handleNotificationClick(notification);
        browserNotification.close();
      };
    }
  }

  // Handle notification click
  handleNotificationClick(notification) {
    // Mark as read
    this.markAsRead(notification.id);
    
    // Navigate based on notification type
    switch (notification.category) {
      case 'event':
        if (notification.eventId) {
          // Dispatch custom event for event details
          document.dispatchEvent(new CustomEvent('show-event-details', {
            detail: { eventId: notification.eventId }
          }));
        }
        break;
      
      case 'group':
        if (notification.groupId) {
          // Navigate to group page or dispatch custom event
          document.dispatchEvent(new CustomEvent('show-group-details', {
            detail: { groupId: notification.groupId }
          }));
        }
        break;
    }
  }

  // ============ UTILITY METHODS ============

  // Get current unread count
  getUnreadCount() {
    return this.unreadCount;
  }

  // Get all notifications
  getAllNotifications() {
    return this.notifications;
  }

  // Find notification by ID
  findNotificationById(id) {
    return this.notifications.find(n => n.id === id);
  }

  // Refresh notifications
  async refresh() {
    return await this.getNotifications();
  }
}

// Create singleton instance
const notificationsService = new NotificationsService();

export { notificationsService };