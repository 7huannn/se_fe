// models/group/team.js

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
 */
export function addTeam(teamData) {
    const teams = loadTeams();
    teams.push(teamData);
    saveTeams(teams);
    return teams;
}

/**
 * Map màu từ input sang CSS class
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