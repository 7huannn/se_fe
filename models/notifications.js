// models/notifications.js - NEW MVC COMPLIANT VERSION

/**
 * Model chỉ chịu trách nhiệm về data và business logic
 * Không can thiệp vào UI hoặc DOM
 */
export class NotificationsModel {
  constructor() {
    this.storageKey = 'schedigo_notifications';
  }

  /**
   * Load notifications from localStorage - PURE DATA OPERATION
   */
  loadNotifications() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading notifications', error);
      return [];
    }
  }

  /**
   * Save notifications to localStorage - PURE DATA OPERATION
   */
  saveNotifications(notifications) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications', error);
    }
  }

  /**
   * Count unread notifications - PURE BUSINESS LOGIC
   */
  countUnreadNotifications(notifications) {
    return notifications.filter(notification => !notification.read).length;
  }

  /**
   * Add new notification - PURE DATA MANIPULATION
   */
  addNotification(notifications, notification) {
    const updatedNotifications = [notification, ...notifications];
    
    // Keep only last 50 notifications
    if (updatedNotifications.length > 50) {
      return updatedNotifications.slice(0, 50);
    }
    
    return updatedNotifications;
  }

  /**
   * Mark all notifications as read - PURE DATA MANIPULATION
   */
  markAllAsRead(notifications) {
    return notifications.map(notification => ({
      ...notification,
      read: true
    }));
  }

  /**
   * Filter notifications by category - PURE DATA FILTERING
   */
  filterNotifications(notifications, filter) {
    if (filter === 'all') {
      return notifications;
    }
    
    return notifications.filter(notification => 
      notification.category === filter
    );
  }

  /**
   * Create event notification - PURE BUSINESS LOGIC
   */
  createEventNotification(type, eventData) {
    const notification = {
      id: Date.now() + Math.random(),
      type: `event-${type}`,
      category: 'event',
      timestamp: Date.now(),
      read: false,
      eventId: eventData.id
    };

    switch (type) {
      case 'create':
        notification.message = `Event "${eventData.title}" created`;
        notification.icon = '➕';
        break;
      case 'edit':
        notification.message = `Event "${eventData.title}" updated`;
        notification.icon = '✏️';
        break;
      case 'delete':
        notification.message = `Event "${eventData.title || 'Event'}" deleted`;
        notification.icon = '🗑️';
        break;
      default:
        notification.message = `Event "${eventData.title}" modified`;
        notification.icon = '📅';
    }

    return notification;
  }

  /**
   * Create team notification - PURE BUSINESS LOGIC
   */
  createTeamNotification(type, teamData, updateData = null) {
    const notification = {
      id: Date.now() + Math.random(),
      type: `team-${type}`,
      category: 'team',
      timestamp: Date.now(),
      read: false,
      teamId: teamData.id,
      priority: 'high'
    };

    switch (type) {
      case 'create':
        notification.message = `Team "${teamData.name}" created successfully`;
        notification.details = `You are now a leader of this team with ${teamData.members ? teamData.members.length : 1} member${teamData.members && teamData.members.length !== 1 ? 's' : ''}`;
        notification.icon = '🎉👥';
        break;
      case 'edit':
        notification.message = `Team "${teamData.name}" details updated`;
        notification.icon = '✏️';
        notification.priority = 'low';
        break;
      case 'delete':
        notification.message = `Team "${teamData.name}" has been deleted`;
        notification.icon = '🗑️👥';
        break;
      default:
        notification.message = `Team "${teamData.name}" modified`;
        notification.icon = '👥';
    }

    return notification;
  }

  /**
   * Create team member notification - PURE BUSINESS LOGIC
   */
  createTeamMemberNotification(type, team, member) {
    const notification = {
      id: Date.now() + Math.random(),
      type: `team-member-${type}`,
      category: 'team',
      timestamp: Date.now(),
      read: false,
      teamId: team.id,
      memberId: member.id,
      priority: 'medium'
    };

    switch (type) {
      case 'add':
        notification.message = `${member.name || member.email} added to team "${team.name}"`;
        notification.details = `Role: ${member.role || 'Member'}`;
        notification.icon = '➕👤';
        break;
      case 'remove':
        notification.message = `${member.name || member.email} removed from team "${team.name}"`;
        notification.icon = '➖👤';
        break;
      default:
        notification.message = `Member ${member.name || member.email} modified in team "${team.name}"`;
        notification.icon = '👤';
    }

    return notification;
  }

  /**
   * Create team role change notification - PURE BUSINESS LOGIC
   */
  createTeamRoleChangeNotification(team, member, newRole) {
    const roleText = newRole === 'leader' ? 'promoted to Leader' : 'changed to Member';
    const icon = newRole === 'leader' ? '👑' : '👤';
    
    return {
      id: Date.now() + Math.random(),
      type: 'team-member-role-change',
      category: 'team',
      message: `${member.name || member.email} ${roleText} in team "${team.name}"`,
      timestamp: Date.now(),
      read: false,
      teamId: team.id,
      memberId: member.id,
      newRole: newRole,
      icon: icon,
      priority: 'medium'
    };
  }

  /**
   * Create team privacy change notification - PURE BUSINESS LOGIC
   */
  createTeamPrivacyNotification(team, newPrivacy) {
    const privacyText = newPrivacy === 'private' ? 'Private' : 'Public';
    const icon = newPrivacy === 'private' ? '🔒' : '🌐';
    
    return {
      id: Date.now() + Math.random(),
      type: 'team-privacy-update',
      category: 'team',
      message: `Team "${team.name}" changed to ${privacyText}`,
      timestamp: Date.now(),
      read: false,
      teamId: team.id,
      newPrivacy: newPrivacy,
      icon: icon,
      priority: 'low'
    };
  }

  /**
   * Format notifications for display - PURE DATA FORMATTING
   */
  formatNotificationsForDisplay(notifications) {
    return notifications.map(notification => ({
      ...notification,
      formattedTime: this.formatTimeAgo(notification.timestamp),
      displayIcon: notification.icon || this.getDefaultIcon(notification.type)
    }));
  }

  /**
   * Format timestamp to relative time - PURE DATA FORMATTING
   */
  formatTimeAgo(timestamp) {
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
   * Get default icon for notification type - PURE BUSINESS LOGIC
   */
  getDefaultIcon(type) {
    const iconMap = {
      'event-create': '➕',
      'event-edit': '✏️',
      'event-delete': '🗑️',
      'team-create': '👥',
      'team-edit': '✏️',
      'team-delete': '🗑️👥',
      'team-member-add': '➕👤',
      'team-member-remove': '➖👤',
      'team-member-role-change': '👑',
      'team-privacy-update': '🔒'
    };
    
    return iconMap[type] || '📅';
  }

  /**
   * Group notifications by category - PURE DATA GROUPING
   */
  groupNotificationsByCategory(notifications) {
    return notifications.reduce((groups, notification) => {
      const category = notification.category || 'general';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(notification);
      return groups;
    }, {});
  }

  /**
   * Get category display name - PURE DATA MAPPING
   */
  getCategoryDisplayName(category) {
    const categoryNames = {
      'event': '📅 Events',
      'team': '👥 Teams',
      'general': '🔔 General'
    };
    
    return categoryNames[category] || '🔔 General';
  }

  /**
   * Check if notification should show desktop notification - PURE BUSINESS LOGIC
   */
  shouldShowDesktopNotification(notification) {
    return notification.category === 'team' && 
           ['high', 'medium'].includes(notification.priority) &&
           ['team-member-added-to', 'team-role-changed-self', 'team-member-removed-from', 'team-delete'].includes(notification.type);
  }

  /**
   * Get notification priority color - PURE DATA MAPPING
   */
  getNotificationPriorityColor(priority) {
    const colors = {
      'high': '#e74c3c',
      'medium': '#f39c12',
      'low': '#3498db'
    };
    
    return colors[priority] || colors.medium;
  }

  /**
   * Find event by ID - PURE DATA RETRIEVAL
   */
  findEventById(eventId) {
    try {
      // Try personal events first
      const personalEvents = JSON.parse(localStorage.getItem('events') || '[]');
      const personalEvent = personalEvents.find(e => e.id === eventId);
      if (personalEvent) {
        return {
          ...personalEvent,
          date: new Date(personalEvent.date)
        };
      }
      
      // Try team events
      const teams = JSON.parse(localStorage.getItem('schedigo_teams') || '[]');
      for (const team of teams) {
        const teamEventsKey = `team_events_${team.id}`;
        const teamEvents = JSON.parse(localStorage.getItem(teamEventsKey) || '[]');
        const teamEvent = teamEvents.find(e => e.id === eventId);
        if (teamEvent) {
          return {
            ...teamEvent,
            date: new Date(teamEvent.date)
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding event by ID:', error);
      return null;
    }
  }
}