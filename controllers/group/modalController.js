// controllers/group/modalController.js - With error handling and fixed toast import
import { showModal, hideModal, hideAllModals } from '../../views/group/modalView.js';
import { showToast } from './toast.js';

/**
 * Safely get an element by ID, with console warning if not found
 * @param {string} id - Element ID to find
 * @returns {HTMLElement|null} - The element or null if not found
 */
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with ID "${id}" not found in the DOM`);
    }
    return element;
}

/**
 * Safely add event listener to an element
 * @param {string} id - Element ID
 * @param {string} event - Event name (e.g., 'click')
 * @param {Function} handler - Event handler function
 */
function safeAddEventListener(id, event, handler) {
    const element = safeGetElement(id);
    if (element) {
        element.addEventListener(event, handler);
    }
}

/**
 * Initialize controller for modals
 */
export function initModalsController() {
    // Get elements, with null checks
    const modalOverlay = safeGetElement('modalOverlay');
    const createTeamModal = safeGetElement('createTeamModal');
    const joinTeamModal = safeGetElement('joinTeamModal');
    const editTeamModal = safeGetElement('editTeamModal');
    const teamDropdown = safeGetElement('teamDropdown');
    
    // Skip initialization if essential elements are missing
    if (!modalOverlay) {
        console.error('Modal overlay element not found. Skipping modal initialization.');
        return;
    }
    
    // Create Team button event
    safeAddEventListener('createTeamBtn', 'click', function() {
        if (teamDropdown) teamDropdown.classList.remove('show');
        if (createTeamModal) showModal(createTeamModal);
    });
    
    // Join Team button event
    safeAddEventListener('joinTeamBtn', 'click', function() {
        if (teamDropdown) teamDropdown.classList.remove('show');
        if (joinTeamModal) showModal(joinTeamModal);
    });
    
    // Initialize close buttons if the modals exist
    if (createTeamModal) {
        safeAddEventListener('closeCreateTeamModal', 'click', () => hideModal(createTeamModal));
        safeAddEventListener('cancelCreateTeam', 'click', () => hideModal(createTeamModal));
    }
    
    if (joinTeamModal) {
        safeAddEventListener('closeJoinTeamModal', 'click', () => hideModal(joinTeamModal));
        safeAddEventListener('cancelJoinTeam', 'click', () => hideModal(joinTeamModal));
    }
    
    if (editTeamModal) {
        safeAddEventListener('closeEditTeamModal', 'click', () => hideModal(editTeamModal));
        safeAddEventListener('cancelEditTeam', 'click', () => hideModal(editTeamModal));
    }
    
    // Join Team submit button
    safeAddEventListener('joinTeamSubmit', 'click', function() {
        const teamCodeInput = safeGetElement('teamCode');
        if (!teamCodeInput) return;
        
        const teamCode = teamCodeInput.value;
        if (!teamCode.trim()) {
            alert('Please enter a team code.');
            return;
        }
        
        console.log('Joining team with code:', teamCode);
        
        // In a real application, this would call an API to join the team
        showToast('Attempting to join team with code ' + teamCode);
        
        if (joinTeamModal) hideModal(joinTeamModal);
        
        // Reset form
        teamCodeInput.value = '';
    });
    
    // Modal overlay click handler
    if (modalOverlay) {
        modalOverlay.addEventListener('click', hideAllModals);
    }
    
    // Escape key handler
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideAllModals();
        }
    });
}