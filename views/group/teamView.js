// views/group/teamView.js

/**
 * Tạo DOM element cho team card
 * @param {Object} team - Thông tin team
 * @param {string} teamColorClass - Class màu cho team
 * @returns {HTMLElement} DOM element cho team card
 */
export function createTeamCardElement(team, teamColorClass) {
    const teamCard = document.createElement('div');
    teamCard.className = 'team-card';
    teamCard.innerHTML = `
        <div class="team-card-header">
            <div class="team-icon ${teamColorClass}">${team.initials}</div>
            <div class="team-info">
                <div class="team-name">${team.name}</div>
                <div class="team-code">${team.code}</div>
            </div>
            <div class="team-options">
                <button class="team-options-btn">⋯</button>
            </div>
        </div>
        <div class="team-action-buttons">
            <button class="team-action-btn">
                <span class="team-action-icon">📄</span>
            </button>
            <button class="team-action-btn">
                <span class="team-action-icon">🔒</span>
            </button>
            <button class="team-action-btn">
                <span class="team-action-icon">✏️</span>
            </button>
        </div>
    `;
    
    return teamCard;
}

/**
 * Tạo cấu trúc grid cho teams
 * @param {HTMLElement} teamsSection - Element chứa section teams
 * @returns {Object} Các elements đã tạo
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