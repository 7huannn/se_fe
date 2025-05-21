// models/group/team.js - Updated with team management features

/**
 * Lưu teams vào localStorage
 * @param {Array} teams - Mảng chứa thông tin các team
 */
export function saveTeams(teams) {
    localStorage.setItem('schedigo_teams', JSON.stringify(teams));
}

/**
 * Lấy danh sách teams từ localStorage
 * @returns {Array} Mảng chứa thông tin các team
 */
export function loadTeams() {
    const teamsData = localStorage.getItem('schedigo_teams');
    return teamsData ? JSON.parse(teamsData) : [];
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
 * Thêm team mới vào danh sách teams
 * @param {Object} teamData - Thông tin team mới
 * @returns {Array} Danh sách teams sau khi thêm
 */
export function addTeam(teamData) {
    const teams = loadTeams();
    
    // Ensure team has an ID if not provided
    if (!teamData.id) {
        teamData.id = Date.now();
    }
    
    teams.push(teamData);
    saveTeams(teams);
    return teams;
}

/**
 * Get team by ID
 * @param {number} teamId - ID of the team to retrieve
 * @returns {Object|null} Team object or null if not found
 */
export function getTeamById(teamId) {
    const teams = loadTeams();
    return teams.find(team => team.id === teamId) || null;
}

/**
 * Update an existing team
 * @param {number} teamId - ID of the team to update
 * @param {Object} updateData - Data to update
 * @returns {boolean} Success status
 */
export function updateTeam(teamId, updateData) {
    const teams = loadTeams();
    const teamIndex = teams.findIndex(team => team.id === teamId);
    
    if (teamIndex === -1) return false;
    
    // Update team with new data
    teams[teamIndex] = {
        ...teams[teamIndex],
        ...updateData
    };
    
    saveTeams(teams);
    return true;
}

/**
 * Delete a team
 * @param {number} teamId - ID of the team to delete
 * @returns {boolean} Success status
 */
export function deleteTeam(teamId) {
    const teams = loadTeams();
    const filteredTeams = teams.filter(team => team.id !== teamId);
    
    if (filteredTeams.length === teams.length) {
        // No team was removed
        return false;
    }
    
    saveTeams(filteredTeams);
    return true;
}

/**
 * Update team privacy setting
 * @param {number} teamId - ID of the team to update
 * @param {string} privacy - 'public' or 'private'
 * @returns {boolean} Success status
 */
export function updateTeamPrivacy(teamId, privacy) {
    return updateTeam(teamId, { privacy });
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

// Backend Integration Functions (Commented out until backend is ready)

/*
const API_URL = 'https://se_backend.hrzn.run/api';

/**
 * Get teams from backend API
 * @returns {Promise<Array>} Teams array
 */
/*
export async function fetchTeamsFromAPI() {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        
        const response = await fetch(`${API_URL}/teams`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch teams');
        }
        
        const data = await response.json();
        return data.teams || [];
    } catch (error) {
        console.error('Error fetching teams:', error);
        // Fallback to localStorage
        return loadTeams();
    }
}

/**
 * Create team via API
 * @param {Object} teamData - Team data
 * @returns {Promise<Object>} Created team
 */
/*
export async function createTeamAPI(teamData) {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        
        const response = await fetch(`${API_URL}/teams`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(teamData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create team');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating team:', error);
        // Fallback to localStorage
        const teams = loadTeams();
        teams.push(teamData);
        saveTeams(teams);
        return teamData;
    }
}
*/

// Updated models/group/team.js with member management functions

/**
 * Add a member to a team
 * @param {number} teamId - ID of the team
 * @param {Object} memberData - Member data (email, name, etc.)
 * @returns {boolean} Success status
 */
export function addTeamMember(teamId, memberData) {
    if (!teamId || !memberData || !memberData.email) return false;
    
    // Validate email
    if (!isValidEmail(memberData.email)) return false;
    
    const teams = loadTeams();
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
    saveTeams(teams);
    
    return true;
}

/**
 * Remove a member from a team
 * @param {number} teamId - ID of the team
 * @param {number} memberId - ID of the member to remove
 * @returns {boolean} Success status
 */
export function removeTeamMember(teamId, memberId) {
    const teams = loadTeams();
    const teamIndex = teams.findIndex(team => team.id === teamId);
    
    if (teamIndex === -1) return false;
    if (!teams[teamIndex].members) return false;
    
    const memberIndex = teams[teamIndex].members.findIndex(member => member.id === memberId);
    
    if (memberIndex === -1) return false;
    
    // Remove member
    teams[teamIndex].members.splice(memberIndex, 1);
    saveTeams(teams);
    
    return true;
}

/**
 * Get all members of a team
 * @param {number} teamId - ID of the team
 * @returns {Array|null} Array of team members or null if team not found
 */
export function getTeamMembers(teamId) {
    const team = getTeamById(teamId);
    if (!team) return null;
    
    return team.members || [];
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export function isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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