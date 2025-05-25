// views/notificationsView.js - Complete version with team notifications support
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
  const filterBtn = notificationDropdown.querySelector('.notification-filter-btn');
  const filterMenu = notificationDropdown.querySelector('.notification-filter-menu');
  const filterOptions = notificationDropdown.querySelectorAll('.filter-option');
  
  // Nút Clear all
  const clearBtn = notificationDropdown.querySelector('.notification-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearNotifications();
    });
  }
  
  // Filter functionality
  if (filterBtn && filterMenu) {
    filterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      filterMenu.classList.toggle('hidden');
    });
    
    filterOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Update active filter
        filterOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        // Apply filter
        const filter = option.dataset.filter;
        applyNotificationFilter(filter);
        
        // Hide filter menu
        filterMenu.classList.add('hidden');
      });
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
      // Hide filter menu when closing dropdown
      if (filterMenu) {
        filterMenu.classList.add('hidden');
      }
    } else {
      // Đóng các dropdown khác trước khi mở
      closeOtherDropdowns();
      notificationDropdown.classList.add('show');
      
      // Tính toán vị trí nếu cần thiết
      positionDropdown();
    }
  }
  
  /**
   * Apply notification filter
   * @param {string} filter - Filter type ('all', 'event', 'team')
   */
  function applyNotificationFilter(filter) {
    if (!notificationList) return;
    
    const allItems = notificationList.querySelectorAll('.notification-item');
    
    allItems.forEach(item => {
      const category = item.dataset.category || 'general';
      
      if (filter === 'all' || category === filter) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
    
    // Check if any items are visible
    const visibleItems = Array.from(allItems).filter(item => item.style.display !== 'none');
    
    if (visibleItems.length === 0) {
      if (emptyNotification) {
        emptyNotification.classList.remove('hidden');
        emptyNotification.textContent = filter === 'all' ? 'No notifications' : `No ${filter} notifications`;
      }
    } else {
      if (emptyNotification) {
        emptyNotification.classList.add('hidden');
      }
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
   * Thêm CSS styles - Complete version with team notification support
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
      
      /* Notification Dropdown */
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
      
      /* Filter Menu */
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
      
      /* List container */
      .notification-list-container {
        max-height: 350px;
        overflow-y: auto;
      }
      
      .notification-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      
      /* Category Headers */
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
      
      /* Team notification specific styles */
      .notification-item[data-category="team"] {
        border-left: 2px solid #ff8800;
      }
      
      .notification-item[data-category="event"] {
        border-left: 2px solid #2563eb;
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
      
      /* Toast styles for team notifications */
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
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .notification-dropdown {
          width: 320px;
          right: -20px;
        }
        
        .notification-header-actions {
          gap: 4px;
        }
        
        .notification-filter-btn,
        .notification-clear-btn {
          font-size: 12px;
          padding: 2px 6px;
        }
        
        .toast-container {
          right: 10px;
          left: 10px;
          top: 10px;
        }
        
        .toast {
          margin: 0;
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
    toaster,
    applyNotificationFilter
  };
}

/**
 * Render notification item with enhanced support for team notifications
 * @param {Object} notification - Notification data
 * @returns {HTMLElement} Notification item element
 */
export function renderNotificationItem(notification) {
  const item = document.createElement('li');
  item.className = `notification-item ${notification.read ? '' : 'unread'}`;
  item.dataset.category = notification.category || 'general';
  
  const timeAgo = formatTimeAgo(notification.timestamp);
  
  // Use custom icon if provided, otherwise use default based on type
  let icon = notification.icon || '📅';
  if (!notification.icon) {
    if (notification.type === 'event-create') icon = '➕';
    else if (notification.type === 'event-edit') icon = '✏️';
    else if (notification.type === 'event-delete') icon = '🗑️';
    else if (notification.type === 'team-create') icon = '👥';
    else if (notification.type === 'team-member-add') icon = '➕👤';
    else if (notification.type === 'team-member-remove') icon = '➖👤';
    else if (notification.type === 'team-member-role-change') icon = '👑';
    else if (notification.type === 'team-edit') icon = '✏️';
    else if (notification.type === 'team-delete') icon = '🗑️👥';
    else if (notification.type === 'team-privacy-update') icon = notification.newPrivacy === 'private' ? '🔒' : '🌐';
  }
  
  item.innerHTML = `
    <div class="notification-icon">${icon}</div>
    <div class="notification-content">
      <div class="notification-message">${notification.message}</div>
      <div class="notification-time">${timeAgo}</div>
      ${getNotificationActions(notification)}
    </div>
  `;
  
  // Add click handler for notification actions
  bindNotificationActions(item, notification);
  
  return item;
}

/**
 * Get notification actions HTML based on notification type
 * @param {Object} notification - Notification data
 * @returns {string} Actions HTML
 */
function getNotificationActions(notification) {
  let actions = '';
  
  // Add specific actions based on notification type
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
 * Bind notification action events
 * @param {HTMLElement} item - Notification item element
 * @param {Object} notification - Notification data
 */
function bindNotificationActions(item, notification) {
  const actionButtons = item.querySelectorAll('.notification-action-btn');
  
  actionButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      
      const action = button.dataset.action;
      const teamId = button.dataset.teamId;
      const eventId = button.dataset.eventId;
      
      switch (action) {
        case 'view-team':
          if (teamId) {
            // Navigate to team page or open team details
            window.location.href = 'group.html';
          }
          break;
          
        case 'manage-members':
          if (teamId) {
            // Open team members modal
            import('../../controllers/group/membersController.js').then(module => {
              if (module.openTeamMembersModal) {
                module.openTeamMembersModal(parseInt(teamId, 10), true);
              }
            }).catch(err => {
              console.error('Failed to load members controller:', err);
            });
          }
          break;
          
        case 'view-event':
          if (eventId) {
            // Find and dispatch event click to open details
            const event = findEventById(parseInt(eventId, 10));
            if (event) {
              document.dispatchEvent(new CustomEvent('event-click', {
                detail: { event },
                bubbles: true
              }));
            }
          }
          break;
      }
    });
  });
}

/**
 * Find event by ID from storage
 * @param {number} eventId - Event ID
 * @returns {Object|null} Event object or null
 */
function findEventById(eventId) {
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

/**
 * Format timestamp to relative time
 * @param {number} timestamp - Timestamp in milliseconds
 * @returns {string} Formatted time string
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

// Legacy notification functions for backward compatibility
export function notifyEventCreated(toaster) {
  toaster.success("Event has been created");
}

export function notifyEventDeleted(toaster) {
  toaster.success("Event has been deleted");
}

export function notifyEventEdited(toaster) {
  toaster.success("Event has been edited");
}