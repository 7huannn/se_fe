// views/notificationsView.js - FIXED MVC COMPLIANT VERSION

/**
 * View chỉ chịu trách nhiệm về presentation và DOM manipulation
 * Không chứa business logic hoặc data processing
 */
export class NotificationsView {
  constructor() {
    this.notificationBtn = null;
    this.notificationBadge = null;
    this.notificationDropdown = null;
    this.notificationList = null;
    this.emptyNotification = null;
    this.filterMenu = null;
    this.isDropdownOpen = false;
  }

  /**
   * Initialize the notifications view - PURE UI SETUP
   */
  init() {
    this.notificationBtn = document.querySelector('.notification-btn');
    if (!this.notificationBtn) {
      console.warn("Notification button not found");
      return {};
    }

    this._setupNotificationBadge();
    this._setupNotificationDropdown();
    this._addNotificationStyles();

    return {
      notificationBtn: this.notificationBtn,
      notificationBadge: this.notificationBadge,
      notificationDropdown: this.notificationDropdown,
      notificationList: this.notificationList,
      emptyNotification: this.emptyNotification,
      toggleDropdown: this.toggleDropdown.bind(this),
      updateBadge: this.updateBadge.bind(this),
      toaster: this._createToaster()
    };
  }

  /**
   * Setup notification badge - PURE DOM CREATION
   */
  _setupNotificationBadge() {
    this.notificationBadge = this.notificationBtn.querySelector('.notification-badge');
    if (!this.notificationBadge) {
      this.notificationBadge = document.createElement('span');
      this.notificationBadge.className = 'notification-badge';
      this.notificationBtn.appendChild(this.notificationBadge);
    }
  }

  /**
   * Setup notification dropdown - PURE DOM CREATION
   */
  _setupNotificationDropdown() {
    const container = this.notificationBtn.closest('.notifications-icon');
    if (container) {
      container.style.position = 'relative';
    }

    this.notificationDropdown = document.querySelector('.notification-dropdown');
    if (!this.notificationDropdown) {
      this.notificationDropdown = document.createElement('div');
      this.notificationDropdown.className = 'notification-dropdown';
      this.notificationDropdown.innerHTML = `
        <div class="notification-header">
          <h3>Notifications</h3>
          <div class="notification-header-actions">
            <button class="notification-filter-btn" title="Filter notifications">🔽</button>
            <button class="notification-clear-btn" title="Clear all">Clear all</button>
          </div>
        </div>
        <div class="notification-filter-menu hidden">
          <button class="filter-option active" data-filter="all">All</button>
          <button class="filter-option" data-filter="event">Events</button>
          <button class="filter-option" data-filter="team">Teams</button>
        </div>
        <div class="notification-list-container">
          <ul class="notification-list"></ul>
          <div class="empty-noti hidden">No notifications</div>
        </div>
      `;

      if (container) {
        container.appendChild(this.notificationDropdown);
      } else {
        document.body.appendChild(this.notificationDropdown);
      }
    }

    // Store references
    this.notificationList = this.notificationDropdown.querySelector('.notification-list');
    this.emptyNotification = this.notificationDropdown.querySelector('.empty-noti');
    this.filterMenu = this.notificationDropdown.querySelector('.notification-filter-menu');
  }

