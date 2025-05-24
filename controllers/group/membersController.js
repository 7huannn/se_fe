// controllers/group/membersController.js - Updated with role management

import { 
    addTeamMember, 
    removeTeamMember, 
    getTeamMembers, 
    getTeamById, 
    isValidEmail,
    getNameFromEmail,
    updateTeamMemberRole
} from '../../models/group/team.js';

import { TEAM_ROLES, isTeamLeader, canManageMembers, getCurrentUser } from '../../models/group/team-permissions.js';
import { showModal, hideModal } from '../../views/group/modalView.js';
import { addTeamRoleStyles } from '../../views/group/teamView.js';

/**
 * Initialize the team members management functionality
 */
export function initTeamMembersController() {
    // Initialize create team member functionality
    initCreateTeamMembersUI();
    
    // Initialize manage team members modal
    initManageTeamMembersModal();
    
    // Listen for team member events
    document.addEventListener('team-member-add', handleTeamMemberAdd);
    document.addEventListener('team-member-remove', handleTeamMemberRemove);
    document.addEventListener('team-member-role-change', handleTeamMemberRoleChange);
    
    // Add styles for role badges
    addTeamRoleStyles();
}

/**
 * Initialize the UI for adding members during team creation
 */
function initCreateTeamMembersUI() {
    const addMemberBtn = document.getElementById('addMemberBtn');
    const memberEmailInput = document.getElementById('memberEmail');
    const memberError = document.getElementById('memberError');
    const membersList = document.getElementById('teamMembersList');
    const roleSelect = document.getElementById('memberRole');
    
    if (!addMemberBtn || !memberEmailInput || !membersList) return;
    
    // Create temporary array to store members during team creation
    window.tempTeamMembers = [];
    
    // Add member button click event
    addMemberBtn.addEventListener('click', () => {
        addMemberToCreateForm();
    });
    
    // Enter key in the email input
    memberEmailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addMemberToCreateForm();
        }
    });
    
    // Function to add member to the form
    function addMemberToCreateForm() {
        const email = memberEmailInput.value.trim();
        
        // Validate email
        if (!email) {
            showMemberError(memberError, 'Please enter an email address');
            return;
        }
        
        if (!isValidEmail(email)) {
            showMemberError(memberError, 'Please enter a valid email address');
            return;
        }
        
        // Check if email already exists in the list
        if (window.tempTeamMembers.some(m => m.email.toLowerCase() === email.toLowerCase())) {
            showMemberError(memberError, 'This member is already added');
            return;
        }
        
        // Get the role from the select if it exists
        const role = roleSelect ? roleSelect.value : TEAM_ROLES.MEMBER;
        
        // Add to temporary array
        const member = {
            id: Date.now(),
            email: email,
            name: getNameFromEmail(email),
            role: role
        };
        
        window.tempTeamMembers.push(member);
        
        // Add to UI
        renderMemberItem(membersList, member, 'create');
        
        // Clear input and error
        memberEmailInput.value = '';
        clearMemberError(memberError);
        
        // Focus back on input
        memberEmailInput.focus();
    }
    
    // Hook into the save team button to ensure members are saved with the team
    const saveTeamBtn = document.getElementById('saveTeam');
    if (saveTeamBtn) {
        const originalClickHandler = saveTeamBtn.onclick;
        saveTeamBtn.onclick = function(e) {
            // Add the members to the team data before saving
            const teamNameInput = document.getElementById('teamName');
            
            if (!teamNameInput || !teamNameInput.value.trim()) {
                // If team name is not valid, let original handler deal with it
                if (originalClickHandler) return originalClickHandler.call(this, e);
                return;
            }
            
            // Add event listener to capture the team-create event
            document.addEventListener('team-create', function handleTeamCreate(event) {
                // Add members to the team data
                const teamData = event.detail.team;
                teamData.members = window.tempTeamMembers;
                
                // Remove the listener to prevent duplicates
                document.removeEventListener('team-create', handleTeamCreate);
                
                // Clear temporary members
                window.tempTeamMembers = [];
            }, { once: true });
            
            // Call original handler
            if (originalClickHandler) originalClickHandler.call(this, e);
        };
    }
}

/**
 * Initialize the manage team members modal
 */
