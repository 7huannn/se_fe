// controllers/group/membersController.js

import { 
    addTeamMember, 
    removeTeamMember, 
    getTeamMembers, 
    getTeamById, 
    isValidEmail,
    getNameFromEmail
} from '../../models/group/team.js';

import { showModal, hideModal } from '../../views/group/modalView.js';

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
}

/**
 * Initialize the UI for adding members during team creation
 */
function initCreateTeamMembersUI() {
    const addMemberBtn = document.getElementById('addMemberBtn');
    const memberEmailInput = document.getElementById('memberEmail');
    const memberError = document.getElementById('memberError');
    const membersList = document.getElementById('teamMembersList');
    
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
        
        // Add to temporary array
        const member = {
            id: Date.now(),
            email: email,
            name: getNameFromEmail(email)
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
        
        // Dispatch event to add member
        document.dispatchEvent(new CustomEvent('team-member-add', {
            detail: { 
                teamId,
                member: {
                    email: email,
                    name: getNameFromEmail(email)
                }
            },
            bubbles: true
        }));
        
        // Clear input and error
        memberEmailInput.value = '';
        clearMemberError(memberError);
        
        // Refresh members list
        refreshTeamMembersList(teamId);
        
        // Focus back on input
        memberEmailInput.focus();
    }
}

/**
 * Open the team members modal for a specific team
 * @param {number} teamId - ID of the team
 */
export function openTeamMembersModal(teamId) {
    const modal = document.getElementById('teamMembersModal');
    if (!modal) return;
    
    // Set team ID in modal dataset
    modal.dataset.teamId = teamId;
    
    // Get team info
    const team = getTeamById(teamId);
    if (!team) {
        console.error('Team not found:', teamId);
        return;
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
            </div>
        `;
    }
    
    // Refresh members list
    refreshTeamMembersList(teamId);
    
    // Show modal
    showModal(modal);
}

/**
 * Refresh the team members list in the modal
 * @param {number} teamId - ID of the team
 */
function refreshTeamMembersList(teamId) {
    const membersList = document.getElementById('manageMembersList');
    if (!membersList) return;
    
    // Clear current list
    membersList.innerHTML = '';
    
    // Get team members
    const members = getTeamMembers(teamId);
    
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
        renderMemberItem(membersList, member, 'manage');
    });
}

/**
 * Render a member item in the list
 * @param {HTMLElement} container - Container to append to
 * @param {Object} member - Member data
 * @param {string} type - 'create' or 'manage'
 */
function renderMemberItem(container, member, type) {
    const memberEl = document.createElement('div');
    memberEl.className = 'team-member';
    memberEl.dataset.memberId = member.id;
    
    // Get initial from name or email
    const initial = member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase();
    
    memberEl.innerHTML = `
        <div class="team-member-info">
            <div class="team-member-avatar">${initial}</div>
            <div class="team-member-details">
                <div class="team-member-name">${member.name || ''}</div>
                <div class="team-member-email">${member.email}</div>
            </div>
        </div>
        <div class="team-member-actions">
            <button class="btn-remove-member" title="Remove member">✕</button>
        </div>
    `;
    
    // Add button event
    const removeBtn = memberEl.querySelector('.btn-remove-member');
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
            
            // Dispatch event to remove member
            document.dispatchEvent(new CustomEvent('team-member-remove', {
                detail: { 
                    teamId,
                    memberId: member.id
                },
                bubbles: true
            }));
        }
    });
    
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
    
    if (success) {
        // Show success message
        showToast('Member added successfully');
        
        // Refresh members list
        refreshTeamMembersList(teamId);
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
    
    // Remove member from team
    const success = removeTeamMember(teamId, memberId);
    
    if (success) {
        // Show success message
        showToast('Member removed successfully');
        
        // Refresh members list
        refreshTeamMembersList(teamId);
    } else {
        // Show error
        showToast('Failed to remove member', 'error');
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