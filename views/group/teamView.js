/**
 * Tạo DOM element cho team card with members button and roles
 * @param {Object} team - Thông tin team
 * @param {string} teamColorClass - Class màu cho team
 * @returns {HTMLElement} DOM element cho team card
 */
export function createTeamCardElement(team, teamColorClass) {
    const teamCard = document.createElement('div');
    teamCard.className = 'team-card';
    teamCard.dataset.teamId = team.id;
    
    // Get member count
    const memberCount = team.members ? team.members.length : 0;
    
    // Count leaders
    const leaderCount = team.members ? team.members.filter(m => m.role === 'leader').length : 0;
    
    teamCard.innerHTML = `
        <div class="team-card-header">
            <div class="team-icon ${teamColorClass}">${team.initials}</div>
            <div class="team-info">
                <div class="team-name">${team.name}</div>
                <div class="team-code">${team.code}</div>
                <div class="team-member-count">${memberCount} member${memberCount !== 1 ? 's' : ''} 
                    ${leaderCount > 0 ? `<span class="team-leader-count">(${leaderCount} leader${leaderCount !== 1 ? 's' : ''})</span>` : ''}
                </div>
            </div>
            <div class="team-options">
                <button class="team-options-btn" title="Team Options">⋯</button>
            </div>
        </div>
        <div class="team-action-buttons">
            <button class="team-action-btn" title="Calendar">
                <span class="team-action-icon">🗓️</span>
            </button>
            <button class="team-action-btn members-btn" title="Manage Members">
                <span class="team-action-icon">👥</span>
            </button>
            <button class="team-action-btn privacy-toggle" title="${team.privacy === 'private' ? 'Change to Public' : 'Change to Private'}">
                <span class="team-action-icon">${team.privacy === 'private' ? '🔒' : '🌐'}</span>
            </button>
            <button class="team-action-btn" title="Edit Team">
                <span class="team-action-icon">✏️</span>
            </button>
        </div>
    `;
    
    // Add leader badge if current user is a leader
    const currentEmail = localStorage.getItem('email');
    if (currentEmail && team.members) {
        const isLeader = team.members.some(m => 
            m.email.toLowerCase() === currentEmail.toLowerCase() && m.role === 'leader'
        );
        
        if (isLeader) {
            const badge = document.createElement('div');
            badge.className = 'team-leader-badge';
            badge.textContent = 'Leader';
            badge.title = 'You are a leader of this team';
            teamCard.querySelector('.team-card-header').appendChild(badge);
        }
    }
    
    return teamCard;
}

/**
 * Tạo cấu trúc grid cho teams
 * @param {HTMLElement} teamsSection - Element chứa section teams
 * @returns {Object} Các elements đã tạo hoặc null nếu không tạo được
 */
export function createTeamsGridStructure(teamsSection) {
    if (!teamsSection) return null;

    // Kiểm tra xem đã có item-row chưa
    let itemRow = teamsSection.querySelector('.item-row');
    if (!itemRow) {
        itemRow = document.createElement('div');
        itemRow.className = 'item-row';
        itemRow.id = 'teamsHeader';
        itemRow.innerHTML = `
            <span class="chevron" id="teamsChevron">▶</span>
            <span>Teams</span>
        `;
        teamsSection.appendChild(itemRow);
    }

    // Tạo content container
    const teamsContent = document.createElement('div');
    teamsContent.className = 'teams-content';
    teamsContent.id = 'teamsContent';
    teamsContent.style.display = 'block'; // Hiển thị ngay khi tạo mới

    // Tạo grid container
    const teamsGrid = document.createElement('div');
    teamsGrid.className = 'teams-grid';

    teamsContent.appendChild(teamsGrid);
    teamsSection.appendChild(teamsContent);

    return {
        itemRow,
        teamsContent,
        teamsGrid
    };
}

/**
 * Toggle hiển thị nội dung teams
 * @param {HTMLElement} teamsContent - Element chứa nội dung teams
 * @param {HTMLElement} teamsChevron - Element chevron
 * @param {boolean} show - true để hiển thị, false để ẩn
 */
