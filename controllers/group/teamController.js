// controllers/group/teamController.js - Updated with backend integration

import { 
    loadTeams, 
    saveTeams, 
    generateTeamCode, 
    getInitials, 
    addTeam, 
    getColorClass,
    getTeamById, 
    updateTeam, 
    deleteTeam, 
    updateTeamPrivacy,
    createTeamOnBackend,
    joinTeamByCode
} from '../../models/group/team.js';

import { createTeamCardElement, createTeamsGridStructure, toggleTeamsContent, 
         createTeamOptionsMenu, toggleTeamOptionsMenu, addPrivacyIndicator } from '../../views/group/teamView.js';
import { hideModal, showModal } from '../../views/group/modalView.js';
import { openTeamMembersModal } from './membersController.js';
import { TEAM_ROLES, isTeamLeader, canManageMembers, canDeleteTeam, canEditTeam, getCurrentUser } from '../../models/group/team-permissions.js';

// Import notification helpers
import { 
  createTeamCreationNotification,
  createTeamEditNotification,
  createTeamDeletionNotification,
  createPrivacyChangeNotification,
  dispatchNotificationEvent,
  showDesktopNotification,
  getCurrentUserForNotifications
} from '../../models/group/team-notifications.js';

/**
 * Initialize teams list controller
 */
export function initTeamsListController() {
    const teamsHeader = document.getElementById('teamsHeader');
    const teamsChevron = document.getElementById('teamsChevron');
    const teamsContent = document.getElementById('teamsContent');
    
    if (!teamsHeader || !teamsChevron || !teamsContent) return;
    
    teamsHeader.addEventListener('click', () => {
        toggleTeamsContent(
            teamsContent, 
            teamsChevron, 
            teamsContent.style.display === 'none'
        );
    });
}

/**
 * Initialize create team form controller with backend integration
 */
