// controllers/group/index.js - Updated with backend integration

import { 
    initTeamsListController, 
    initCreateTeamFormController, 
    loadSavedTeamsController,
    handleTeamCreate, 
    handleTeamEdit, 
    handleTeamDelete,
    handleTeamPrivacyUpdate, 
    initEditTeamFormController,
    initJoinTeamController
} from './teamController.js';

import { initModalsController } from './modalController.js';
import { initDropdownController } from './dropdownController.js';
import { initTeamMembersController } from './membersController.js';
import { initNotificationsController } from "../notifications.js";
import { authService } from '../../services/authService.js';

/**
 * Initialize all controllers for group page with backend integration
 */
export async function initGroupControllers() {
    console.log('Initializing group controllers...');
    
    // Check authentication first
    if (!authService.isUserAuthenticated()) {
        console.warn('User not authenticated, redirecting to login');
        window.location.href = '/login.html';
        return;
    }
    
    try {
        // Initialize UI controllers
        initDropdownController();
        initModalsController();
        initTeamsListController();
        initCreateTeamFormController();
        initEditTeamFormController();
        initJoinTeamController(); // New join team controller
        initTeamMembersController();
        
        // Initialize notifications
        try {
            initNotificationsController();
        } catch (error) {
            console.warn('Failed to initialize notifications:', error);
        }

        // Add event listeners for team operations
        document.addEventListener('team-create', handleTeamCreate);
        document.addEventListener('team-edit', handleTeamEdit);
        document.addEventListener('team-delete', handleTeamDelete);
        document.addEventListener('team-privacy-update', handleTeamPrivacyUpdate);
        
        // Initialize sidebar navigation
        try {
            const navModule = await import('../../controllers/sidebar-navigation.js');
            navModule.initSidebarNav();
        } catch (error) {
            console.error('Failed to load sidebar navigation module:', error);
        }
        
        // Load teams from backend/localStorage
        await loadSavedTeamsController();
        
        // Initialize periodic sync (if needed)
        initPeriodicSync();
        
        console.log('Group controllers initialized successfully');
        
    } catch (error) {
        console.error('Error initializing group controllers:', error);
        showErrorMessage('Failed to initialize the application. Please refresh the page.');
    }
}

/**
 * Initialize periodic sync with backend (optional)
 */
function initPeriodicSync() {
    // Sync teams every 5 minutes (optional feature)
    const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
    
    setInterval(async () => {
        try {
            // Only sync if user is still authenticated
            if (authService.isUserAuthenticated()) {
                console.log('Performing periodic sync...');
                // await syncTeamsWithBackend(); // Implement when backend supports it
            }
        } catch (error) {
            console.warn('Periodic sync failed:', error);
        }
    }, SYNC_INTERVAL);
}

/**
 * Show error message to user
 */
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #e74c3c;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 500px;
        text-align: center;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 10 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 10000);
}

/**
 * Handle authentication state changes
 */
function handleAuthStateChange() {
    // Listen for authentication changes
    document.addEventListener('auth-state-changed', (event) => {
        const { isAuthenticated } = event.detail;
        
        if (!isAuthenticated) {
            console.log('User logged out, redirecting...');
            window.location.href = '/login.html';
        }
    });
}

/**
 * Initialize error handling
 */
function initErrorHandling() {
    // Global error handler
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        
        // Don't show error for network failures or script load failures
        if (event.error && event.error.name !== 'NetworkError') {
            showErrorMessage('An unexpected error occurred. Please refresh the page.');
        }
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        
        // Prevent default browser error handling
        event.preventDefault();
        
        // Show user-friendly error
        showErrorMessage('A network error occurred. Please check your connection and try again.');
    });
}

/**
 * Initialize performance monitoring (optional)
 */
function initPerformanceMonitoring() {
    // Log page load performance
    window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page load performance:', {
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            totalTime: perfData.loadEventEnd - perfData.fetchStart
        });
    });
}

/**
 * Main initialization function
 */
async function init() {
    console.log('Starting group page initialization...');
    
    // Initialize error handling first
    initErrorHandling();
    
    // Initialize performance monitoring
    initPerformanceMonitoring();
    
    // Handle authentication state changes
    handleAuthStateChange();
    
    // Initialize controllers
    await initGroupControllers();
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM is already ready
    init();
}

// Export for external use
export { initGroupControllers as default };