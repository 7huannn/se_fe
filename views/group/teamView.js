// views/group/teamView.js - Updated with new team UI functions

/**
 * Tạo DOM element cho team card with members button
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
    
    teamCard.innerHTML = `
        <div class="team-card-header">
            <div class="team-icon ${teamColorClass}">${team.initials}</div>
            <div class="team-info">
                <div class="team-name">${team.name}</div>
                <div class="team-code">${team.code}</div>
                <div class="team-member-count">${memberCount} member${memberCount !== 1 ? 's' : ''}</div>
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
 * @returns {HTMLElement} Options menu element
 */
export function createTeamOptionsMenu(teamId) {
    const menu = document.createElement('div');
    menu.className = 'team-options-menu';
    menu.dataset.teamOptionsMenu = teamId;
    menu.innerHTML = `
        <div class="team-option" data-action="members" data-team-id="${teamId}">
            <span class="team-option-icon">👥</span>
            <span class="team-option-text">Manage Members</span>
        </div>
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