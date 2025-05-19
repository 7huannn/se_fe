// controllers/group/index.js - Updated with improved event handling

import { initTeamsListController, initCreateTeamFormController, loadSavedTeamsController, 
         handleTeamCreate, handleTeamEdit, handleTeamDelete, 
         handleTeamPrivacyUpdate, initEditTeamFormController } from './teamController.js';
import { initChatController } from './chatController.js';
import { initModalsController } from './modalController.js';
import { initDropdownController } from './dropdownController.js';
import { initChatUI } from '../../views/group/chatView.js';

/**
 * Initialize all controllers for the group page
 */
export function initGroupControllers() {
    // Initialize dropdown
    initDropdownController();
    
    // Initialize modals
    initModalsController();
    
    // Initialize teams list (without event listeners, now managed here)
    initTeamsListController();
    
    // Initialize create team form
    initCreateTeamFormController();
    
    // Initialize edit team form
    initEditTeamFormController();
    
    // Initialize chat UI and controller
    initChatUI();
    initChatController();
    
    // Register global event listeners - centralized here to avoid duplication
    
    // Listen for team create event
    document.addEventListener('team-create', handleTeamCreate);
    
    // Listen for team edit event
    document.addEventListener('team-edit', handleTeamEdit);
    
    // Listen for team delete event
    document.addEventListener('team-delete', handleTeamDelete);
    
    // Listen for team privacy update event
    document.addEventListener('team-privacy-update', handleTeamPrivacyUpdate);
    
    // Initialize sidebar navigation - using shared controller
    import('../../controllers/sidebar-navigation.js').then(navModule => {
        navModule.initSidebarNav();
    });
    
    // Load saved teams from localStorage
    loadSavedTeamsController();
}

// Run when page is loaded
document.addEventListener('DOMContentLoaded', initGroupControllers);