export function toggleTeamsContent(teamsContent, teamsChevron, show) {
    if (!teamsContent || !teamsChevron) return;

    if (show) {
        teamsContent.style.display = 'block';
        teamsChevron.classList.add('expanded');
    } else {
        teamsContent.style.display = 'none';
        teamsChevron.classList.remove('expanded');
    }
}

/**
 * Create DOM element for team options menu
 * @param {number} teamId - ID of the team
 * @param {boolean} isLeader - Whether the current user is a leader
 * @returns {HTMLElement} Options menu element
 */
export function createTeamOptionsMenu(teamId, isLeader = false) {
    const menu = document.createElement('div');
    menu.className = 'team-options-menu';
    menu.dataset.teamOptionsMenu = teamId;
    
    // Base options available to all members
    let menuHTML = `
        <div class="team-option" data-action="members" data-team-id="${teamId}">
            <span class="team-option-icon">👥</span>
            <span class="team-option-text">View Members</span>
        </div>
    `;
    
    // Add leader-only options
    if (isLeader) {
        menuHTML += `
            <div class="team-option" data-action="edit" data-team-id="${teamId}">
                <span class="team-option-icon">✏️</span>
                <span class="team-option-text">Edit Team</span>
            </div>
            <div class="team-option" data-action="privacy" data-team-id="${teamId}">
                <span class="team-option-icon">🔒</span>
                <span class="team-option-text">Change Privacy</span>
            </div>
            <div class="team-option" data-action="delete" data-team-id="${teamId}">
                <span class="team-option-icon">🗑️</span>
                <span class="team-option-text">Delete Team</span>
            </div>
        `;
    }
    
    menu.innerHTML = menuHTML;
    return menu;
}

/**
 * Toggle display of team options menu
 * @param {HTMLElement} menu - Options menu element
 * @param {boolean} show - Whether to show or hide
 */
export function toggleTeamOptionsMenu(menu, show) {
    if (!menu) return;

    if (show) {
        menu.classList.add('show');
    } else {
        menu.classList.remove('show');
    }
}

/**
 * Add privacy indicator to team card
 * @param {HTMLElement} teamCard - Team card element
 * @param {string} privacy - 'public' or 'private'
 */
export function addPrivacyIndicator(teamCard, privacy) {
    const teamInfo = teamCard.querySelector('.team-info');
    if (!teamInfo) return;

    // Check if privacy indicator already exists
    let indicator = teamInfo.querySelector('.privacy-indicator');

    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'privacy-indicator';
        teamInfo.appendChild(indicator);
    }

    indicator.textContent = privacy === 'private' ? '🔒' : '🌐';
    indicator.setAttribute('title', privacy === 'private' ? 'Private Team' : 'Public Team');
}

/**
 * Add CSS styles for role indicators
 */
export function addTeamRoleStyles() {
    if (document.getElementById('team-role-styles')) return;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'team-role-styles';
    styleEl.textContent = `
        .team-leader-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: #ff8800;
            color: white;
            font-size: 11px;
            font-weight: bold;
            padding: 2px 8px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            z-index: 1;
        }
        
        .team-leader-count {
            font-size: 0.9em;
            color: #666;
            margin-left: 4px;
        }
        
        .member-role-badge {
            background-color: #ddd;
            color: #333;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            margin-left: 8px;
        }
        
        .member-role-badge.leader {
            background-color: #ff8800;
            color: white;
        }
        
        .member-role-badge.member {
            background-color: #e0e0e0;
            color: #555;
        }
        
        .role-selector {
            margin-top: 8px;
            display: flex;
            align-items: center;
        }
        
        .role-selector label {
            margin-right: 10px;
            font-size: 14px;
            color: #555;
        }
        
        .role-selector select {
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #ccc;
        }
        
        .leader-badge {
            background-color: #ff8800;
            color: white;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-top: 5px;
            display: inline-block;
        }
        
        .current-user-indicator {
            font-style: italic;
            color: #666;
            margin-left: 4px;
        }
    `;
    
    document.head.appendChild(styleEl);
}