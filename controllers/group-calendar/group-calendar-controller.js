// controllers/group-calendar/group-calendar-controller.js - FIXED VERSION

import { renderCalendar } from "../../views/calendarView.js";
import { getDate, getView } from "../../models/url.js";
import { getCurrentDeviceType } from "../../views/responsiveView.js";
import { createTeamEventStore } from "../../models/group/team-calendar.js";
import { getTeamById } from "../../models/group/team.js";
import { canCreateEvents, getCurrentUser } from "../../models/group/team-permissions.js";

/**
 * Initialize the group calendar controller
 * @param {Object} eventStore - The global event store instance
 */
export function initGroupCalendarController(eventStore) {
  const calendarElement = document.querySelector("[data-calendar]");
  const teamHeaderElement = document.querySelector("[data-team-header]");

  let selectedView = getView();
  let selectedDate = getDate();
  let deviceType = getCurrentDeviceType();
  let selectedTeamId = null;
  let teamEventStore = null;
  let userCanCreateEvents = false;

  /**
   * Fix time display in day and week views for group calendar
   * @param {string} view - Current view (day, week, month)
   * @param {HTMLElement} calendarEl - Calendar container element
   */
  function fixGroupCalendarTimeDisplay(view, calendarEl) {
    // If not day or week view, no need for fixes
    if (view !== 'day' && view !== 'week') return;
    
    // Check if the week calendar already has time slots
    const timeList = calendarEl.querySelector('.week-calendar__time-list');
    if (!timeList) {
      console.error('Week calendar time list not found');
      return;
    }
    
    // Check if time slots already exist
    if (timeList.children.length > 0) return;
    
    // Create time slots for 24 hours
    const hours = Array.from({length: 24}, (_, i) => i);
    
    hours.forEach(hour => {
      const timeItem = document.createElement('li');
      timeItem.className = 'week-calendar__time-item';
      
      const timeElement = document.createElement('time');
      timeElement.className = 'week-calendar__time';
      
      // Format time as 12-hour with AM/PM
      const formattedHour = hour % 12 || 12;
      const ampm = hour < 12 ? 'AM' : 'PM';
      timeElement.textContent = `${formattedHour}:00 ${ampm}`;
      
      timeItem.appendChild(timeElement);
      timeList.appendChild(timeItem);
    });
  }

  // Function to refresh the calendar view - Enhanced version
  function refreshCalendar() {
    if (!calendarElement) return;
    
    const scrollable = calendarElement.querySelector("[data-calendar-scrollable]");
    const scrollTop = scrollable ? scrollable.scrollTop : 0;

    calendarElement.replaceChildren();
    
    // Only render the calendar if a team is selected
    if (selectedTeamId && teamEventStore) {
      renderCalendar(calendarElement, selectedView, selectedDate, teamEventStore, deviceType);
      
      // Apply time display fix after rendering
      fixGroupCalendarTimeDisplay(selectedView, calendarElement);
      
      if (scrollable) {
        const newScrollable = calendarElement.querySelector("[data-calendar-scrollable]");
        if (newScrollable) {
          newScrollable.scrollTo({ top: scrollTop });
        }
      }
      
      // Add a visual indicator to the calendar if the user can't create events
      if (!userCanCreateEvents) {
        const createButtons = calendarElement.querySelectorAll("[data-event-create-button]");
        createButtons.forEach(button => {
          button.style.display = 'none';
        });
        
        // Disable event creation on week/day calendar cells
        disableCalendarCellCreation(calendarElement);
        
        // For day/week view, add a message about permissions
        if (selectedView === 'day' || selectedView === 'week') {
          const permissionMsg = document.createElement('div');
          permissionMsg.className = 'calendar-permission-notice';
          permissionMsg.textContent = 'Only team leaders can create events';
          calendarElement.appendChild(permissionMsg);
        }
      }
    } else {
      // Show a message when no team is selected
      const placeholderElement = document.createElement('div');
      placeholderElement.className = 'calendar-placeholder';
      placeholderElement.innerHTML = `
        <div class="placeholder-content">
          <h3>No Team Selected</h3>
          <p>Please select a team from the sidebar to view its calendar.</p>
        </div>
      `;
      calendarElement.appendChild(placeholderElement);
    }
  }

  /**
   * Disable event creation by removing click handlers from calendar cells
   * @param {HTMLElement} calendarEl - Calendar container element
   */
  function disableCalendarCellCreation(calendarEl) {
    // For week view cells
    const weekCells = calendarEl.querySelectorAll('.week-calendar__cell');
    weekCells.forEach(cell => {
      // Remove existing click listeners and add new ones that show toast
      const newCell = cell.cloneNode(true);
      cell.parentNode.replaceChild(newCell, cell);
      
      newCell.classList.add('calendar-cell-no-create');
      newCell.title = 'Only team leaders can create events';
      
      // Add click listener to show toast
      newCell.addEventListener('click', (e) => {
        if (e.target.closest('[data-event]')) return;
        showPermissionToast();
      });
    });
    
    // For month view cells
    const monthWrappers = calendarEl.querySelectorAll('[data-month-calendar-event-list-wrapper]');
    monthWrappers.forEach(wrapper => {
      const newWrapper = wrapper.cloneNode(true);
      wrapper.parentNode.replaceChild(newWrapper, wrapper);
      
      newWrapper.classList.add('calendar-cell-no-create');
      newWrapper.title = 'Only team leaders can create events';
      
      // Add click listener to show toast
      newWrapper.addEventListener('click', (e) => {
        if (e.target.closest('[data-event]')) return;
        showPermissionToast();
      });
    });
  }

  // Helper function to show permission denied toast
  function showPermissionToast() {
    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    showToast('Only team leaders can create events', 'error', toastContainer);
  }

  // Update team header when a team is selected
  function updateTeamHeader(team) {
    if (!teamHeaderElement) return;
    
    if (team) {
      // Get color class based on team color
      const colorClass = getColorClass(team.color);
      
      // Check if the current user can create events
      const currentUser = getCurrentUser();
      userCanCreateEvents = canCreateEvents(team, currentUser.email);
      
      // Get leader count
      const leaderCount = team.members ? team.members.filter(m => m.role === 'leader').length : 0;
      
      teamHeaderElement.innerHTML = `
        <div class="team-header-info">
          <div class="team-header-icon ${colorClass}">${team.initials}</div>
          <div class="team-header-details">
            <h2>${team.name}</h2>
            <p>Team Calendar • ${team.privacy === 'private' ? '🔒 Private' : '🌐 Public'}</p>
            <p class="team-member-count">${team.members ? team.members.length : 0} member${team.members && team.members.length !== 1 ? 's' : ''} 
              ${leaderCount > 0 ? `(${leaderCount} leader${leaderCount !== 1 ? 's' : ''})` : ''}
            </p>
          </div>
          ${userCanCreateEvents ? '<div class="leader-badge">You can create events</div>' : '<div class="leader-only-badge">Only leaders can create events</div>'}
        </div>
      `;
      
      selectedTeamId = team.id;
      
      // Create a new event store for the selected team
      teamEventStore = createTeamEventStore(selectedTeamId);
      
      // Handle event creation in team context
      setupTeamEventHandlers(selectedTeamId);
    } else {
      teamHeaderElement.innerHTML = `
        <div class="team-header-placeholder">
          <h2>Select a team to view its calendar</h2>
          <p>Choose a team from the list on the left</p>
        </div>
      `;
      
      selectedTeamId = null;
      teamEventStore = null;
      userCanCreateEvents = false;
      
      // Remove team-specific event handlers
      removeTeamEventHandlers();
    }
    
    // Refresh calendar after updating team header
    refreshCalendar();
  }
  
  // Set up event handlers for team events
  function setupTeamEventHandlers(teamId) {
    // Remove any existing handlers first
    removeTeamEventHandlers();
    
    // Get team data and check permissions
    const team = getTeamById(teamId);
    const currentUser = getCurrentUser();
    userCanCreateEvents = canCreateEvents(team, currentUser.email);
    
    // FIX: Always listen for event-create-request to intercept unauthorized attempts
    document.addEventListener("event-create-request", handleEventCreateRequest);
    
    // Only register event creation handlers if the user has permission
    if (userCanCreateEvents) {
      // Handle event creation
      document.addEventListener("event-create", handleTeamEventCreate);
      
      // Handle event editing
      document.addEventListener("event-edit", handleTeamEventEdit);
      
      // Handle event deletion
      document.addEventListener("event-delete", handleTeamEventDelete);
    }
  }
  
  // FIX: Handle event creation requests with permission check
  function handleEventCreateRequest(event) {
    // Don't stop propagation yet - we need to check permissions first
    if (!userCanCreateEvents) {
      // Prevent the event from propagating to form dialog handler
      event.stopPropagation();
      
      // Show a toast message
      showPermissionToast();
    }
    // If user has permission, allow event to propagate to form dialog handler
  }
  
  // Helper function to create toast container
  function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }
  
  // Helper function to show toast
  function showToast(message, type = 'info', container) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
  
  // Remove team event handlers
  function removeTeamEventHandlers() {
    document.removeEventListener("event-create-request", handleEventCreateRequest);
    document.removeEventListener("event-create", handleTeamEventCreate);
    document.removeEventListener("event-edit", handleTeamEventEdit);
    document.removeEventListener("event-delete", handleTeamEventDelete);
  }
  
  // Handler for creating team events
  function handleTeamEventCreate(event) {
    if (!selectedTeamId || !teamEventStore || !userCanCreateEvents) return;
    
    // FIX: Get the event data correctly regardless of format
    const newEvent = event.detail.event || event.detail;
    
    // Add team ID to the event
    newEvent.teamId = selectedTeamId;
    
    // Add the event to the team event store
    teamEventStore.addEvent(newEvent);
    
    // FIX: Force refresh the calendar to show the new event
    refreshCalendar();
  }
  
  // Handler for editing team events
  function handleTeamEventEdit(event) {
    if (!selectedTeamId || !teamEventStore || !userCanCreateEvents) return;
    
    const updatedEvent = event.detail.event || event.detail;
    
    // Make sure the event has the team ID
    updatedEvent.teamId = selectedTeamId;
    
    // Update the event in the team event store
    teamEventStore.updateEvent(updatedEvent);
    
    // Force refresh the calendar
    refreshCalendar();
  }
  
  // Handler for deleting team events
  function handleTeamEventDelete(event) {
    if (!selectedTeamId || !teamEventStore || !userCanCreateEvents) return;
    
    const eventToDelete = event.detail.event || event.detail;
    
    // Delete the event from the team event store
    teamEventStore.deleteEvent(eventToDelete.id);
    
    // Force refresh the calendar
    refreshCalendar();
  }

  // Helper function to map color code to CSS class
  function getColorClass(colorCode) {
    const colorMap = {
      'blue': 'team-blue',
      'orange': 'team-orange',
      'green': 'team-green',
      'purple': 'team-purple',
      'red': 'team-pink'
    };
    
    return colorMap[colorCode] || 'team-blue';
  }

  // Listen for view changes
  document.addEventListener("view-change", event => {
    selectedView = event.detail.view;
    refreshCalendar();
  });

  // Listen for date changes
  document.addEventListener("date-change", event => {
    selectedDate = event.detail.date;
    refreshCalendar();
  });

  // Listen for device type changes
  document.addEventListener("device-type-change", event => {
    deviceType = event.detail.deviceType;
    refreshCalendar();
  });

  // Listen for events changes
  document.addEventListener("events-change", () => {
    refreshCalendar();
  });
  
  // Listen for team events changes
  document.addEventListener("team-events-change", (event) => {
    // Only refresh if the event is for the selected team
    if (event.detail.teamId === selectedTeamId) {
      refreshCalendar();
    }
  });

  // Listen for team selection events
  document.addEventListener("team-select", event => {
    updateTeamHeader(event.detail.team);
  });

  // Initialize with empty calendar
  updateTeamHeader(null);

  // Add styles for leader-only indicators
  addLeaderOnlyStyles();
}

