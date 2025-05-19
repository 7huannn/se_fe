// controllers/group/teamController.js
import { loadTeams, saveTeams, generateTeamCode, getInitials, addTeam, getColorClass } from '../../models/group/team.js';
import { createTeamCardElement, createTeamsGridStructure, toggleTeamsContent } from '../../views/group/teamView.js';
import { hideModal } from '../../views/group/modalView.js';

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
            name: teamName,
            code: teamCode,
            description: teamDescription,
            privacy: privacy,
            color: color,
            initials: initials
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
    });
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
    
    // Thêm card vào grid
    teamsGrid.appendChild(teamCard);
    
    // Thêm sự kiện cho team card
    attachTeamCardEvents(teamCard);
}

/**
 * Gắn các sự kiện cho team card
 * @param {HTMLElement} teamCard - Team card element
 */
export function attachTeamCardEvents(teamCard) {
    // Xử lý các nút tùy chọn trên card
    const optionButton = teamCard.querySelector('.team-options-btn');
    if (optionButton) {
        optionButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Ngăn event bubble lên card
            console.log('Options button clicked');
            // Code để hiển thị menu tùy chọn
        });
    }
    
    // Xử lý các action buttons
    const actionButtons = teamCard.querySelectorAll('.team-action-btn');
    actionButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Ngăn event bubble lên card
            console.log('Action button clicked', index);
            
            // Nếu là nút chat (nút đầu tiên)
            if (index === 0) {
                // Chuyển đến trang chat.html
                window.location.href = "../html/chat.html";
            }
        });
    });
    
    // Xử lý khi click vào card
    teamCard.addEventListener('click', function() {
        console.log('Team card clicked');
        // Chuyển đến trang chat.html khi click vào team card
        window.location.href = "../html/chat.html";
    });
}