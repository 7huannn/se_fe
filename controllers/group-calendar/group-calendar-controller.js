// controllers/group-calendar/group-calendar-controller.js

import { renderCalendar } from "../../views/calendarView.js";
import { getDate, getView } from "../../models/url.js";
import { getCurrentDeviceType } from "../../views/responsiveView.js";
import { createTeamEventStore } from "../../models/group/team-calendar.js";

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

  // Function to refresh the calendar view
  function refreshCalendar() {
    if (!calendarElement) return;
    
    const scrollable = calendarElement.querySelector("[data-calendar-scrollable]");
    const scrollTop = scrollable ? scrollable.scrollTop : 0;

    calendarElement.replaceChildren();
    
    // Only render the calendar if a team is selected
    if (selectedTeamId && teamEventStore) {
      renderCalendar(calendarElement, selectedView, selectedDate, teamEventStore, deviceType);
      
      if (scrollable) {
        const newScrollable = calendarElement.querySelector("[data-calendar-scrollable]");
        if (newScrollable) {
          newScrollable.scrollTo({ top: scrollTop });
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

  // Update team header when a team is selected
  function updateTeamHeader(team) {
    if (!teamHeaderElement) return;
    
    if (team) {
      // Get color class based on team color
      const colorClass = getColorClass(team.color);
      
      teamHeaderElement.innerHTML = `
        <div class="team-header-info">
          <div class="team-header-icon ${colorClass}">${team.initials}</div>
          <div class="team-header-details">
            <h2>${team.name}</h2>
            <p>Team Calendar • ${team.privacy === 'private' ? '🔒 Private' : '🌐 Public'}</p>
          </div>
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
    
    // Handle event creation
    document.addEventListener("event-create", handleTeamEventCreate);
    
    // Handle event editing
    document.addEventListener("event-edit", handleTeamEventEdit);
    
    // Handle event deletion
    document.addEventListener("event-delete", handleTeamEventDelete);
  }
  
  // Remove team event handlers
  function removeTeamEventHandlers() {
    document.removeEventListener("event-create", handleTeamEventCreate);
    document.removeEventListener("event-edit", handleTeamEventEdit);
    document.removeEventListener("event-delete", handleTeamEventDelete);
  }
  
  // Handler for creating team events
  function handleTeamEventCreate(event) {
    if (!selectedTeamId || !teamEventStore) return;
    
    const newEvent = event.detail;
    
    // Add team ID to the event
    newEvent.teamId = selectedTeamId;
    
    // Add the event to the team event store
    teamEventStore.addEvent(newEvent);
  }
  
  // Handler for editing team events
  function handleTeamEventEdit(event) {
    if (!selectedTeamId || !teamEventStore) return;
    
    const updatedEvent = event.detail;
    
    // Make sure the event has the team ID
    updatedEvent.teamId = selectedTeamId;
    
    // Update the event in the team event store
    teamEventStore.updateEvent(updatedEvent);
  }
  
  // Handler for deleting team events
  function handleTeamEventDelete(event) {
    if (!selectedTeamId || !teamEventStore) return;
    
    const eventToDelete = event.detail;
    
    // Delete the event from the team event store
    teamEventStore.deleteEvent(eventToDelete.id);
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
  updateTeamHeader(null)}