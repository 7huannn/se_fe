// models/group/team.js - Hybrid version: Kết hợp backend integration với code hiện tại

import { groupsService } from '../../services/groupsService.js';
import { authService } from '../../services/authService.js';
import { groupServiceWrapper } from '../../services/groupServiceWrapper.js';

/**
 * Fetch user's groups from backend
 * @returns {Promise<{success: boolean, groups: Array, message?: string}>}
 */
export async function getUserGroupsFromBackend() {
    try {
        if (!authService.isUserAuthenticated()) {
            return { success: false, groups: [], message: 'User not authenticated' };
        }

        const result = await groupServiceWrapper.getUserGroups();
        if (result && result.success) {
            return { success: true, groups: result.groups };
        }

        return { success: false, groups: [], message: result.message || 'Failed to get groups' };
    } catch (error) {
        console.error('Error fetching user groups from backend:', error);
        return { success: false, groups: [], message: error.message || 'Failed to get groups' };
    }
}
/**
 * Lưu teams vào localStorage
 * @param {Array} teams - Mảng chứa thông tin các team
 */
export function saveTeams(teams) {
    localStorage.setItem('schedigo_teams', JSON.stringify(teams));
}

/**
 * Lấy danh sách teams từ localStorage (với fallback)
 * @returns {Promise<Array>} Mảng chứa thông tin các team
 */
export async function loadTeams() {
    try {
        // TODO: Khi backend có endpoint getUserGroups, uncomment đoạn này:
        
        if (authService.isUserAuthenticated()) {
            const backendResult = await getUserGroupsFromBackend();
            if (backendResult.success && backendResult.groups.length > 0) {
                // Sync with localStorage
                saveTeams(backendResult.groups);
                return backendResult.groups;
            }
        }
        

        // Fallback to localStorage
        const teamsData = localStorage.getItem('schedigo_teams');
        return teamsData ? JSON.parse(teamsData) : [];
    } catch (error) {
        console.error('Error loading teams:', error);
        // Fallback to localStorage if backend fails
        const teamsData = localStorage.getItem('schedigo_teams');
        return teamsData ? JSON.parse(teamsData) : [];
    }
}

/**
 * Tạo team code từ tên team
 * @param {string} teamName - Tên team
 * @returns {string} Team code
 */
export function generateTeamCode(teamName) {
    const words = teamName.split(' ');
    let code = '';
    
    if (words.length > 1) {
        // Nếu có nhiều từ, lấy chữ cái đầu của mỗi từ
        words.forEach(word => {
            if (word.length > 0) {
                code += word[0].toUpperCase();
            }
        });
    } else {
        // Nếu chỉ có một từ, lấy 4 ký tự đầu
        code = teamName.substring(0, 4).toUpperCase();
    }
    
    // Thêm số ngẫu nhiên vào cuối
    code += Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return code;
}

/**
 * Tạo initials từ tên
 * @param {string} name - Tên đầy đủ
 * @returns {string} Initials
 */
export function getInitials(name) {
    const words = name.split(' ');
    if (words.length > 1) {
        return (words[0][0] + words[1][0]).toUpperCase();
    } else {
        return name.substring(0, 2).toUpperCase();
    }
}
/**
 * Create team on backend
 * @param {Object} teamData - Frontend team data
 * @returns {Promise<Object>} Backend result
 */
export async function createTeamOnBackend(teamData) {
    try {
        const backendData = {
            name: teamData.name,
            description: teamData.description || ''
        };
        
        const result = await groupsService.createGroup(backendData);
        
        if (result.success) {
            return {
                success: true,
                group: {
                    id: result.group.id,
                    invite_code: result.group.invite_code,
                    creator_id: result.group.creator_id,
                    ...result.group
                }
            };
        }
        
        return result;
    } catch (error) {
        console.error('Backend team creation failed:', error);
        return {
            success: false,
            message: error.message
        };
    }
}
/**
 * Thêm team mới - với backend integration
 * @param {Object} teamData - Thông tin team mới
 * @returns {Promise<Object>} Team data sau khi thêm
 */
export async function addTeam(teamData) {
    try {
        // Ensure team has an ID if not provided
        if (!teamData.id) {
            teamData.id = Date.now();
        }
        
        // Try to create on backend first
        if (authService.isUserAuthenticated()) {
            const backendResult = await createTeamOnBackend(teamData);
            if (backendResult.success) {
                // Merge backend data with frontend data
                const mergedTeam = {
                    ...teamData,
                    backendId: backendResult.group.id,
                    inviteCode: backendResult.group.invite_code,
                    creator_id: backendResult.group.creator_id,
                    synced: true
                };
                
                // Save to localStorage
                const teams = await loadTeams();
                teams.push(mergedTeam);
                saveTeams(teams);
                
                return mergedTeam;
            }
        }
        
        // Fallback to localStorage only
        console.warn('Backend creation failed or user not authenticated, saving locally only');
        const teams = await loadTeams();
        teams.push(teamData);
        saveTeams(teams);
        
        return teamData;
    } catch (error) {
        console.error('Error adding team:', error);
        
        // Final fallback - save to localStorage
        const teams = await loadTeams();
        teams.push(teamData);
        saveTeams(teams);
        
        return teamData;
    }
}



