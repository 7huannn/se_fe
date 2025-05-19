// controllers/group.js
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo view
    initTeamDropdown();
    
    // Khởi tạo các modal
    initModals();
    
    // Khởi tạo danh sách teams
    initTeamsList();
    
    // Khởi tạo form tạo team
    initCreateTeamForm();
    
    // Khởi tạo UI chat
    initChatUI();
    
    // Khởi tạo điều hướng sidebar - sử dụng controller chia sẻ
    import("../controllers/sidebar-navigation.js").then(navModule => {
        navModule.initSidebarNav();
    });
    
    // Load saved teams từ localStorage
    loadSavedTeams();
});

// Hàm lưu teams vào localStorage
function saveTeams(teams) {
    localStorage.setItem('schedigo_teams', JSON.stringify(teams));
}

// Hàm lấy teams từ localStorage
function loadTeams() {
    const teamsData = localStorage.getItem('schedigo_teams');
    return teamsData ? JSON.parse(teamsData) : [];
}

// Hàm load teams từ localStorage và hiển thị lên UI
function loadSavedTeams() {
    const teams = loadTeams();
    teams.forEach(team => {
        // Lấy các dữ liệu từ team object
        const teamName = team.name;
        const teamCode = team.code;
        const colorClass = team.color;
        const colorMap = {
            'blue': 'team-blue',
            'orange': 'team-orange',
            'green': 'team-green',
            'purple': 'team-purple',
            'red': 'team-pink'
        };
        
        const teamColorClass = colorMap[colorClass] || 'team-blue';
        const initials = getInitials(teamName);
        
        const teamsGrid = document.querySelector('.teams-grid');
        if (!teamsGrid) {
            createTeamsGridStructure();
            return loadSavedTeams(); // Gọi lại hàm sau khi đã tạo cấu trúc
        }
        
        // Tạo DOM element cho team card
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        teamCard.innerHTML = `
            <div class="team-card-header">
                <div class="team-icon ${teamColorClass}">${initials}</div>
                <div class="team-info">
                    <div class="team-name">${teamName}</div>
                    <div class="team-code">${teamCode}</div>
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
        
        // Thêm card vào grid
        teamsGrid.appendChild(teamCard);
        
        // Thêm sự kiện cho team card
        attachTeamCardEvents(teamCard);
    });
}

function initTeamDropdown() {
    const dropdownBtn = document.getElementById('teamDropdownBtn');
    const dropdown = document.getElementById('teamDropdown');
    
    if (!dropdownBtn || !dropdown) return;
    
    // Toggle dropdown khi nhấn nút
    dropdownBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    
    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', function() {
        dropdown.classList.remove('show');
    });
    
    // Ngăn không đóng dropdown khi click vào dropdown menu
    dropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

function initModals() {
    const modalOverlay = document.getElementById('modalOverlay');
    const createTeamModal = document.getElementById('createTeamModal');
    const joinTeamModal = document.getElementById('joinTeamModal');
    
    // Mở modal Create Team khi click vào Create team
    document.getElementById('createTeamBtn').addEventListener('click', function() {
        document.getElementById('teamDropdown').classList.remove('show');
        showModal(createTeamModal);
    });
    
    // Mở modal Join Team khi click vào Join team
    document.getElementById('joinTeamBtn').addEventListener('click', function() {
        document.getElementById('teamDropdown').classList.remove('show');
        showModal(joinTeamModal);
    });
    
    // Đóng modal Create Team
    document.getElementById('closeCreateTeamModal').addEventListener('click', function() {
        hideModal(createTeamModal);
    });
    
    document.getElementById('cancelCreateTeam').addEventListener('click', function() {
        hideModal(createTeamModal);
    });
    
    // Đóng modal Join Team
    document.getElementById('closeJoinTeamModal').addEventListener('click', function() {
        hideModal(joinTeamModal);
    });
    
    document.getElementById('cancelJoinTeam').addEventListener('click', function() {
        hideModal(joinTeamModal);
    });
    
    // Xử lý khi nhấn nút Join
    document.getElementById('joinTeamSubmit').addEventListener('click', function() {
        // Lấy dữ liệu từ form
        const teamCode = document.getElementById('teamCode').value;
        
        console.log('Joining team with code:', teamCode);
        
        // Đóng modal
        hideModal(joinTeamModal);
        
        // Reset form
        document.getElementById('teamCode').value = '';
    });
    
    // Đóng modal khi click vào overlay
    modalOverlay.addEventListener('click', function() {
        hideAllModals();
    });
    
    // Đóng modal khi nhấn Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideAllModals();
        }
    });
}

function showModal(modal) {
    if (!modal) return;
    
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.style.display = 'block';
    modal.style.display = 'block';
    
    // Ngăn scroll trên body
    document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
    if (!modal) return;
    
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.style.display = 'none';
    modal.style.display = 'none';
    
    // Cho phép scroll trên body
    document.body.style.overflow = '';
}

function hideAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        hideModal(modal);
    });
}

function initTeamsList() {
    const teamsHeader = document.getElementById('teamsHeader');
    const teamsChevron = document.getElementById('teamsChevron');
    const teamsContent = document.getElementById('teamsContent');
    
    if (!teamsHeader || !teamsChevron || !teamsContent) return;
    
    teamsHeader.addEventListener('click', function() {
        // Toggle hiển thị nội dung
        if (teamsContent.style.display === 'none') {
            teamsContent.style.display = 'block';
            teamsChevron.classList.add('expanded');
        } else {
            teamsContent.style.display = 'none';
            teamsChevron.classList.remove('expanded');
        }
    });
}

function initCreateTeamForm() {
    const saveTeamBtn = document.getElementById('saveTeam');
    if (!saveTeamBtn) return;
    
    saveTeamBtn.addEventListener('click', function() {
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
        
        // Tạo một team card mới và thêm vào teams grid
        addNewTeamCard(teamName, teamCode, color);
        
        // Đóng modal
        hideModal(document.getElementById('createTeamModal'));
        
        // Reset form
        document.getElementById('teamName').value = '';
        document.getElementById('teamDescription').value = '';
        
        // Mở mục Teams nếu đang đóng
        const teamsContent = document.getElementById('teamsContent');
        const teamsChevron = document.getElementById('teamsChevron');
        if (teamsContent && teamsContent.style.display === 'none') {
            teamsContent.style.display = 'block';
            if (teamsChevron) teamsChevron.classList.add('expanded');
        }
    });
}

function generateTeamCode(teamName) {
    // Tạo team code từ tên team
    // Lấy chữ cái đầu của mỗi từ và chuyển thành in hoa
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

function addNewTeamCard(teamName, teamCode, colorClass) {
    const teamsGrid = document.querySelector('.teams-grid');
    if (!teamsGrid) {
        // Nếu chưa có teams-grid, tạo mới cấu trúc
        createTeamsGridStructure();
        return addNewTeamCard(teamName, teamCode, colorClass); // Gọi lại hàm
    }
    
    // Lấy initials cho team icon
    const initials = getInitials(teamName);
    
    // Map color từ input sang CSS class
    const colorMap = {
        'blue': 'team-blue',
        'orange': 'team-orange',
        'green': 'team-green',
        'purple': 'team-purple',
        'red': 'team-pink'
    };
    
    const teamColorClass = colorMap[colorClass] || 'team-blue';
    
    // Tạo DOM element cho team card
    const teamCard = document.createElement('div');
    teamCard.className = 'team-card';
    teamCard.innerHTML = `
        <div class="team-card-header">
            <div class="team-icon ${teamColorClass}">${initials}</div>
            <div class="team-info">
                <div class="team-name">${teamName}</div>
                <div class="team-code">${teamCode}</div>
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
    
    // Thêm card vào grid
    teamsGrid.appendChild(teamCard);
    
    // Thêm sự kiện cho team card và các nút của nó
    attachTeamCardEvents(teamCard);
    
    // Lưu team vào localStorage
    const teams = loadTeams();
    teams.push({
        name: teamName,
        code: teamCode,
        color: colorClass,
        initials: initials
    });
    saveTeams(teams);
}

function getInitials(name) {
    const words = name.split(' ');
    if (words.length > 1) {
        return (words[0][0] + words[1][0]).toUpperCase();
    } else {
        return name.substring(0, 2).toUpperCase();
    }
}

function createTeamsGridStructure() {
    const teamsSection = document.querySelector('.teams-section');
    if (!teamsSection) return;
    
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
    
    // Thêm event cho item row
    itemRow.addEventListener('click', function() {
        // Toggle hiển thị nội dung
        if (teamsContent.style.display === 'none') {
            teamsContent.style.display = 'block';
            document.getElementById('teamsChevron').classList.add('expanded');
        } else {
            teamsContent.style.display = 'none';
            document.getElementById('teamsChevron').classList.remove('expanded');
        }
    });
}

function attachTeamCardEvents(teamCard) {
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

function initChatUI() {
    // Xử lý toggle các section
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const toggle = this.querySelector('.section-toggle');
            
            if (content.style.display === 'none') {
                content.style.display = 'block';
                toggle.textContent = '▼';
            } else {
                content.style.display = 'none';
                toggle.textContent = '►';
            }
        });
    });
    
    // Xử lý khi nhấn nút gửi
    const sendButton = document.querySelector('.send-button');
    const chatInput = document.querySelector('.chat-input');
    
    if (sendButton && chatInput) {
        sendButton.addEventListener('click', function() {
            sendMessage();
        });
        
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            console.log('Sending message:', message);
            // Thêm code để xử lý tin nhắn
            
            // Xóa nội dung input
            chatInput.value = '';
            
            // Xóa trạng thái trống
            const emptyChat = document.querySelector('.empty-chat');
            if (emptyChat) {
                emptyChat.style.display = 'none';
            }
            
            // Hiển thị tin nhắn (đây chỉ là mẫu, bạn cần thêm code để hiển thị tin nhắn thực tế)
            const chatContent = document.querySelector('.chat-content');
            if (chatContent) {
                const messageElement = document.createElement('div');
                messageElement.className = 'message-container sent';
                messageElement.innerHTML = `
                    <div class="message-bubble">
                        <div class="message-text">${message}</div>
                        <div class="message-time">Just now</div>
                    </div>
                `;
                chatContent.appendChild(messageElement);
                
                // Scroll xuống cuối
                chatContent.scrollTop = chatContent.scrollHeight;
            }
        }
    }
}