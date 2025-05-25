// controllers/notifications.js - Updated with team notifications
import { initNotificationsView, renderNotificationItem } from "../views/notificationsView.js";

/**
 * Controller để khởi tạo notifications:
 * - Bắt các sự kiện liên quan đến notifications (events và teams)
 * - Xử lý thông báo event, team, cập nhật badge, toggle dropdown
 */
export function initNotificationsController() {
  // Khởi tạo view, lấy các elements và API
  const notificationsAPI = initNotificationsView();
  
  // FIX: Kiểm tra API có tồn tại không
  if (!notificationsAPI || !notificationsAPI.notificationBtn) {
    console.warn("Notifications view initialization failed");
    return {};
  }
  
  const { 
    notificationBtn, 
    notificationBadge,
    notificationDropdown,
    notificationList,
    emptyNotification,
    toggleDropdown, 
    updateBadge,
    toaster
  } = notificationsAPI;
  
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
  
  // ==============================================
  // EVENT NOTIFICATIONS (Existing)
  // ==============================================
  
  // Lắng nghe sự kiện tạo event
  document.addEventListener("event-create", (e) => {
    const eventData = e.detail.event || e.detail;
    addNotification({
      type: 'event-create',
      category: 'event',
      message: `Event "${eventData.title}" created`,
      timestamp: Date.now(),
      read: false,
      eventId: eventData.id,
      icon: '➕'
    });
    
    if (toaster && toaster.success) {
      toaster.success("Event has been created");
    }
  });
  
  // Lắng nghe sự kiện sửa event
  document.addEventListener("event-edit", (e) => {
    const eventData = e.detail.event || e.detail;
    addNotification({
      type: 'event-edit',
      category: 'event',
      message: `Event "${eventData.title}" updated`,
      timestamp: Date.now(),
      read: false,
      eventId: eventData.id,
      icon: '✏️'
    });
    
    if (toaster && toaster.success) {
      toaster.success("Event has been edited");
    }
  });
  
  // Lắng nghe sự kiện xoá event
  document.addEventListener("event-delete", (e) => {
    const eventData = e.detail.event || e.detail;
    addNotification({
      type: 'event-delete',
      category: 'event',
      message: `Event "${eventData.title || 'Event'}" deleted`,
      timestamp: Date.now(),
      read: false,
      icon: '🗑️'
    });
    
    if (toaster && toaster.success) {
      toaster.success("Event has been deleted");
    }
  });
  
  // ==============================================
  // TEAM NOTIFICATIONS (New)
  // ==============================================
  
  // Lắng nghe sự kiện tạo team
  document.addEventListener("team-create", (e) => {
    const teamData = e.detail.team;
    const currentUser = getCurrentUser();
    
    addNotification({
      type: 'team-create',
      category: 'team',
      message: `Team "${teamData.name}" created successfully`,
      timestamp: Date.now(),
      read: false,
      teamId: teamData.id,
      icon: '👥'
    });
    
    if (toaster && toaster.success) {
      toaster.success("Team created successfully");
    }
  });
  
  // Lắng nghe sự kiện thêm thành viên vào team
  document.addEventListener("team-member-add", (e) => {
    const { teamId, member } = e.detail;
    const team = getTeamById(teamId);
    const currentUser = getCurrentUser();
    
    if (team) {
      // Thông báo cho người thêm
      addNotification({
        type: 'team-member-add',
        category: 'team',
        message: `${member.name || member.email} added to team "${team.name}"`,
        timestamp: Date.now(),
        read: false,
        teamId: teamId,
        memberId: member.id,
        icon: '➕👤'
      });
      
      // Nếu là thêm người khác (không phải bản thân)
      if (member.email.toLowerCase() !== currentUser.email.toLowerCase()) {
        // Có thể thêm logic để gửi thông báo cho member được thêm vào
        // (trong thực tế cần API backend để gửi thông báo qua email/push notification)
        console.log(`Should notify ${member.email} about being added to team ${team.name}`);
      }
    }
  });
  
  // Lắng nghe sự kiện xóa thành viên khỏi team
  document.addEventListener("team-member-remove", (e) => {
    const { teamId, memberId } = e.detail;
    const team = getTeamById(teamId);
    
    if (team) {
      // Tìm thông tin member đã bị xóa
      const removedMember = team.members?.find(m => m.id === memberId);
      const memberName = removedMember ? (removedMember.name || removedMember.email) : 'Member';
      
      addNotification({
        type: 'team-member-remove',
        category: 'team',
        message: `${memberName} removed from team "${team.name}"`,
        timestamp: Date.now(),
        read: false,
        teamId: teamId,
        icon: '➖👤'
      });
    }
  });
  
  // Lắng nghe sự kiện thay đổi role thành viên
  document.addEventListener("team-member-role-change", (e) => {
    const { teamId, memberId, role } = e.detail;
    const team = getTeamById(teamId);
    
    if (team) {
      const member = team.members?.find(m => m.id === memberId);
      const memberName = member ? (member.name || member.email) : 'Member';
      
      const roleText = role === 'leader' ? 'promoted to Leader' : 'changed to Member';
      const icon = role === 'leader' ? '👑' : '👤';
      
      addNotification({
        type: 'team-member-role-change',
        category: 'team',
        message: `${memberName} ${roleText} in team "${team.name}"`,
        timestamp: Date.now(),
        read: false,
        teamId: teamId,
        memberId: memberId,
        newRole: role,
        icon: icon
      });
    }
  });
  
  // Lắng nghe sự kiện chỉnh sửa team
  document.addEventListener("team-edit", (e) => {
    const { teamId, updateData } = e.detail;
    const team = getTeamById(teamId);
    
    if (team) {
      addNotification({
        type: 'team-edit',
        category: 'team',
        message: `Team "${team.name}" details updated`,
        timestamp: Date.now(),
        read: false,
        teamId: teamId,
        icon: '✏️'
      });
    }
  });
  
  // Lắng nghe sự kiện xóa team
  document.addEventListener("team-delete", (e) => {
    const { teamId } = e.detail;
    
    // Lấy tên team trước khi xóa (nếu còn trong localStorage)
    const teams = JSON.parse(localStorage.getItem('schedigo_teams') || '[]');
    const team = teams.find(t => t.id === teamId);
    const teamName = team ? team.name : 'Team';
    
    addNotification({
      type: 'team-delete',
      category: 'team',
      message: `Team "${teamName}" has been deleted`,
      timestamp: Date.now(),
      read: false,
      icon: '🗑️👥'
    });
    
    if (toaster && toaster.success) {
      toaster.success("Team deleted successfully");
    }
  });
  
  // Lắng nghe sự kiện thay đổi privacy team
  document.addEventListener("team-privacy-update", (e) => {
    const { teamId, privacy } = e.detail;
    const team = getTeamById(teamId);
    
    if (team) {
      const privacyText = privacy === 'private' ? 'Private' : 'Public';
      const icon = privacy === 'private' ? '🔒' : '🌐';
      
      addNotification({
        type: 'team-privacy-update',
        category: 'team',
        message: `Team "${team.name}" changed to ${privacyText}`,
        timestamp: Date.now(),
        read: false,
        teamId: teamId,
        newPrivacy: privacy,
        icon: icon
      });
    }
  });
  
  /**
   * Thêm notification mới
   * @param {Object} notification - Thông tin notification
   */
  function addNotification(notification) {
    // Thêm vào đầu mảng
    notifications.unshift(notification);
    
    // Giới hạn số lượng thông báo (giữ 50 thông báo gần nhất)
    if (notifications.length > 50) {
      notifications = notifications.slice(0, 50);
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
      
      // Group notifications by category
      const groupedNotifications = groupNotificationsByCategory(notifications);
      
      // Render each group
      Object.entries(groupedNotifications).forEach(([category, categoryNotifications]) => {
        // Add category header if there are multiple categories
        if (Object.keys(groupedNotifications).length > 1) {
          const categoryHeader = document.createElement('div');
          categoryHeader.className = 'notification-category-header';
          categoryHeader.textContent = getCategoryDisplayName(category);
          notificationList.appendChild(categoryHeader);
        }
        
        // Render notifications in this category
        categoryNotifications.forEach(notification => {
          const notificationItem = renderNotificationItem(notification);
          notificationList.appendChild(notificationItem);
        });
      });
    }
  }
  
  /**
   * Group notifications by category
   * @param {Array} notifications - Array of notifications
   * @returns {Object} Grouped notifications
   */
  function groupNotificationsByCategory(notifications) {
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
   * Get display name for category
   * @param {string} category - Category key
   * @returns {string} Display name
   */
  function getCategoryDisplayName(category) {
    const categoryNames = {
      'event': '📅 Events',
      'team': '👥 Teams',
      'general': '🔔 General'
    };
    
    return categoryNames[category] || '🔔 General';
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
  
  /**
   * Get team by ID
   * @param {number} teamId - Team ID
   * @returns {Object|null} Team object or null
   */
  function getTeamById(teamId) {
    try {
      const teams = JSON.parse(localStorage.getItem('schedigo_teams') || '[]');
      return teams.find(team => team.id === teamId) || null;
    } catch (error) {
      console.error('Error getting team by ID:', error);
      return null;
    }
  }
  
  /**
   * Get current user information
   * @returns {Object} Current user info
   */
  function getCurrentUser() {
    return {
      email: localStorage.getItem('email') || '',
      name: localStorage.getItem('username') || 'User'
    };
  }
  
  // Public API
  return {
    toaster,
    addNotification,
    markAllAsRead,
    getNotifications: () => notifications,
    clearNotifications: () => {
      notifications = [];
      saveNotifications([]);
      unreadCount = 0;
      updateBadge(0);
      renderNotifications();
    }
  };
}