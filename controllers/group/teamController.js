// controllers/group/teamController.js - Updated with fixes and improved error handling

import { loadTeams, saveTeams, generateTeamCode, getInitials, addTeam, getColorClass, 
         getTeamById, updateTeam, deleteTeam, updateTeamPrivacy } from '../../models/group/team.js';
import { createTeamCardElement, createTeamsGridStructure, toggleTeamsContent, 
         createTeamOptionsMenu, toggleTeamOptionsMenu, addPrivacyIndicator } from '../../views/group/teamView.js';
import { hideModal, showModal } from '../../views/group/modalView.js';
import { showToast } from './toast.js';

/**
 * Safely get an element by ID
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} - Element or null if not found
 */
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with ID "${id}" not found in the DOM`);
    }
    return element;
}

/**
 * Initialize controller for team list
 */
export function initTeamsListController() {
    const teamsHeader = safeGetElement('teamsHeader');
    const teamsChevron = safeGetElement('teamsChevron');
    const teamsContent = safeGetElement('teamsContent');
    
    if (!teamsHeader || !teamsChevron || !teamsContent) {
        console.warn('Required elements for teams list not found');
        return;
    }
    
    teamsHeader.addEventListener('click', () => {
        toggleTeamsContent(
            teamsContent, 
            teamsChevron, 
            teamsContent.style.display === 'none'
        );
    });
    
    // Event listeners for team actions are now managed in index.js to avoid duplication
}

/**
 * Initialize controller for create team form
 */
export function initCreateTeamFormController() {
    const saveTeamBtn = safeGetElement('saveTeam');
    if (!saveTeamBtn) {
        console.warn('Save team button not found');
        return;
    }
    
    saveTeamBtn.addEventListener('click', () => {
        // Get form data
        const teamNameElement = safeGetElement('teamName');
        const teamDescriptionElement = safeGetElement('teamDescription');
        
        if (!teamNameElement) {
            console.error('Team name input not found');
            return;
        }
        
        const teamName = teamNameElement.value;
        const teamDescription = teamDescriptionElement ? teamDescriptionElement.value : '';
        
        const privacyInput = document.querySelector('input[name="privacy"]:checked');
        if (!privacyInput) {
            alert('Please select a privacy option.');
            return;
        }
        const privacy = privacyInput.value;
        
        const colorInput = document.querySelector('input[name="color"]:checked');
        if (!colorInput) {
            alert('Please select a color.');
            return;
        }
        const color = colorInput.value;
        
        if (!teamName.trim()) {
            alert('Please enter a team name.');
            return;
        }
        
        // Create team code from team name
        const teamCode = generateTeamCode(teamName);
        const initials = getInitials(teamName);
        
        // Create team data
        const teamData = {
            id: Date.now(), // Generate a unique ID for the team
            name: teamName,
            code: teamCode,
            description: teamDescription,
            privacy: privacy,
            color: color,
            initials: initials,
            createdAt: new Date().toISOString(),
            members: [] // Start with empty members list
        };
        
        // Dispatch event to be handled by controller in index.js
        document.dispatchEvent(new CustomEvent('team-create', {
            detail: { team: teamData },
            bubbles: true
        }));
        
        // Reset form
        if (teamNameElement) teamNameElement.value = '';
        if (teamDescriptionElement) teamDescriptionElement.value = '';
        
        // Open Teams section if closed
        const teamsContent = safeGetElement('teamsContent');
        const teamsChevron = safeGetElement('teamsChevron');
        if (teamsContent && teamsContent.style.display === 'none' && teamsChevron) {
            toggleTeamsContent(teamsContent, teamsChevron, true);
        }
        
        // Close modal
        const createTeamModal = safeGetElement('createTeamModal');
        if (createTeamModal) hideModal(createTeamModal);

        // Show success message
        showToast('Team created successfully');
    });
}

/**
 * Initialize controller for edit team form
 */
export function initEditTeamFormController() {
    const editTeamModal = safeGetElement('editTeamModal');
    const saveEditTeamBtn = safeGetElement('saveEditTeam');
    const cancelEditTeamBtn = safeGetElement('cancelEditTeam');
    const closeEditTeamBtn = safeGetElement('closeEditTeamModal');
    const deleteTeamBtn = safeGetElement('deleteTeam');
    
    if (!editTeamModal || !saveEditTeamBtn) {
        console.warn('Required elements for edit team form not found');
        return;
    }
    
    // Close button events
    if (closeEditTeamBtn) {
        closeEditTeamBtn.addEventListener('click', () => hideModal(editTeamModal));
    }
    
    if (cancelEditTeamBtn) {
        cancelEditTeamBtn.addEventListener('click', () => hideModal(editTeamModal));
    }
    
    // Save changes button event
    saveEditTeamBtn.addEventListener('click', () => {
        const teamId = parseInt(editTeamModal.dataset.teamId, 10);
        
        // Get form data
        const teamNameElement = safeGetElement('editTeamName');
        const teamDescriptionElement = safeGetElement('editTeamDescription');
        
        if (!teamNameElement) {
            console.error('Edit team name input not found');
            return;
        }
        
        const teamName = teamNameElement.value;
        const teamDescription = teamDescriptionElement ? teamDescriptionElement.value : '';
        
        const privacyInput = document.querySelector('input[name="editPrivacy"]:checked');
        if (!privacyInput) {
            alert('Please select a privacy option.');
            return;
        }
        const privacy = privacyInput.value;
        
        const colorInput = document.querySelector('input[name="editColor"]:checked');
        if (!colorInput) {
            alert('Please select a color.');
            return;
        }
        const color = colorInput.value;
        
        if (!teamName.trim()) {
            alert('Please enter a team name.');
            return;
        }
        
        // Generate initials from the name
        const initials = getInitials(teamName);
        
        // Create update data object
        const updateData = {
            name: teamName,
            description: teamDescription,
            privacy: privacy,
            color: color,
            initials: initials,
            updatedAt: new Date().toISOString()
        };
        
        // Dispatch event to update team
        document.dispatchEvent(new CustomEvent('team-edit', {
            detail: { teamId, updateData },
            bubbles: true
        }));
        
        // Close modal
        hideModal(editTeamModal);
    });
    
    // Delete team button event
    if (deleteTeamBtn) {
        deleteTeamBtn.addEventListener('click', () => {
            const teamId = parseInt(editTeamModal.dataset.teamId, 10);
            
            if (confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
                // Dispatch event to delete team
                document.dispatchEvent(new CustomEvent('team-delete', {
                    detail: { teamId },
                    bubbles: true
                }));
                
                // Close modal
                hideModal(editTeamModal);
            }
        });
    }
}

/**
 * Load teams from localStorage and render on UI
 */
export function loadSavedTeamsController() {
    const teams = loadTeams();
    teams.forEach(team => {
        renderTeamCard(team);
    });
}

/**
 * Handle team create event
 */
export function handleTeamCreate(event) {
    const team = event.detail.team;
    
    // Save team to model
    addTeam(team);
    
    // Render team on UI
    renderTeamCard(team);
}

/**
 * Handle team edit request
 */
export function handleTeamEdit(event) {
    const { teamId, updateData } = event.detail;
    
    // Update team in model
    const success = updateTeam(teamId, updateData);
    
    if (success) {
        // Refresh the UI to show updated team
        const teamCard = document.querySelector(`[data-team-id="${teamId}"]`);
        if (teamCard) {
            // Update specific parts of the card
            updateTeamCardUI(teamCard, updateData);
        } else {
            // If team card not found, refresh the entire list
            const teamsGrid = document.querySelector('.teams-grid');
            if (teamsGrid) {
                teamsGrid.innerHTML = '';
                loadSavedTeamsController();
            }
        }
        
        // Show success message
        showToast('Team updated successfully');
    } else {
        showToast('Failed to update team', 'error');
    }
}

/**
 * Handle team delete request
 */
export function handleTeamDelete(event) {
    const { teamId } = event.detail;
    
    // Delete team from model
    const success = deleteTeam(teamId);
    
    if (success) {
        // Remove team card from UI
        const teamCard = document.querySelector(`[data-team-id="${teamId}"]`);
        if (teamCard) {
            teamCard.remove();
        }
        
        // Show success message
        showToast('Team deleted successfully');
    } else {
        showToast('Failed to delete team', 'error');
    }
}

/**
 * Handle team privacy update
 */
export function handleTeamPrivacyUpdate(event) {
    const { teamId, privacy } = event.detail;
    
    // Update team privacy in model
    const success = updateTeamPrivacy(teamId, privacy);
    
    if (success) {
        // Update UI to reflect privacy change
        const privacyIndicator = document.querySelector(`[data-team-id="${teamId}"] .privacy-indicator`);
        if (privacyIndicator) {
            privacyIndicator.textContent = privacy === 'private' ? '🔒' : '🌐';
            privacyIndicator.setAttribute('title', privacy === 'private' ? 'Private Team' : 'Public Team');
        }
        
        showToast(`Team is now ${privacy}`);
    } else {
        showToast('Failed to update team privacy', 'error');
    }
}

/**
 * Render team card based on team data
 * @param {Object} team - Team information
 */
export function renderTeamCard(team) {
    const teamsGrid = document.querySelector('.teams-grid');
    if (!teamsGrid) {
        // If teams-grid doesn't exist, create structure
        const teamsSection = document.querySelector('.teams-section');
        if (!teamsSection) {
            console.error('Teams section not found');
            return;
        }
        
        const structure = createTeamsGridStructure(teamsSection);
        if (structure) {
            return renderTeamCard(team); // Call again after structure is created
        }
        return;
    }
    
    // Create team card element
    const teamColorClass = getColorClass(team.color);
    const teamCard = createTeamCardElement(team, teamColorClass);
    
    // Add team ID as data attribute
    teamCard.dataset.teamId = team.id;
    
    // Add privacy indicator
    addPrivacyIndicator(teamCard, team.privacy || 'private');
    
    // Add card to grid
    teamsGrid.appendChild(teamCard);
    
    // Add events for team card
    attachTeamCardEvents(teamCard, team.id);
}

/**
 * Update specific parts of a team card in the UI
 * @param {HTMLElement} teamCard - The team card element
 * @param {Object} updateData - New data to update
 */
function updateTeamCardUI(teamCard, updateData) {
    if (updateData.name) {
        const nameEl = teamCard.querySelector('.team-name');
        if (nameEl) nameEl.textContent = updateData.name;
        
        // If name changed, update initials
        if (updateData.initials) {
            const initialsEl = teamCard.querySelector('.team-icon');
            if (initialsEl) initialsEl.textContent = updateData.initials;
        }
    }
    
    if (updateData.color) {
        const iconEl = teamCard.querySelector('.team-icon');
        if (iconEl) {
            // Remove old color class
            const colorClasses = ['team-blue', 'team-green', 'team-orange', 'team-purple', 'team-pink'];
            colorClasses.forEach(cls => iconEl.classList.remove(cls));
            
            // Add new color class
            const colorClass = getColorClass(updateData.color);
            iconEl.classList.add(colorClass);
        }
    }
    
    if (updateData.privacy) {
        const privacyEl = teamCard.querySelector('.privacy-indicator');
        if (privacyEl) {
            privacyEl.textContent = updateData.privacy === 'private' ? '🔒' : '🌐';
            privacyEl.setAttribute('title', updateData.privacy === 'private' ? 'Private Team' : 'Public Team');
        }
    }
}

/**
 * Attach events for team card
 * @param {HTMLElement} teamCard - Team card element
 * @param {number} teamId - ID of the team
 */
export function attachTeamCardEvents(teamCard, teamId) {
    // Options button event
    const optionButton = teamCard.querySelector('.team-options-btn');
    if (optionButton) {
        let optionsMenu = null;
        
        optionButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling to card
            
            // If menu doesn't exist, create it
            if (!optionsMenu) {
                optionsMenu = createTeamOptionsMenu(teamId);
                teamCard.appendChild(optionsMenu);
                
                // Add event listeners to menu options
                const editOption = optionsMenu.querySelector('[data-action="edit"]');
                const privacyOption = optionsMenu.querySelector('[data-action="privacy"]');
                const deleteOption = optionsMenu.querySelector('[data-action="delete"]');
                
                if (editOption) {
                    editOption.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openEditTeamModal(teamId);
                        toggleTeamOptionsMenu(optionsMenu, false);
                    });
                }
                
                if (privacyOption) {
                    privacyOption.addEventListener('click', (e) => {
                        e.stopPropagation();
                        
                        // Get current team
                        const team = getTeamById(teamId);
                        if (!team) return;
                        
                        // Toggle privacy
                        const newPrivacy = team.privacy === 'private' ? 'public' : 'private';
                        
                        // Dispatch event to update privacy
                        document.dispatchEvent(new CustomEvent('team-privacy-update', {
                            detail: { teamId, privacy: newPrivacy },
                            bubbles: true
                        }));
                        
                        toggleTeamOptionsMenu(optionsMenu, false);
                    });
                }
                
                if (deleteOption) {
                    deleteOption.addEventListener('click', (e) => {
                        e.stopPropagation();
                        
                        if (confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
                            // Dispatch event to delete team
                            document.dispatchEvent(new CustomEvent('team-delete', {
                                detail: { teamId },
                                bubbles: true
                            }));
                        }
                        
                        toggleTeamOptionsMenu(optionsMenu, false);
                    });
                }
            }
            
            // Toggle menu visibility
            toggleTeamOptionsMenu(optionsMenu, !optionsMenu.classList.contains('show'));
            
            // Close menu when clicking outside
            const closeMenuHandler = (event) => {
                if (!optionsMenu.contains(event.target) && event.target !== optionButton) {
                    toggleTeamOptionsMenu(optionsMenu, false);
                    document.removeEventListener('click', closeMenuHandler);
                }
            };
            
            document.addEventListener('click', closeMenuHandler);
        });
    }
    
    // Action buttons events
    const actionButtons = teamCard.querySelectorAll('.team-action-btn');
    actionButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling to card
            
            // Determine action based on index
            switch (index) {
                case 0: // Chat button (first button)
                    window.location.href = "../html/chat.html";
                    break;
                    
                case 1: // Privacy toggle button (second button)
                    // Get current team
                    const team = getTeamById(teamId);
                    if (!team) return;
                    
                    // Toggle privacy
                    const newPrivacy = team.privacy === 'private' ? 'public' : 'private';
                    
                    // Dispatch event to update privacy
                    document.dispatchEvent(new CustomEvent('team-privacy-update', {
                        detail: { teamId, privacy: newPrivacy },
                        bubbles: true
                    }));
                    break;
                    
                case 2: // Edit button (third button)
                    openEditTeamModal(teamId);
                    break;
            }
        });
    });
    
    // Handle click on card
    teamCard.addEventListener('click', function() {
        // Navigate to chat.html when clicking on team card
        window.location.href = "../html/chat.html";
    });
}

/**
 * Open edit team modal with pre-filled data
 * @param {number} teamId - ID of the team to edit
 */
function openEditTeamModal(teamId) {
    const team = getTeamById(teamId);
    if (!team) {
        showToast('Team not found', 'error');
        return;
    }
    
    // Get edit modal and form elements
    const editTeamModal = safeGetElement('editTeamModal');
    const teamNameInput = safeGetElement('editTeamName');
    const teamDescriptionInput = safeGetElement('editTeamDescription');
    
    if (!editTeamModal || !teamNameInput) {
        showToast('Edit form not found', 'error');
        return;
    }
    
    // Populate form with team data
    teamNameInput.value = team.name || '';
    if (teamDescriptionInput) {
        teamDescriptionInput.value = team.description || '';
    }
    
    // Set privacy radio button
    const privacyInputs = document.querySelectorAll('input[name="editPrivacy"]');
    privacyInputs.forEach(input => {
        if (input.value === team.privacy) {
            input.checked = true;
        }
    });
    
    // Set color radio button
    const colorInputs = document.querySelectorAll('input[name="editColor"]');
    colorInputs.forEach(input => {
        if (input.value === team.color) {
            input.checked = true;
        }
    });
    
    // Set team ID in a data attribute
    editTeamModal.dataset.teamId = teamId;
    
    // Show the modal
    showModal(editTeamModal);
}