/**
 * Add CSS styles for leader-only indicators
 */
function addLeaderOnlyStyles() {
  if (document.getElementById('leader-only-styles')) return;
  
  const styleEl = document.createElement('style');
  styleEl.id = 'leader-only-styles';
  styleEl.textContent = `
    .leader-only-badge {
      background-color: #ff8800;
      color: white;
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 4px;
      margin-left: 10px;
      display: inline-block;
    }
    
    .leader-badge {
      background-color: #4CAF50;
      color: white;
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 4px;
      margin-left: 10px;
      display: inline-block;
    }
    
    .calendar-cell-no-create {
      cursor: not-allowed !important;
      position: relative;
    }
    
    .calendar-cell-no-create:hover::after {
      content: 'Only leaders can create events';
      position: absolute;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 100;
      top: -30px;
      left: 0;
      white-space: nowrap;
    }
    
    .calendar-permission-notice {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: rgba(255, 136, 0, 0.9);
      color: white;
      padding: 10px 15px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 1000;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .toast {
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      color: white;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
      animation: toast-in 0.3s ease;
    }
    
    .toast-info {
      background-color: #2196F3;
    }
    
    .toast-success {
      background-color: #4CAF50;
    }
    
    .toast-error {
      background-color: #F44336;
    }
    
    .toast.fade-out {
      animation: toast-out 0.3s ease forwards;
    }
    
    @keyframes toast-in {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes toast-out {
      from { transform: translateY(0); opacity: 1; }
      to { transform: translateY(-20px); opacity: 0; }
    }
  `;
  
  document.head.appendChild(styleEl);
}