/**
 * Join team by invite code - NEW FUNCTION
 * @param {string} inviteCode - Invite code
 * @returns {Promise<Object>} Result
 */
export async function joinTeamByCode(inviteCode) {
    try {
        if (!authService.isUserAuthenticated()) {
            return {
                success: false,
                message: 'Authentication required'
            };
        }
        
        const result = await groupsService.joinGroupByInviteCode(inviteCode);
        
        if (result.success) {
            // Refresh teams list
            await refreshTeamsFromBackend();
            
            return {
                success: true,
                message: 'Successfully joined the team!'
            };
        }
        
        return result;
    } catch (error) {
        console.error('Error joining team:', error);
        return {
            success: false,
            message: error.message || 'Failed to join team'
        };
    }
}

/**
 * Refresh teams from backend (placeholder)
 * @returns {Promise<Array>} Updated teams
 */
async function refreshTeamsFromBackend() {
    // TODO: Implement when backend has getUserGroups endpoint
    return await loadTeams();
}

/**
 * Get team by ID
 * @param {number} teamId - ID of the team to retrieve
 * @returns {Promise<Object|null>} Team object or null if not found
 */
export async function getTeamById(teamId) {
    const teams = await loadTeams();
    return teams.find(team => team.id === teamId) || null;
}

/**
 * Update an existing team - với backend sync
 * @param {number} teamId - ID of the team to update
 * @param {Object} updateData - Data to update
 * @returns {Promise<boolean>} Success status
 */
export async function updateTeam(teamId, updateData) {
    try {
        const teams = await loadTeams();
        const teamIndex = teams.findIndex(team => team.id === teamId);
        
        if (teamIndex === -1) return false;
        
        const currentTeam = teams[teamIndex];
        
        // Update team with new data
        teams[teamIndex] = {
            ...currentTeam,
            ...updateData,
            updatedAt: new Date().toISOString()
        };
        
        // Try to sync with backend if team has backendId
        if (currentTeam.backendId && authService.isUserAuthenticated()) {
            try {
                // TODO: Implement when backend has update group endpoint
                await groupsService.updateGroup(currentTeam.backendId, updateData);
                console.log('Backend sync for team update not yet implemented');
            } catch (error) {
                console.warn('Backend sync failed for team update:', error);
            }
        }
        
        saveTeams(teams);
        return true;
    } catch (error) {
        console.error('Error updating team:', error);
        return false;
    }
}

/**
 * Delete a team - với backend sync
 * @param {number} teamId - ID of the team to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteTeam(teamId) {
    try {
        const teams = await loadTeams();
        const teamToDelete = teams.find(team => team.id === teamId);
        
        if (!teamToDelete) return false;
        
        // Try to delete from backend first
        if (teamToDelete.backendId && authService.isUserAuthenticated()) {
            try {
                const result = await groupsService.deleteGroup(teamToDelete.backendId);
                if (!result.success && result.status !== 404) {
                    console.warn('Backend deletion failed:', result.message);
                }
            } catch (error) {
                console.warn('Backend deletion error:', error);
            }
        }
        
        // Remove from localStorage
        const filteredTeams = teams.filter(team => team.id !== teamId);
        
        if (filteredTeams.length === teams.length) {
            return false; // No team was removed
        }
        
        saveTeams(filteredTeams);
        return true;
    } catch (error) {
        console.error('Error deleting team:', error);
        return false;
    }
}

/**
 * Update team privacy setting
 * @param {number} teamId - ID of the team to update
 * @param {string} privacy - 'public' or 'private'
 * @returns {Promise<boolean>} Success status
 */
export async function updateTeamPrivacy(teamId, privacy) {
    return await updateTeam(teamId, { privacy });
}

/**
 * Map màu từ input sang CSS class
 * @param {string} colorCode - Code của màu
 * @returns {string} CSS class tương ứng
 */
export function getColorClass(colorCode) {
    const colorMap = {
        'blue': 'team-blue',
        'orange': 'team-orange',
        'green': 'team-green',
        'purple': 'team-purple',
        'red': 'team-pink'
    };
    
    return colorMap[colorCode] || 'team-blue';
}

/**
 * Add a member to a team - với backend sync
 * @param {number} teamId - ID of the team
 * @param {Object} memberData - Member data (email, name, etc.)
 * @returns {Promise<boolean>} Success status
 */
