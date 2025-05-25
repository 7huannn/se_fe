// controllers/notifications.js - FIXED MVC COMPLIANT VERSION

import { NotificationsModel } from "../models/notifications.js";
import { NotificationsView } from "../views/notificationsView.js";

/**
 * Controller chỉ chịu trách nhiệm điều phối giữa Model và View
 * Xử lý business logic và user interactions
 * Không thao tác DOM trực tiếp
 */
export function initNotificationsController() {
  const model = new NotificationsModel();
  const view = new NotificationsView();
  
  // Initialize view
  const viewAPI = view.init();
  
  if (!viewAPI || !viewAPI.notificationBtn) {
    console.warn("Notifications view initialization failed");
    return {};
  }
  
  const { 
    notificationBtn, 
    toggleDropdown, 
    updateBadge,
    toaster 
  } = viewAPI;
  
  // Load initial data
  let notifications = model.loadNotifications();
  let unreadCount = model.countUnreadNotifications(notifications);
  
  // Initialize view with data
  updateBadge(unreadCount);
  
  // Bind view events
  bindViewEvents();
  
  // Bind model events (listen to app events)
  bindModelEvents();

  /**
   * Bind view interaction events - EVENT COORDINATION
   */
  function bindViewEvents() {
    // Toggle dropdown
    notificationBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleDropdown();
      
      // Render notifications when opened
      const formattedNotifications = model.formatNotificationsForDisplay(notifications);
      view.renderNotifications(formattedNotifications);
      
      // Mark all as read when opened
      if (unreadCount > 0) {
        markAllAsRead();
      }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (view.isDropdownOpen() && !view.isClickInsideDropdown(e.target) && e.target !== notificationBtn) {
        view.closeDropdown();
      }
    });
    
    // Clear all notifications
    view.bindClearAllButton(() => {
      clearAllNotifications();
    });
    
    // Filter notifications
    view.bindFilterEvents((filter) => {
      const filteredNotifications = model.filterNotifications(notifications, filter);
      const formattedNotifications = model.formatNotificationsForDisplay(filteredNotifications);
      view.renderNotifications(formattedNotifications);
    });
  }

  /**
   * Bind application events to model - BUSINESS LOGIC COORDINATION
   */
  function bindModelEvents() {
    // Event notifications
    document.addEventListener("event-create", (e) => {
      const eventData = e.detail.event || e.detail;
      const notification = model.createEventNotification('create', eventData);
      addNotification(notification);
      
      if (toaster && toaster.success) {
        toaster.success("Event has been created");
      }
    });
    
    document.addEventListener("event-edit", (e) => {
      const eventData = e.detail.event || e.detail;
      const notification = model.createEventNotification('edit', eventData);
      addNotification(notification);
      
      if (toaster && toaster.success) {
        toaster.success("Event has been edited");
      }
    });
    
    document.addEventListener("event-delete", (e) => {
      const eventData = e.detail.event || e.detail;
      const notification = model.createEventNotification('delete', eventData);
      addNotification(notification);
      
      if (toaster && toaster.success) {
        toaster.success("Event has been deleted");
      }
    });
    
    // Team notifications
    document.addEventListener("team-create", (e) => {
      const teamData = e.detail.team;
      const notification = model.createTeamNotification('create', teamData);
      addNotification(notification);
      
      if (toaster && toaster.success) {
        toaster.success("Team created successfully");
      }
    });
    
    document.addEventListener("team-member-add", (e) => {
      const { teamId, member } = e.detail;
      const team = getTeamById(teamId);
      if (team) {
        const notification = model.createTeamMemberNotification('add', team, member);
        addNotification(notification);
      }
    });
    
    document.addEventListener("team-member-remove", (e) => {
      const { teamId, memberId } = e.detail;
      const team = getTeamById(teamId);
      if (team) {
        const memberToRemove = team.members?.find(m => m.id === memberId);
        if (memberToRemove) {
          const notification = model.createTeamMemberNotification('remove', team, memberToRemove);
          addNotification(notification);
        }
      }
    });
    
    document.addEventListener("team-member-role-change", (e) => {
      const { teamId, memberId, role } = e.detail;
      const team = getTeamById(teamId);
      if (team) {
        const member = team.members?.find(m => m.id === memberId);
        if (member) {
          const notification = model.createTeamRoleChangeNotification(team, member, role);
          addNotification(notification);
        }
      }
    });
    
    document.addEventListener("team-edit", (e) => {
      const { teamId, updateData } = e.detail;
      const team = getTeamById(teamId);
      if (team) {
        const notification = model.createTeamNotification('edit', team, updateData);
        addNotification(notification);
      }
    });
    
    document.addEventListener("team-delete", (e) => {
      const { teamId } = e.detail;
      const teams = JSON.parse(localStorage.getItem('schedigo_teams') || '[]');
      const team = teams.find(t => t.id === teamId);
      if (team) {
        const notification = model.createTeamNotification('delete', team);
        addNotification(notification);
      }
      
      if (toaster && toaster.success) {
        toaster.success("Team deleted successfully");
      }
    });
    
    document.addEventListener("team-privacy-update", (e) => {
      const { teamId, privacy } = e.detail;
      const team = getTeamById(teamId);
      if (team) {
        const notification = model.createTeamPrivacyNotification(team, privacy);
        addNotification(notification);
      }
    });
  }

  /**
   * Add new notification - BUSINESS LOGIC
   */
  function addNotification(notification) {
    notifications = model.addNotification(notifications, notification);
    unreadCount = model.countUnreadNotifications(notifications);
    updateBadge(unreadCount);
    
    // Save to storage
    model.saveNotifications(notifications);
  }

  /**
   * Mark all notifications as read - BUSINESS LOGIC
   */
  function markAllAsRead() {
    notifications = model.markAllAsRead(notifications);
    unreadCount = 0;
    updateBadge(0);
    
    // Save to storage
    model.saveNotifications(notifications);
  }

  /**
   * Clear all notifications - BUSINESS LOGIC
   */
  function clearAllNotifications() {
    notifications = [];
    unreadCount = 0;
    updateBadge(0);
    
    // Save to storage
    model.saveNotifications([]);
    
    // Update view
    view.renderNotifications([]);
    view.closeDropdown();
  }

  /**
   * Get team by ID - DELEGATE TO MODEL
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

  // Public API
  return {
    toaster,
    addNotification,
    markAllAsRead,
    clearNotifications: clearAllNotifications,
    getNotifications: () => notifications,
    getUnreadCount: () => unreadCount
  };
}