function initManageTeamMembersModal() {
    const modal = document.getElementById('teamMembersModal');
    const closeBtn = document.getElementById('closeTeamMembersModal');
    const closeModalBtn = document.getElementById('closeTeamMembersBtn');
    const addMemberBtn = document.getElementById('manageMemberBtn');
    const memberEmailInput = document.getElementById('manageMemberEmail');
    const memberError = document.getElementById('manageMemberError');
    const roleSelect = document.getElementById('manageMemberRole');
    
    if (!modal || !closeBtn || !closeModalBtn || !addMemberBtn || !memberEmailInput) return;
    
    // Close buttons
    closeBtn.addEventListener('click', () => hideModal(modal));
    closeModalBtn.addEventListener('click', () => hideModal(modal));
    
    // Add member button
    addMemberBtn.addEventListener('click', () => {
        addMemberToExistingTeam();
    });
    
    // Enter key in email input
    memberEmailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addMemberToExistingTeam();
        }
    });
    
    // Function to add member to existing team
    function addMemberToExistingTeam() {
        const email = memberEmailInput.value.trim();
        const teamId = parseInt(modal.dataset.teamId, 10);
        const isLeader = modal.dataset.isLeader === 'true';
        
        if (!teamId) {
            showMemberError(memberError, 'Team ID not found');
            return;
        }
        
        // Validate email
        if (!email) {
            showMemberError(memberError, 'Please enter an email address');
            return;
        }
        
        if (!isValidEmail(email)) {
            showMemberError(memberError, 'Please enter a valid email address');
            return;
        }
        
        // Get the role from the select if it exists
        const role = roleSelect ? roleSelect.value : TEAM_ROLES.MEMBER;
        
        // Check if current user has permission to add members
        const team = getTeamById(teamId);
        const currentUser = getCurrentUser();
        
        if (!isLeader && !canManageMembers(team, currentUser.email)) {
            showMemberError(memberError, 'You do not have permission to add members');
            return;
        }
        
        // Dispatch event to add member
        document.dispatchEvent(new CustomEvent('team-member-add', {
            detail: { 
                teamId,
                member: {
                    email: email,
                    name: getNameFromEmail(email),
                    role: role
                }
            },
            bubbles: true
        }));
        
        // Clear input and error
        memberEmailInput.value = '';
        clearMemberError(memberError);
        
        // Refresh members list
        refreshTeamMembersList(teamId, isLeader);
        
        // Focus back on input
        memberEmailInput.focus();
    }
}

/**
 * Open the team members modal for a specific team
 * @param {number} teamId - ID of the team
 * @param {boolean} isLeader - Whether the current user is a leader
 */
export function openTeamMembersModal(teamId, isLeader = false) {
    const modal = document.getElementById('teamMembersModal');
    if (!modal) return;
    
    // Set team ID and leader status in modal dataset
    modal.dataset.teamId = teamId;
    modal.dataset.isLeader = isLeader.toString();
    
    // Get team info
    const team = getTeamById(teamId);
    if (!team) {
        console.error('Team not found:', teamId);
        return;
    }
    
    // Check user permissions
    const currentUser = getCurrentUser();
    const userIsLeader = isTeamLeader(team, currentUser.email);
    
    // Update UI based on permissions
    const addMemberSection = modal.querySelector('.manage-member-form');
    if (addMemberSection) {
        if (userIsLeader) {
            addMemberSection.style.display = 'block';
        } else {
            addMemberSection.style.display = 'none';
        }
    }
    
    // Render team header
    const headerContainer = document.getElementById('teamMembersHeader');
    if (headerContainer) {
        // Get color class
        const colorMap = {
            'blue': 'team-blue',
            'orange': 'team-orange',
            'green': 'team-green',
            'purple': 'team-purple',
            'red': 'team-pink'
        };
        const colorClass = colorMap[team.color] || 'team-blue';
        
        // Render team header
        headerContainer.innerHTML = `
            <div class="team-header-icon ${colorClass}">${team.initials}</div>
            <div class="team-info">
                <div class="team-name">${team.name}</div>
                <div class="team-code">${team.code}</div>
                <div class="team-member-count">${team.members ? team.members.length : 0} member${team.members && team.members.length !== 1 ? 's' : ''}</div>
            </div>
            ${userIsLeader ? '<div class="leader-badge">You are a team leader</div>' : ''}
        `;
    }
    
    // Refresh members list
    refreshTeamMembersList(teamId, isLeader);
    
    // Show modal
    showModal(modal);
}