export async function addTeamMember(teamId, memberData) {
    try {
        if (!teamId || !memberData || !memberData.email) return false;
        
        // Validate email
        if (!isValidEmail(memberData.email)) return false;
        
        const teams = await loadTeams();
        const teamIndex = teams.findIndex(team => team.id === teamId);
        
        if (teamIndex === -1) return false;
        
        // Initialize members array if it doesn't exist
        if (!teams[teamIndex].members) {
            teams[teamIndex].members = [];
        }
        
        // Check if member already exists
        const existingMember = teams[teamIndex].members.find(
            member => member.email.toLowerCase() === memberData.email.toLowerCase()
        );
        
        if (existingMember) return false;
        
        // Add new member
        const newMember = {
            id: Date.now(), // Generate unique ID
            email: memberData.email,
            name: memberData.name || getNameFromEmail(memberData.email),
            avatar: memberData.avatar || null,
            role: memberData.role || 'member',
            addedAt: new Date().toISOString()
        };
        
        teams[teamIndex].members.push(newMember);
        
        // Try to sync with backend
        const currentTeam = teams[teamIndex];
        if (currentTeam.backendId && authService.isUserAuthenticated()) {
            try {
                // TODO: Implement when we have user lookup by email
                console.log('Backend member sync not yet implemented - need user ID lookup');
                // await groupsService.inviteMember(currentTeam.backendId, userId);
            } catch (error) {
                console.warn('Backend member sync failed:', error);
            }
        }
        
        saveTeams(teams);
        return true;
    } catch (error) {
        console.error('Error adding team member:', error);
        return false;
    }
}

/**
 * Remove a member from a team - với backend sync
 * @param {number} teamId - ID of the team
 * @param {number} memberId - ID of the member to remove
 * @returns {Promise<boolean>} Success status
 */
export async function removeTeamMember(teamId, memberId) {
    try {
        const teams = await loadTeams();
        const teamIndex = teams.findIndex(team => team.id === teamId);
        
        if (teamIndex === -1) return false;
        if (!teams[teamIndex].members) return false;
        
        const memberIndex = teams[teamIndex].members.findIndex(member => member.id === memberId);
        if (memberIndex === -1) return false;
        
        const member = teams[teamIndex].members[memberIndex];
        const currentTeam = teams[teamIndex];
        
        // Try to sync with backend
        if (currentTeam.backendId && member.backendId && authService.isUserAuthenticated()) {
            try {
                const result = await groupsService.removeMember(currentTeam.backendId, member.backendId);
                if (!result.success) {
                    console.warn('Backend member removal failed:', result.message);
                }
            } catch (error) {
                console.warn('Backend member removal error:', error);
            }
        }
        
        // Remove from local storage
        teams[teamIndex].members.splice(memberIndex, 1);
        saveTeams(teams);
        
        return true;
    } catch (error) {
        console.error('Error removing team member:', error);
        return false;
    }
}

/**
 * Update a team member's role - với backend sync
 * @param {number} teamId - ID of the team
 * @param {number} memberId - ID of the member
 * @param {string} role - New role for the member
 * @returns {Promise<boolean>} Success status
 */
export async function updateTeamMemberRole(teamId, memberId, role) {
    try {
        const teams = await loadTeams();
        const teamIndex = teams.findIndex(team => team.id === teamId);
        
        if (teamIndex === -1) return false;
        if (!teams[teamIndex].members) return false;
        
        const memberIndex = teams[teamIndex].members.findIndex(member => member.id === memberId);
        if (memberIndex === -1) return false;
        
        const member = teams[teamIndex].members[memberIndex];
        const currentTeam = teams[teamIndex];
        
        // Map frontend role to backend role
        const backendRole = mapFrontendRoleToBackend(role);
        
        // Try to sync with backend
        if (currentTeam.backendId && member.backendId && authService.isUserAuthenticated()) {
            try {
                const result = await groupsService.updateMemberRole(currentTeam.backendId, member.backendId, backendRole);
                if (!result.success) {
                    console.warn('Backend role update failed:', result.message);
                }
            } catch (error) {
                console.warn('Backend role update error:', error);
            }
        }
        
        // Update member role in local storage
        teams[teamIndex].members[memberIndex].role = role;
        teams[teamIndex].members[memberIndex].backendRole = backendRole;
        saveTeams(teams);
        
        return true;
    } catch (error) {
        console.error('Error updating member role:', error);
        return false;
    }
}

/**
 * Map frontend role to backend role
 * @param {string} frontendRole - Frontend role (leader/member)
 * @returns {string} Backend role (owner/editor/viewer)
 */
function mapFrontendRoleToBackend(frontendRole) {
    const roleMap = {
        'leader': 'editor', // or 'owner' depending on context
        'member': 'viewer'
    };
    
    return roleMap[frontendRole] || 'viewer';
}

/**
 * Get all members of a team
 * @param {number} teamId - ID of the team
 * @returns {Promise<Array|null>} Array of team members or null if team not found
 */
export async function getTeamMembers(teamId) {
    const team = await getTeamById(teamId);
    if (!team) return null;
    
    return team.members || [];
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Extract a display name from an email address
 * @param {string} email - Email address
 * @returns {string} Display name
 */
export function getNameFromEmail(email) {
    if (!email) return '';
    
    // Extract the part before @ and capitalize the first letter of each word
    const namePart = email.split('@')[0];
    
    return namePart
        .split(/[._-]/) // Split by common email name separators
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
}