  /**
   * Toggle dropdown visibility - PURE UI STATE
   */
  toggleDropdown() {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  /**
   * Open dropdown - PURE UI STATE
   */
  openDropdown() {
    if (!this.notificationDropdown) return;
    
    this._closeOtherDropdowns();
    this.notificationDropdown.classList.add('show');
    this.isDropdownOpen = true;
    this._positionDropdown();
  }

  /**
   * Close dropdown - PURE UI STATE
   */
  closeDropdown() {
    if (!this.notificationDropdown) return;
    
    this.notificationDropdown.classList.remove('show');
    this.isDropdownOpen = false;
    
    if (this.filterMenu) {
      this.filterMenu.classList.add('hidden');
    }
  }

  /**
   * Check if dropdown is open - PURE STATE CHECK
   */
  isDropdownOpen() {
    return this.isDropdownOpen;
  }

  /**
   * Check if click is inside dropdown - PURE UI INTERACTION
   */
  isClickInsideDropdown(target) {
    return this.notificationDropdown && this.notificationDropdown.contains(target);
  }

  /**
   * Update notification badge - PURE UI UPDATE
   */
  updateBadge(count) {
    if (!this.notificationBadge) return;
    
    if (count > 0) {
      this.notificationBadge.textContent = count > 9 ? '9+' : count;
      this.notificationBadge.classList.add('has-notifications');
    } else {
      this.notificationBadge.textContent = '';
      this.notificationBadge.classList.remove('has-notifications');
    }
  }

  /**
   * Render notifications list - PURE DOM RENDERING
   */
  renderNotifications(formattedNotifications) {
    if (!this.notificationList || !this.emptyNotification) return;

    this.notificationList.innerHTML = '';

    if (formattedNotifications.length === 0) {
      this.emptyNotification.classList.remove('hidden');
      return;
    }

    this.emptyNotification.classList.add('hidden');

    // Group notifications by category
    const groupedNotifications = this._groupNotificationsByCategory(formattedNotifications);

    // Render each group
    Object.entries(groupedNotifications).forEach(([category, categoryNotifications]) => {
      if (Object.keys(groupedNotifications).length > 1) {
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'notification-category-header';
        categoryHeader.textContent = this._getCategoryDisplayName(category);
        this.notificationList.appendChild(categoryHeader);
      }

      categoryNotifications.forEach(notification => {
        const notificationItem = this._createNotificationItem(notification);
        this.notificationList.appendChild(notificationItem);
      });
    });
  }

  /**
   * Bind clear all button - PURE EVENT BINDING
   */
  bindClearAllButton(callback) {
    const clearBtn = this.notificationDropdown?.querySelector('.notification-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        callback();
      });
    }
  }

  /**
   * Bind filter events - PURE EVENT BINDING
   */
  bindFilterEvents(callback) {
    const filterBtn = this.notificationDropdown?.querySelector('.notification-filter-btn');
    const filterOptions = this.notificationDropdown?.querySelectorAll('.filter-option');

    if (filterBtn && this.filterMenu) {
      filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.filterMenu.classList.toggle('hidden');
      });
    }

    if (filterOptions) {
      filterOptions.forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();

          // Update active filter
          filterOptions.forEach(opt => opt.classList.remove('active'));
          option.classList.add('active');

          // Call callback with filter
          const filter = option.dataset.filter;
          callback(filter);

          // Hide filter menu
          if (this.filterMenu) {
            this.filterMenu.classList.add('hidden');
          }
        });
      });
    }
  }

  /**
   * Create notification item - PURE DOM CREATION
   */
  _createNotificationItem(notification) {
    const item = document.createElement('li');
    item.className = `notification-item ${notification.read ? '' : 'unread'}`;
    item.dataset.category = notification.category || 'general';

    item.innerHTML = `
      <div class="notification-icon">${notification.displayIcon}</div>
      <div class="notification-content">
        <div class="notification-message">${notification.message}</div>
        ${notification.details ? `<div class="notification-details">${notification.details}</div>` : ''}
        <div class="notification-time">${notification.formattedTime}</div>
        ${this._getNotificationActions(notification)}
      </div>
    `;

    // Bind action events
    this._bindNotificationActions(item, notification);

    return item;
  }

  /**
   * Get notification actions HTML - PURE HTML GENERATION
   */
  _getNotificationActions(notification) {
    let actions = '';

    if (notification.category === 'team' && notification.teamId) {
      if (notification.type === 'team-create' || notification.type === 'team-edit') {
        actions = `
          <div class="notification-actions">
            <button class="notification-action-btn" data-action="view-team" data-team-id="${notification.teamId}">View Team</button>
          </div>
        `;
      } else if (notification.type === 'team-member-add' || notification.type === 'team-member-role-change') {
        actions = `
          <div class="notification-actions">
            <button class="notification-action-btn" data-action="manage-members" data-team-id="${notification.teamId}">Manage Members</button>
          </div>
        `;
      }
    } else if (notification.category === 'event' && notification.eventId) {
      actions = `
        <div class="notification-actions">
          <button class="notification-action-btn" data-action="view-event" data-event-id="${notification.eventId}">View Event</button>
        </div>
      `;
    }

    return actions;
  }

  /**
   * Bind notification action events - PURE EVENT BINDING
   */
  _bindNotificationActions(item, notification) {
    const actionButtons = item.querySelectorAll('.notification-action-btn');

    actionButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();

        const action = button.dataset.action;
        const teamId = button.dataset.teamId;
        const eventId = button.dataset.eventId;

        // Dispatch custom events for controller to handle
        switch (action) {
          case 'view-team':
            if (teamId) {
              document.dispatchEvent(new CustomEvent('notification-action', {
                detail: { action: 'view-team', teamId: parseInt(teamId, 10) },
                bubbles: true
              }));
            }
            break;

          case 'manage-members':
            if (teamId) {
              document.dispatchEvent(new CustomEvent('notification-action', {
                detail: { action: 'manage-members', teamId: parseInt(teamId, 10) },
                bubbles: true
              }));
            }
            break;

          case 'view-event':
            if (eventId) {
              document.dispatchEvent(new CustomEvent('notification-action', {
                detail: { action: 'view-event', eventId: parseInt(eventId, 10) },
                bubbles: true
              }));
            }
            break;
        }
      });
    });
  }

  /**
   * Group notifications by category - PURE DATA GROUPING
   */
  _groupNotificationsByCategory(notifications) {
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
  _getCategoryDisplayName(category) {
    const categoryNames = {
      'event': '📅 Events',
      'team': '👥 Teams',
      'general': '🔔 General'
    };

    return categoryNames[category] || '🔔 General';
  }

  /**
   * Close other dropdowns - PURE UI INTERACTION
   */
  _closeOtherDropdowns() {
    const teamDropdown = document.getElementById('teamDropdown');
    if (teamDropdown) {
      teamDropdown.classList.remove('show');
    }

    const profileMenu = document.getElementById('profile-menu');
    if (profileMenu) {
      profileMenu.classList.remove('show');
    }
  }

  /**
   * Position dropdown - PURE UI POSITIONING
   */
  _positionDropdown() {
    if (!this.notificationDropdown || !this.notificationBtn) return;

    const btnRect = this.notificationBtn.getBoundingClientRect();
    const dropdownRect = this.notificationDropdown.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    if (btnRect.right + dropdownRect.width > viewportWidth) {
      this.notificationDropdown.style.right = '0';
      this.notificationDropdown.style.left = 'auto';
    }
  }

  /**
   * Create simple toaster - PURE UI UTILITY
   */
  _createToaster() {
    return {
      success: (message) => this._showToast(message, 'success'),
      error: (message) => this._showToast(message, 'error'),
      warning: (message) => this._showToast(message, 'warning')
    };
  }

  /**
   * Show toast notification - PURE UI FEEDBACK
   */
  _showToast(message, type = 'success') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Add notification styles - PURE CSS INJECTION
   */
  _addNotificationStyles() {
    if (document.getElementById('notification-styles')) return;

    const styleEl = document.createElement('style');
    styleEl.id = 'notification-styles';
    styleEl.textContent = `
      /* Notification container */
      .notifications-icon {
        position: relative !important;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 1rem;
        height: 100%;
      }
      
      /* Notification button */
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
      
      /* Notification badge */
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
      
      /* Notification dropdown */
      .notification-dropdown {
        position: absolute !important;
        top: calc(100% + 8px) !important;
        right: 0 !important;
        background: #fff;
        border: 1px solid #e1e1e1;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        border-radius: 8px;
        width: 380px;
        max-height: 500px;
        overflow: visible;
        z-index: 2100 !important;
        display: none;
        animation: fadeInDown 0.2s ease;
      }
      
      .notification-dropdown.show {
        display: block !important;
      }
      
      /* Dropdown header */
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
      
      .notification-header-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      
      .notification-filter-btn,
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
      
      .notification-filter-btn:hover,
      .notification-clear-btn:hover {
        background-color: rgba(0, 120, 212, 0.1);
        text-decoration: underline;
      }
      
      /* Filter menu */
      .notification-filter-menu {
        display: flex;
        gap: 4px;
        padding: 8px 16px;
        border-bottom: 1px solid #eee;
        background-color: #fafafa;
      }
      
      .notification-filter-menu.hidden {
        display: none;
      }
      
      .filter-option {
        background: none;
        border: 1px solid #ddd;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .filter-option:hover {
        background-color: #e8f4f8;
        border-color: #0078d4;
      }
      
      .filter-option.active {
        background-color: #0078d4;
        color: white;
        border-color: #0078d4;
      }
      
      /* Notification list */
      .notification-list-container {
        max-height: 350px;
        overflow-y: auto;
      }
      
      .notification-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      
      .notification-category-header {
        padding: 8px 16px;
        background-color: #f5f5f5;
        font-size: 13px;
        font-weight: 600;
        color: #666;
        border-bottom: 1px solid #eee;
        position: sticky;
        top: 0;
        z-index: 1;
      }
      
      .notification-item {
        padding: 12px 16px;
        border-bottom: 1px solid #eee;
        transition: background-color 0.2s;
        cursor: pointer;
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      
      .notification-item:hover {
        background-color: #f5f5f5;
      }
      
      .notification-item:last-child {
        border-bottom: none;
      }
      
      .notification-icon {
        font-size: 18px;
        flex-shrink: 0;
        margin-top: 2px;
      }
      
      .notification-content {
        flex: 1;
        min-width: 0;
      }
      
      .notification-message {
        font-size: 14px;
        margin-bottom: 4px;
        color: #333;
        line-height: 1.4;
        word-wrap: break-word;
      }
      
      .notification-details {
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
        line-height: 1.3;
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
      
      .notification-item.unread .notification-message {
        font-weight: 500;
      }
      
      .notification-actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }
      
      .notification-action-btn {
        background: none;
        border: 1px solid #ddd;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .notification-action-btn:hover {
        background-color: #f0f0f0;
        border-color: #999;
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
      
      /* Toast styles */
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 2200;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
      }
      
      .toast {
        background-color: #333;
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        pointer-events: auto;
        transition: all 0.3s ease;
        transform: translateX(100%);
        opacity: 0;
      }
      
      .toast.show {
        transform: translateX(0);
        opacity: 1;
      }
      
      .toast.toast-success {
        background-color: #28a745;
      }
      
      .toast.toast-error {
        background-color: #dc3545;
      }
      
      .toast.toast-warning {
        background-color: #ffc107;
        color: #212529;
      }
      
      .toast.fade-out {
        transform: translateX(100%);
        opacity: 0;
      }
      
      /* Animations */
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
      
      /* Responsive */
      @media (max-width: 768px) {
        .notification-dropdown {
          width: 320px;
          right: -20px;
        }
        
        .toast-container {
          right: 10px;
          left: 10px;
          top: 10px;
        }
      }
    `;

    document.head.appendChild(styleEl);
  }
}

// Legacy function exports for backward compatibility
export function initNotificationsView() {
  const view = new NotificationsView();
  return view.init();
}

export function renderNotificationItem(notification) {
  const view = new NotificationsView();
  return view._createNotificationItem(notification);
}