/**
 * Refresh the team members list in the modal
 * @param {number} teamId - ID of the team
 * @param {boolean} isLeader - Whether the current user is a leader
 */
function refreshTeamMembersList(teamId, isLeader = false) {
    const membersList = document.getElementById('manageMembersList');
    if (!membersList) return;
    
    // Clear current list
    membersList.innerHTML = '';
    
    // Get team members
    const members = getTeamMembers(teamId);
    
    // Get current user
    const currentUser = getCurrentUser();
    
    if (!members || members.length === 0) {
        // Show empty message
        membersList.innerHTML = `
            <div class="empty-members-message">
                No members added to this team yet.
            </div>
        `;
        return;
    }
    
    // Render each member
    members.forEach(member => {
        // Don't allow leaders to remove themselves
        const canRemove = isLeader && 
                         (member.email.toLowerCase() !== currentUser.email.toLowerCase() || 
                          members.filter(m => m.role === TEAM_ROLES.LEADER).length > 1);
        
        renderMemberItem(membersList, member, 'manage', isLeader, canRemove);
    });
}

/**
 * Render a member item in the list
 * @param {HTMLElement} container - Container to append to
 * @param {Object} member - Member data
 * @param {string} type - 'create' or 'manage'
 * @param {boolean} isLeader - Whether the current user is a leader
 * @param {boolean} canRemove - Whether this member can be removed
 */
function renderMemberItem(container, member, type, isLeader = false, canRemove = true) {
    const memberEl = document.createElement('div');
    memberEl.className = 'team-member';
    memberEl.dataset.memberId = member.id;
    
    // Get initial from name or email
    const initial = member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase();
    
    // Get the current user
    const currentUser = getCurrentUser();
    const isCurrentUser = member.email.toLowerCase() === currentUser.email.toLowerCase();
    
    // Determine if this is the only leader
    const isOnlyLeader = member.role === TEAM_ROLES.LEADER && type === 'manage';
    
    memberEl.innerHTML = `
        <div class="team-member-info">
            <div class="team-member-avatar">${initial}</div>
            <div class="team-member-details">
                <div class="team-member-name">
                    ${member.name || ''}
                    ${isCurrentUser ? '<span class="current-user-indicator">(You)</span>' : ''}
                    <span class="member-role-badge ${member.role}">${member.role}</span>
                </div>
                <div class="team-member-email">${member.email}</div>
            </div>
        </div>
        <div class="team-member-actions">
            ${isLeader && type === 'manage' && !isCurrentUser ? `
                <select class="role-select" data-member-id="${member.id}" title="Change role">
                    <option value="member" ${member.role === 'member' ? 'selected' : ''}>Member</option>
                    <option value="leader" ${member.role === 'leader' ? 'selected' : ''}>Leader</option>
                </select>
            ` : ''}
            ${canRemove ? `<button class="btn-remove-member" title="Remove member">✕</button>` : ''}
        </div>
    `;
    
    // Add role change handler
    const roleSelect = memberEl.querySelector('.role-select');
    if (roleSelect) {
        roleSelect.addEventListener('change', (e) => {
            const newRole = e.target.value;
            const memberId = parseInt(e.target.dataset.memberId, 10);
            const teamId = parseInt(document.getElementById('teamMembersModal').dataset.teamId, 10);
            
            // Dispatch event to change role
            document.dispatchEvent(new CustomEvent('team-member-role-change', {
                detail: { 
                    teamId,
                    memberId,
                    role: newRole
                },
                bubbles: true
            }));
        });
    }
    
    // Add remove button event
    const removeBtn = memberEl.querySelector('.btn-remove-member');
    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (type === 'create') {
                // Remove from temporary array
                window.tempTeamMembers = window.tempTeamMembers.filter(m => m.id !== member.id);
                
                // Remove from UI
                memberEl.remove();
            } else if (type === 'manage') {
                // Get team ID from modal
                const modal = document.getElementById('teamMembersModal');
                if (!modal) return;
                
                const teamId = parseInt(modal.dataset.teamId, 10);
                if (!teamId) return;
                
                // Confirm removal
                if (confirm(`Are you sure you want to remove ${member.name || member.email} from the team?`)) {
                    // Dispatch event to remove member
                    document.dispatchEvent(new CustomEvent('team-member-remove', {
                        detail: { 
                            teamId,
                            memberId: member.id
                        },
                        bubbles: true
                    }));
                }
            }
        });
    }
    
    container.appendChild(memberEl);
}

