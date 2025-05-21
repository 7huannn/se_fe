// controllers/group/teamController.js - Updated with removed chat references

import { loadTeams, saveTeams, generateTeamCode, getInitials, addTeam, getColorClass, 
         getTeamById, updateTeam, deleteTeam, updateTeamPrivacy } from '../../models/group/team.js';
import { createTeamCardElement, createTeamsGridStructure, toggleTeamsContent, 
         createTeamOptionsMenu, toggleTeamOptionsMenu, addPrivacyIndicator } from '../../views/group/teamView.js';
import { hideModal, showModal } from '../../views/group/modalView.js';
import { openTeamMembersModal } from './membersController.js';
/**
 * Khởi tạo controller cho team list
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
    
    // Listen for team edit events
    document.addEventListener('team-edit', handleTeamEdit);
    
    // Listen for team delete events
    document.addEventListener('team-delete', handleTeamDelete);
    
    // Listen for team privacy update events
    document.addEventListener('team-privacy-update', handleTeamPrivacyUpdate);
}

/**
 * Khởi tạo controller cho form tạo team
 */
export function initCreateTeamFormController() {
    const saveTeamBtn = document.getElementById('saveTeam');
    if (!saveTeamBtn) return;
    
    saveTeamBtn.addEventListener('click', () => {
        // Lấy dữ liệu từ form
        const teamName = document.getElementById('teamName').value;
        const teamDescription = document.getElementById('teamDescription').value;
        const privacy = document.querySelector('input[name="privacy"]:checked').value;
        const color = document.querySelector('input[name="color"]:checked').value;
        
        if (!teamName.trim()) {
            alert('Please enter a team name.');
            return;
        }
        
        // Tạo team code từ team name
        const teamCode = generateTeamCode(teamName);
        const initials = getInitials(teamName);
        
        // Tạo team data
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
        
        // Dispatch sự kiện để xử lý ở controller khác
        document.dispatchEvent(new CustomEvent('team-create', {
            detail: { team: teamData },
            bubbles: true
        }));
        
        // Reset form
        document.getElementById('teamName').value = '';
        document.getElementById('teamDescription').value = '';
        
        // Mở mục Teams nếu đang đóng
        const teamsContent = document.getElementById('teamsContent');
        const teamsChevron = document.getElementById('teamsChevron');
        if (teamsContent && teamsContent.style.display === 'none') {
            toggleTeamsContent(teamsContent, teamsChevron, true);
        }
        
        // Đóng modal
        const createTeamModal = document.getElementById('createTeamModal');
        hideModal(createTeamModal);

        // Show success message
        showToast('Team created successfully');
    });
}

/**
 * Khởi tạo controller cho form chỉnh sửa team
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
    
    // Save changes button event
    saveEditTeamBtn.addEventListener('click', () => {
        const teamId = parseInt(editTeamModal.dataset.teamId, 10);
        
        // Get form data
        const teamName = document.getElementById('editTeamName').value;
        const teamDescription = document.getElementById('editTeamDescription').value;
        const privacy = document.querySelector('input[name="editPrivacy"]:checked').value;
        const color = document.querySelector('input[name="editColor"]:checked').value;
        
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
 * Load các teams từ localStorage và render trên UI
 */
export function loadSavedTeamsController() {
    const teams = loadTeams();
    teams.forEach(team => {
        renderTeamCard(team);
    });
}

/**
 * Xử lý sự kiện tạo team mới
 */
export function handleTeamCreate(event) {
    const team = event.detail.team;
    
    // Lưu team vào model
    addTeam(team);
    
    // Render team lên UI
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
 * Render team card dựa trên dữ liệu team
 * @param {Object} team - Thông tin team
 */
export function renderTeamCard(team) {
    const teamsGrid = document.querySelector('.teams-grid');
    if (!teamsGrid) {
        // Nếu chưa có teams-grid, tạo mới cấu trúc
        const teamsSection = document.querySelector('.teams-section');
        const structure = createTeamsGridStructure(teamsSection);
        if (structure) {
            return renderTeamCard(team); // Gọi lại sau khi đã tạo cấu trúc
        }
        return;
    }
    
    // Tạo team card element
    const teamColorClass = getColorClass(team.color);
    const teamCard = createTeamCardElement(team, teamColorClass);
    
    // Add team ID as data attribute
    teamCard.dataset.teamId = team.id;
    
    // Add privacy indicator
    addPrivacyIndicator(teamCard, team.privacy || 'private');
    
    // Thêm card vào grid
    teamsGrid.appendChild(teamCard);
    
    // Thêm sự kiện cho team card
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
 * Gắn các sự kiện cho team card
 * @param {HTMLElement} teamCard - Team card element
 * @param {number} teamId - ID of the team
 */
/**
 * Gắn các sự kiện cho team card
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
                const membersOption = optionsMenu.querySelector('[data-action="members"]');
                const editOption = optionsMenu.querySelector('[data-action="edit"]');
                const privacyOption = optionsMenu.querySelector('[data-action="privacy"]');
                const deleteOption = optionsMenu.querySelector('[data-action="delete"]');
                
                if (membersOption) {
                    membersOption.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openTeamMembersModal(teamId);
                        toggleTeamOptionsMenu(optionsMenu, false);
                    });
                }
                
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
            
            // Calendar button (first button)
            if (index === 0) {
                window.location.href = "group-calendar.html";
                return;
            }
            
            // Members button (second button)
            if (index === 1 || button.classList.contains('members-btn')) {
                openTeamMembersModal(teamId);
                return;
            }
            
            // Privacy toggle button (third button)
            if (index === 2 || button.classList.contains('privacy-toggle')) {
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
                return;
            }
            
            // Edit button (fourth button)
            if (index === 3) {
                openEditTeamModal(teamId);
                return;
            }
        });
    });
    
    // Xử lý khi click vào card
    teamCard.addEventListener('click', function() {
        // Redirect to group calendar
        window.location.href = "group-calendar.html";
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
    const editTeamModal = document.getElementById('editTeamModal');
    const teamNameInput = document.getElementById('editTeamName');
    const teamDescriptionInput = document.getElementById('editTeamDescription');
    const privacyInputs = document.querySelectorAll('input[name="editPrivacy"]');
    const colorInputs = document.querySelectorAll('input[name="editColor"]');
    
    if (!editTeamModal || !teamNameInput) {
        showToast('Edit form not found', 'error');
        return;
    }
    
    // Populate form with team data
    teamNameInput.value = team.name || '';
    teamDescriptionInput.value = team.description || '';
    
    // Set privacy radio button
    privacyInputs.forEach(input => {
        if (input.value === team.privacy) {
            input.checked = true;
        }
    });
    
    // Set color radio button
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

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 */
function showToast(message, type = 'success') {
    // Find or create toast container
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}
