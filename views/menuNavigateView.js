// views/menuNavigateView.js (Updated version)

import {
  goToAcc,
  goToTeams,
  goToChatBox,
  goToEvents,
  goToTasks,
  goToStats,
  goToGroupCalendar
} from "../controllers/menu-navigate.js";

export function initMenuNavigateView() {
  document.addEventListener("DOMContentLoaded", () => {
    // Navigate to Account Management
    const btnAcc = document.getElementById("btn-acc");
    if (btnAcc) {
      btnAcc.addEventListener("click", goToAcc);
    }

    // Navigate to Teams
    const btnTeams = document.getElementById("btn-teams");
    if (btnTeams) {
      btnTeams.addEventListener("click", goToTeams);
    }

    // Navigate to ChatBox
    const btnChatbox = document.getElementById("btn-chatbox");
    if (btnChatbox) {
      btnChatbox.addEventListener("click", goToChatBox);
    }

    // Navigate to Events
    const btnEvents = document.getElementById("btn-events");
    if (btnEvents) {
      btnEvents.addEventListener("click", goToEvents);
    }

    // Navigate to Tasks
    const btnTasks = document.getElementById("btn-tasks");
    if (btnTasks) {
      btnTasks.addEventListener("click", goToTasks);
    }

    // Navigate to Statistics
    const btnStats = document.getElementById("btn-stats");
    if (btnStats) {
      btnStats.addEventListener("click", goToStats);
    }
    
    // Navigate to Group Calendar (new)
    const btnGroupCalendar = document.getElementById("btn-group-calendar");
    if (btnGroupCalendar) {
      btnGroupCalendar.addEventListener("click", goToGroupCalendar);
    }
    
    // Set active state for current page
    setActiveMenuItem();
  });
  
  // Helper function to set the active menu item based on current URL
  function setActiveMenuItem() {
    const currentPath = window.location.pathname;
    
    // Clear all active states
    document.querySelectorAll('.menu-card').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Set active state based on current path
    if (currentPath.includes('manageAcc.html')) {
      const btnAcc = document.getElementById("btn-acc");
      if (btnAcc) btnAcc.classList.add('active');
    } 
    else if (currentPath.includes('group.html')) {
      const btnTeams = document.getElementById("btn-teams");
      if (btnTeams) btnTeams.classList.add('active');
    }
    else if (currentPath.includes('chat.html')) {
      const btnChatbox = document.getElementById("btn-chatbox");
      if (btnChatbox) btnChatbox.classList.add('active');
    }
    else if (currentPath.includes('events.html')) {
      const btnEvents = document.getElementById("btn-events");
      if (btnEvents) btnEvents.classList.add('active');
    }
    else if (currentPath.includes('tasks.html')) {
      const btnTasks = document.getElementById("btn-tasks");
      if (btnTasks) btnTasks.classList.add('active');
    }
    else if (currentPath.includes('statistics.html')) {
      const btnStats = document.getElementById("btn-stats");
      if (btnStats) btnStats.classList.add('active');
    }
    else if (currentPath.includes('group-calendar.html')) {
      const btnGroupCalendar = document.getElementById("btn-group-calendar");
      if (btnGroupCalendar) btnGroupCalendar.classList.add('active');
    }
    else if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
      // Assuming index.html is the personal calendar
      const btnPersonalCalendar = document.querySelector('.menu-card[data-page="index"]');
      if (btnPersonalCalendar) btnPersonalCalendar.classList.add('active');
    }
  }
}