export function initCreateTeamFormController() {
    const saveTeamBtn = document.getElementById('saveTeam');
    if (!saveTeamBtn) return;
    
    saveTeamBtn.addEventListener('click', async () => {
        const teamName = document.getElementById('teamName').value;
        const teamDescription = document.getElementById('teamDescription').value;
        const privacy = document.querySelector('input[name="privacy"]:checked').value;
        const color = document.querySelector('input[name="color"]:checked').value;
        
        if (!teamName.trim()) {
            showToast('Please enter a team name.', 'error');
            return;
        }
        
        // Show loading state
        saveTeamBtn.disabled = true;
        saveTeamBtn.textContent = 'Creating...';
        
        try {
            const teamCode = generateTeamCode(teamName);
            const initials = getInitials(teamName);
            const currentUser = getCurrentUser();
            
            // Create initial members array with current user as leader
            const members = [];
            
            if (currentUser.email) {
                members.push({
                    id: Date.now(),
                    email: currentUser.email,
                    name: currentUser.name,
                    role: TEAM_ROLES.LEADER,
                    addedAt: new Date().toISOString()
                });
            }
            
            // Add temporary members
            if (window.tempTeamMembers && window.tempTeamMembers.length > 0) {
                window.tempTeamMembers.forEach(member => {
                    if (!members.some(m => m.email.toLowerCase() === member.email.toLowerCase())) {
                        members.push({
                            ...member,
                            role: member.role || TEAM_ROLES.MEMBER
                        });
                    }
                });
            }
            
            // Create team data
            const teamData = {
                id: Date.now(),
                name: teamName,
                code: teamCode,
                description: teamDescription,
                privacy: privacy,
                color: color,
                initials: initials,
                createdAt: new Date().toISOString(),
                createdBy: currentUser.email || 'unknown',
                members: members
            };
            
            // Create team (will try backend first, then fallback to local)
            const result = await addTeam(teamData);
            
            if (result) {
                // Create and dispatch notification
                const notification = createTeamCreationNotification(result);
                dispatchNotificationEvent(notification);
                showDesktopNotification(notification);
                
                // Dispatch success event
                document.dispatchEvent(new CustomEvent('team-create', {
                    detail: { team: result },
                    bubbles: true
                }));
                
                // Reset form
                document.getElementById('teamName').value = '';
                document.getElementById('teamDescription').value = '';
                window.tempTeamMembers = [];
                
                // Show teams section
                const teamsContent = document.getElementById('teamsContent');
                const teamsChevron = document.getElementById('teamsChevron');
                if (teamsContent && teamsContent.style.display === 'none') {
                    toggleTeamsContent(teamsContent, teamsChevron, true);
                }
                
                // Close modal
                const createTeamModal = document.getElementById('createTeamModal');
                hideModal(createTeamModal);
                
                showToast('Team created successfully');
            } else {
                showToast('Failed to create team. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error creating team:', error);
            showToast('Failed to create team. Please try again.', 'error');
        } finally {
            // Reset button state
            saveTeamBtn.disabled = false;
            saveTeamBtn.textContent = 'Create Team';
        }
    });
}

/**
 * Initialize join team functionality
 */
export function initJoinTeamController() {
    const joinTeamBtn = document.getElementById('joinTeamSubmit');
    if (!joinTeamBtn) return;
    
    // Remove existing event listeners
    const newJoinBtn = joinTeamBtn.cloneNode(true);
    joinTeamBtn.parentNode.replaceChild(newJoinBtn, joinTeamBtn);
    
    newJoinBtn.addEventListener('click', async () => {
        const teamCodeInput = document.getElementById('teamCode');
        const teamCode = teamCodeInput.value.trim();
        
        if (!teamCode) {
            showToast('Please enter a team code', 'error');
            return;
        }
        
        // Show loading state
        newJoinBtn.disabled = true;
        newJoinBtn.textContent = 'Joining...';
        
        try {
            const result = await joinTeamByCode(teamCode);
            
            if (result.success) {
                showToast('Successfully joined the team!');
                
                // Close modal
                const joinTeamModal = document.getElementById('joinTeamModal');
                hideModal(joinTeamModal);
                
                // Reset form
                teamCodeInput.value = '';
                
                // Refresh teams list
                await loadSavedTeamsController();
            } else {
                showToast(result.message || 'Failed to join team', 'error');
            }
        } catch (error) {
            console.error('Error joining team:', error);
            showToast('Failed to join team. Please try again.', 'error');
        } finally {
            // Reset button state
            newJoinBtn.disabled = false;
            newJoinBtn.textContent = 'Join Team';
        }
    });
}

/**
 * Load saved teams from backend/localStorage and render
 */
export async function loadSavedTeamsController() {
    try {
        // Clear existing teams
        const teamsGrid = document.querySelector('.teams-grid');
        if (teamsGrid) {
            teamsGrid.innerHTML = '';
        }
        
        // Load teams
        const teams = await loadTeams();
        
        // Render each team
        teams.forEach(team => {
            renderTeamCard(team);
        });
        
        console.log(`Loaded ${teams.length} teams`);
    } catch (error) {
        console.error('Error loading teams:', error);
        showToast('Failed to load teams', 'error');
    }
}

/**
 * Handle team create event
 */
export function handleTeamCreate(event) {
    const team = event.detail.team;
    renderTeamCard(team);
}

/**
 * Handle team edit with backend sync
 */
export async function handleTeamEdit(event) {
    const { teamId, updateData } = event.detail;
    
    try {
        const team = await getTeamById(teamId);
        const currentUser = getCurrentUser();
        
        if (!canEditTeam(team, currentUser.email)) {
            showToast('Only team leaders can edit team details', 'error');
            return;
        }
        
        const success = await updateTeam(teamId, updateData);
        
        if (success) {
            const teamCard = document.querySelector(`[data-team-id="${teamId}"]`);
            if (teamCard) {
                updateTeamCardUI(teamCard, updateData);
            } else {
                await loadSavedTeamsController();
            }
            
            showToast('Team updated successfully');
        } else {
            showToast('Failed to update team', 'error');
        }
    } catch (error) {
        console.error('Error updating team:', error);
        showToast('Failed to update team', 'error');
    }
}

/**
 * Handle team delete with backend sync
 */
export async function handleTeamDelete(event) {
    const { teamId } = event.detail;
    
    try {
        const team = await getTeamById(teamId);
        const currentUser = getCurrentUser();
        
        if (!canDeleteTeam(team, currentUser.email)) {
            showToast('Only team leaders can delete teams', 'error');
            return;
        }
        
        const success = await deleteTeam(teamId);
        
        if (success) {
            const teamCard = document.querySelector(`[data-team-id="${teamId}"]`);
            if (teamCard) {
                teamCard.remove();
            }
            
            showToast('Team deleted successfully');
        } else {
            showToast('Failed to delete team', 'error');
        }
    } catch (error) {
        console.error('Error deleting team:', error);
        showToast('Failed to delete team', 'error');
    }
}

/**
 * Handle team privacy update
 */
export async function handleTeamPrivacyUpdate(event) {
    const { teamId, privacy } = event.detail;
    
    try {
        const team = await getTeamById(teamId);
        const currentUser = getCurrentUser();
        
        if (!canEditTeam(team, currentUser.email)) {
            showToast('Only team leaders can change privacy settings', 'error');
            return;
        }
        
        const oldPrivacy = team.privacy;
        const success = await updateTeamPrivacy(teamId, privacy);
        
        if (success) {
            const currentUserForNotif = getCurrentUserForNotifications();
            const notification = createPrivacyChangeNotification(team, oldPrivacy, privacy, currentUserForNotif);
            dispatchNotificationEvent(notification);
            
            const privacyIndicator = document.querySelector(`[data-team-id="${teamId}"] .privacy-indicator`);
            if (privacyIndicator) {
                privacyIndicator.textContent = privacy === 'private' ? '🔒' : '🌐';
                privacyIndicator.setAttribute('title', privacy === 'private' ? 'Private Team' : 'Public Team');
            }
            
            showToast(`Team is now ${privacy}`);
        } else {
            showToast('Failed to update team privacy', 'error');
        }
    } catch (error) {
        console.error('Error updating team privacy:', error);
        showToast('Failed to update team privacy', 'error');
    }
}

/**
 * Update team card UI elements
 */
function updateTeamCardUI(teamCard, updateData) {
    if (updateData.name) {
        const nameEl = teamCard.querySelector('.team-name');
        if (nameEl) nameEl.textContent = updateData.name;
        
        if (updateData.initials) {
            const initialsEl = teamCard.querySelector('.team-icon');
            if (initialsEl) initialsEl.textContent = updateData.initials;
        }
    }
    
    if (updateData.color) {
        const iconEl = teamCard.querySelector('.team-icon');
        if (iconEl) {
            const colorClasses = ['team-blue', 'team-green', 'team-orange', 'team-purple', 'team-pink'];
            colorClasses.forEach(cls => iconEl.classList.remove(cls));
            
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
 * Render team card
 */
export function renderTeamCard(team) {
    const teamsGrid = document.querySelector('.teams-grid');
    if (!teamsGrid) {
        const teamsSection = document.querySelector('.teams-section');
        const structure = createTeamsGridStructure(teamsSection);
        if (structure) {
            return renderTeamCard(team);
        }
        return;
    }
    
    const teamColorClass = getColorClass(team.color);
    const teamCard = createTeamCardElement(team, teamColorClass);
    
    teamCard.dataset.teamId = team.id;
    addPrivacyIndicator(teamCard, team.privacy || 'private');
    
    teamsGrid.appendChild(teamCard);
    attachTeamCardEvents(teamCard, team.id);
}

/**
 * Attach events to team card
 */
export async function attachTeamCardEvents(teamCard, teamId) {
    const team = await getTeamById(teamId);
    if (!team) return;
    
    const currentUser = getCurrentUser();
    const isLeader = isTeamLeader(team, currentUser.email);
    
    // Options button
    const optionButton = teamCard.querySelector('.team-options-btn');
    if (optionButton) {
        let optionsMenu = null;
        
        optionButton.addEventListener('click', function(e) {
            e.stopPropagation();
            
            if (!optionsMenu) {
                optionsMenu = createTeamOptionsMenu(teamId, isLeader);
                teamCard.appendChild(optionsMenu);
                
                // Add menu event listeners
                addOptionsMenuListeners(optionsMenu, teamId, team, currentUser, isLeader);
            }
            
            toggleTeamOptionsMenu(optionsMenu, !optionsMenu.classList.contains('show'));
            
            const closeMenuHandler = (event) => {
                if (!optionsMenu.contains(event.target) && event.target !== optionButton) {
                    toggleTeamOptionsMenu(optionsMenu, false);
                    document.removeEventListener('click', closeMenuHandler);
                }
            };
            
            document.addEventListener('click', closeMenuHandler);
        });
    }
    
    // Action buttons
    const actionButtons = teamCard.querySelectorAll('.team-action-btn');
    actionButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            if (index === 0) {
                window.location.href = "group-calendar.html";
            } else if (index === 1 || button.classList.contains('members-btn')) {
                openTeamMembersModal(teamId, isLeader);
            } else if (index === 2 || button.classList.contains('privacy-toggle')) {
                if (canEditTeam(team, currentUser.email)) {
                    const newPrivacy = team.privacy === 'private' ? 'public' : 'private';
                    document.dispatchEvent(new CustomEvent('team-privacy-update', {
                        detail: { teamId, privacy: newPrivacy },
                        bubbles: true
                    }));
                } else {
                    showToast('Only team leaders can change privacy settings', 'error');
                }
            } else if (index === 3) {
                if (canEditTeam(team, currentUser.email)) {
                    openEditTeamModal(teamId);
                } else {
                    showToast('Only team leaders can edit team details', 'error');
                }
            }
        });
    });
    
    // Card click event
    teamCard.addEventListener('click', function() {
        window.location.href = "group-calendar.html";
    });
}