/**
 * Handle team member add event
 * @param {CustomEvent} event - The event object
 */
function handleTeamMemberAdd(event) {
    const { teamId, member } = event.detail;
    
    // Add member to team
    const success = addTeamMember(teamId, member);
    
    // Get team data and current user
    const team = getTeamById(teamId);
    const currentUser = getCurrentUser();
    const isLeader = isTeamLeader(team, currentUser.email);
    
    if (success) {
        // Show success message
        showToast('Member added successfully');
        
        // Refresh members list
        refreshTeamMembersList(teamId, isLeader);
    } else {
        // Show error
        const memberError = document.getElementById('manageMemberError');
        showMemberError(memberError, 'Failed to add member. They may already be in the team.');
    }
}

/**
 * Handle team member remove event
 * @param {CustomEvent} event - The event object
 */
function handleTeamMemberRemove(event) {
    const { teamId, memberId } = event.detail;
    
    // Get team data and current user
    const team = getTeamById(teamId);
    const currentUser = getCurrentUser();
    const isLeader = isTeamLeader(team, currentUser.email);
    
    // Check if user has permission to remove members
    if (!isLeader && !canManageMembers(team, currentUser.email)) {
        showToast('You do not have permission to remove members', 'error');
        return;
    }
    
    // Find the member to be removed
    const memberToRemove = team.members.find(m => m.id === memberId);
    
    // Don't allow removing the last leader
    if (memberToRemove?.role === TEAM_ROLES.LEADER) {
        const leaderCount = team.members.filter(m => m.role === TEAM_ROLES.LEADER).length;
        if (leaderCount <= 1) {
            showToast('Cannot remove the last team leader', 'error');
            return;
        }
    }
    
    // Remove member from team
    const success = removeTeamMember(teamId, memberId);
    
    if (success) {
        // Show success message
        showToast('Member removed successfully');
        
        // Refresh members list
        refreshTeamMembersList(teamId, isLeader);
    } else {
        // Show error
        showToast('Failed to remove member', 'error');
    }
}

/**
 * Handle team member role change event
 * @param {CustomEvent} event - The event object
 */
function handleTeamMemberRoleChange(event) {
    const { teamId, memberId, role } = event.detail;
    
    // Get team data and current user
    const team = getTeamById(teamId);
    const currentUser = getCurrentUser();
    const isLeader = isTeamLeader(team, currentUser.email);
    
    // Check if user has permission to change roles
    if (!isLeader) {
        showToast('You do not have permission to change member roles', 'error');
        return;
    }
    
    // Find the member to be updated
    const memberToUpdate = team.members.find(m => m.id === memberId);
    
    // If changing from leader to member, check if this is the last leader
    if (memberToUpdate?.role === TEAM_ROLES.LEADER && role === TEAM_ROLES.MEMBER) {
        const leaderCount = team.members.filter(m => m.role === TEAM_ROLES.LEADER).length;
        if (leaderCount <= 1) {
            showToast('Cannot demote the last team leader', 'error');
            
            // Reset the select element
            const modal = document.getElementById('teamMembersModal');
            if (modal) {
                const roleSelect = modal.querySelector(`.role-select[data-member-id="${memberId}"]`);
                if (roleSelect) {
                    roleSelect.value = TEAM_ROLES.LEADER;
                }
            }
            
            return;
        }
    }
    
    // Update member role
    const success = updateTeamMemberRole(teamId, memberId, role);
    
    if (success) {
        // Show success message
        showToast(`Member role updated to ${role}`);
        
        // Refresh members list
        refreshTeamMembersList(teamId, isLeader);
    } else {
        // Show error
        showToast('Failed to update member role', 'error');
    }
}

/**
 * Show error message for member input
 * @param {HTMLElement} errorElement - Error container element
 * @param {string} message - Error message
 */
function showMemberError(errorElement, message) {
    if (!errorElement) return;
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

/**
 * Clear error message for member input
 * @param {HTMLElement} errorElement - Error container element
 */
function clearMemberError(errorElement) {
    if (!errorElement) return;
    errorElement.textContent = '';
    errorElement.style.display = 'none';
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