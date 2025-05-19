// controllers/group/modalController.js
import { showModal, hideModal, hideAllModals, initModalCloseButtons } from '../../views/group/modalView.js';

/**
 * Khởi tạo controller cho modals
 */
export function initModalsController() {
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
    
    // Khởi tạo nút đóng cho Create Team modal
    initModalCloseButtons(
        createTeamModal,
        'closeCreateTeamModal',
        'cancelCreateTeam'
    );
    
    // Khởi tạo nút đóng cho Join Team modal
    initModalCloseButtons(
        joinTeamModal,
        'closeJoinTeamModal',
        'cancelJoinTeam'
    );
    
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