// JavaScript để xử lý dropdown menu
document.addEventListener('DOMContentLoaded', function() {
    // Xử lý dropdown menu "Join or create team"
    initTeamDropdown();
    
    // Xử lý sự kiện khi click vào các mục sidebar
    initSidebarItems();
});

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
    
    // Xử lý khi click vào các item trong dropdown
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function() {
            // Đóng dropdown
            dropdown.classList.remove('show');
            
            // Xử lý logic tương ứng với từng lựa chọn
            const itemText = this.textContent.trim();
            
            if (itemText.includes('Create team')) {
                console.log('Create team action');
                // Thêm code để xử lý khi người dùng chọn "Create team"
                // Ví dụ: mở form tạo team mới
            } else if (itemText.includes('Join team')) {
                console.log('Join team action');
                // Thêm code để xử lý khi người dùng chọn "Join team"
                // Ví dụ: mở form nhập mã tham gia team
            }
        });
    });
}

function initSidebarItems() {
    // Xử lý sự kiện khi click vào các mục sidebar
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            // Xóa trạng thái active khỏi tất cả các mục
            sidebarItems.forEach(si => si.classList.remove('active'));
            
            // Thêm trạng thái active cho mục được chọn
            this.classList.add('active');
            
            // Lấy tên của mục được chọn (từ sidebar-text)
            const itemName = this.querySelector('.sidebar-text')?.textContent.trim() || '';
            
            // Xử lý logic tương ứng với từng mục
            switch(itemName) {
                case 'Chat':
                    console.log('Navigate to Chat');
                    // Thêm code để chuyển đến trang Chat
                    break;
                case 'Teams':
                    console.log('Navigate to Teams');
                    // Thêm code để chuyển đến trang Teams
                    break;
                case 'Calendar':
                    console.log('Navigate to Calendar');
                    // Thêm code để chuyển đến trang Calendar
                    break;
                case 'Settings':
                    console.log('Navigate to Settings');
                    // Thêm code để chuyển đến trang Settings
                    break;
                default:
                    break;
            }
        });
    });
}

// Thêm các hàm tiện ích
function toggleElement(element, className) {
    if (element) {
        element.classList.toggle(className);
    }
}

function showElement(element, className) {
    if (element && !element.classList.contains(className)) {
        element.classList.add(className);
    }
}

function hideElement(element, className) {
    if (element && element.classList.contains(className)) {
        element.classList.remove(className);
    }
}