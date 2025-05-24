// models/group/team-permissions.js

/**
 * Team member roles and their permission levels
 */
export const TEAM_ROLES = {
    LEADER: 'leader',
    MEMBER: 'member'
};

/**
 * Check if the specified user has leader permissions in the team
 * @param {Object} team - Team object
 * @param {string} userEmail - Email of the user to check
 * @returns {boolean} True if the user is a leader
 */
export function isTeamLeader(team, userEmail) {
    if (!team || !userEmail) return false;
    
    // Get team members
    const members = team.members || [];
    
    // Find the member with the matching email
    const member = members.find(m => m.email.toLowerCase() === userEmail.toLowerCase());
    
    // Check if the member exists and has the leader role
    return member ? member.role === TEAM_ROLES.LEADER : false;
}

/**
 * Check if the user can create events in this team
 * @param {Object} team - Team object
 * @param {string} userEmail - Email of the user to check
 * @returns {boolean} True if the user can create events
 */
export function canCreateEvents(team, userEmail) {
    // Only leaders can create events
    return isTeamLeader(team, userEmail);
}

/**
 * Check if the user can manage members (add/remove) in this team
 * @param {Object} team - Team object
 * @param {string} userEmail - Email of the user to check
 * @returns {boolean} True if the user can manage members
 */
export function canManageMembers(team, userEmail) {
    // Only leaders can manage members
    return isTeamLeader(team, userEmail);
}

/**
 * Check if the user can delete this team
 * @param {Object} team - Team object
 * @param {string} userEmail - Email of the user to check
 * @returns {boolean} True if the user can delete the team
 */
export function canDeleteTeam(team, userEmail) {
    // Only leaders can delete teams
    return isTeamLeader(team, userEmail);
}

/**
 * Check if the user can edit this team
 * @param {Object} team - Team object
 * @param {string} userEmail - Email of the user to check
 * @returns {boolean} True if the user can edit the team
 */
export function canEditTeam(team, userEmail) {
    // Only leaders can edit team details
    return isTeamLeader(team, userEmail);
}

/**
 * Get current user information
 * @returns {Object} User information with email and name
 */
export function getCurrentUser() {
    const email = localStorage.getItem('email') || '';
    const username = localStorage.getItem('username') || 'Current User';
    
    return {
        email,
        name: username
    };
}