/**
 * Add event listeners to options menu
 */
function addOptionsMenuListeners(optionsMenu, teamId, team, currentUser, isLeader) {
    const membersOption = optionsMenu.querySelector('[data-action="members"]');
    const editOption = optionsMenu.querySelector('[data-action="edit"]');
    const privacyOption = optionsMenu.querySelector('[data-action="privacy"]');
    const deleteOption = optionsMenu.querySelector('[data-action="delete"]');
    
    if (membersOption) {
        membersOption.addEventListener('click', (e) => {
            e.stopPropagation();
            openTeamMembersModal(teamId, isLeader);
            toggleTeamOptionsMenu(optionsMenu, false);
        });
    }
    
    if (editOption) {
        editOption.addEventListener('click', (e) => {
            e.stopPropagation();
            if (canEditTeam(team, currentUser.email)) {
                openEditTeamModal(teamId);
            } else {
                showToast('Only team leaders can edit team details', 'error');
            }
            toggleTeamOptionsMenu(optionsMenu, false);
        });
    }
    
    if (privacyOption) {
        privacyOption.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (canEditTeam(team, currentUser.email)) {
                const newPrivacy = team.privacy === 'private' ? 'public' : 'private';
                document.dispatchEvent(new CustomEvent('team-privacy-update', {
                    detail: { teamId, privacy: newPrivacy },
                    bubbles: true
                }));
            } else {
                showToast('Only team leaders can change privacy settings', 'error');
            }
            
            toggleTeamOptionsMenu(optionsMenu, false);
        });
    }
    
    if (deleteOption) {
        deleteOption.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            if (canDeleteTeam(team, currentUser.email)) {
                if (confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
                    const currentUserForNotif = getCurrentUserForNotifications();
                    const notification = createTeamDeletionNotification(team, currentUserForNotif);
                    dispatchNotificationEvent(notification);
                    showDesktopNotification(notification);
                    
                    document.dispatchEvent(new CustomEvent('team-delete', {
                        detail: { teamId },
                        bubbles: true
                    }));
                }
            } else {
                showToast('Only team leaders can delete teams', 'error');
            }
            
            toggleTeamOptionsMenu(optionsMenu, false);
        });
    }
}

/**
 * Open edit team modal
 */
async function openEditTeamModal(teamId) {
    const team = await getTeamById(teamId);
    if (!team) {
        showToast('Team not found', 'error');
        return;
    }
    
    const editTeamModal = document.getElementById('editTeamModal');
    const teamNameInput = document.getElementById('editTeamName');
    const teamDescriptionInput = document.getElementById('editTeamDescription');
    const privacyInputs = document.querySelectorAll('input[name="editPrivacy"]');
    const colorInputs = document.querySelectorAll('input[name="editColor"]');
    
    if (!editTeamModal || !teamNameInput) {
        showToast('Edit form not found', 'error');
        return;
    }
    
    // Populate form
    teamNameInput.value = team.name || '';
    if (teamDescriptionInput) {
        teamDescriptionInput.value = team.description || '';
    }
    
    // Set privacy radio
    privacyInputs.forEach(input => {
        if (input.value === team.privacy) {
            input.checked = true;
        }
    });
    
    // Set color radio
    colorInputs.forEach(input => {
        if (input.value === team.color) {
            input.checked = true;
        }
    });
    
    // Set team ID
    editTeamModal.dataset.teamId = teamId;
    
    showModal(editTeamModal);
}

/**
 * Initialize edit team form controller
 */
export function initEditTeamFormController() {
    const editTeamModal = document.getElementById('editTeamModal');
    const saveEditTeamBtn = document.getElementById('saveEditTeam');
    const cancelEditTeamBtn = document.getElementById('cancelEditTeam');
    const closeEditTeamBtn = document.getElementById('closeEditTeamModal');
    const deleteTeamBtn = document.getElementById('deleteTeam');
    
    if (!editTeamModal || !saveEditTeamBtn) return;
    
    // Close button events
    if (closeEditTeamBtn) {
        closeEditTeamBtn.addEventListener('click', () => hideModal(editTeamModal));
    }
    
    if (cancelEditTeamBtn) {
        cancelEditTeamBtn.addEventListener('click', () => hideModal(editTeamModal));
    }
    
    // Save changes
    saveEditTeamBtn.addEventListener('click', async () => {
        const teamId = parseInt(editTeamModal.dataset.teamId, 10);
        const originalTeam = await getTeamById(teamId);
        
        const teamName = document.getElementById('editTeamName').value;
        const teamDescription = document.getElementById('editTeamDescription').value;
        const privacy = document.querySelector('input[name="editPrivacy"]:checked').value;
        const color = document.querySelector('input[name="editColor"]:checked').value;
        
        if (!teamName.trim()) {
            showToast('Please enter a team name.', 'error');
            return;
        }
        
        // Show loading
        saveEditTeamBtn.disabled = true;
        saveEditTeamBtn.textContent = 'Saving...';
        
        try {
            const initials = getInitials(teamName);
            
            const updateData = {
                name: teamName,
                description: teamDescription,
                privacy: privacy,
                color: color,
                initials: initials,
                updatedAt: new Date().toISOString()
            };
            
            // Track changes for notification
            const changes = {};
            if (originalTeam.name !== teamName) changes.name = teamName;
            if (originalTeam.description !== teamDescription) changes.description = teamDescription;
            if (originalTeam.privacy !== privacy) changes.privacy = privacy;
            if (originalTeam.color !== color) changes.color = color;
            
            // Create notification if there are changes
            if (Object.keys(changes).length > 0) {
                const currentUser = getCurrentUserForNotifications();
                const notification = createTeamEditNotification(originalTeam, changes, currentUser);
                dispatchNotificationEvent(notification);
            }
            
            // Update team
            document.dispatchEvent(new CustomEvent('team-edit', {
                detail: { teamId, updateData },
                bubbles: true
            }));
            
            hideModal(editTeamModal);
        } catch (error) {
            console.error('Error updating team:', error);
            showToast('Failed to update team', 'error');
        } finally {
            saveEditTeamBtn.disabled = false;
            saveEditTeamBtn.textContent = 'Save Changes';
        }
    });
    
    // Delete team
    if (deleteTeamBtn) {
        deleteTeamBtn.addEventListener('click', async () => {
            const teamId = parseInt(editTeamModal.dataset.teamId, 10);
            const team = await getTeamById(teamId);
            const currentUser = getCurrentUser();
            
            if (!canDeleteTeam(team, currentUser.email)) {
                showToast('Only team leaders can delete teams', 'error');
                return;
            }
            
            if (confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
                const currentUserForNotif = getCurrentUserForNotifications();
                const notification = createTeamDeletionNotification(team, currentUserForNotif);
                dispatchNotificationEvent(notification);
                showDesktopNotification(notification);
                
                document.dispatchEvent(new CustomEvent('team-delete', {
                    detail: { teamId },
                    bubbles: true
                }));
                
                hideModal(editTeamModal);
            }
        });
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        background: ${type === 'error' ? '#e74c3c' : '#27ae60'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        pointer-events: auto;
        max-width: 300px;
        word-wrap: break-word;
    `;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}