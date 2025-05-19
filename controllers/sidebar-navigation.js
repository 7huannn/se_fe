// controllers/sidebar-navigation.js

// Hàm xử lý điều hướng chung cho tất cả các trang
export function handleSidebarNavigation(itemName) {
    console.log("Navigation requested to:", itemName); // For debugging
    
    switch(itemName) {
        case 'Chat':
            window.location.href = "../html/chat.html";
            break;
        case 'Teams':
            window.location.href = "../html/group.html";
            break;
        case 'Personal Calendar':
            window.location.href = "../html/index.html";
            break;
        case 'Settings':
            window.location.href = "../html/manageAcc.html";
            break;
        default:
            console.log("Unknown navigation target:", itemName);
            break;
    }
}

export function initSidebarNav() {
    // Xử lý chuyển trang khi nhấp vào các mục trong sidebar
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    if (sidebarItems.length === 0) {
        console.warn("No sidebar items found on the page");
        return;
    }
    
    console.log(`Found ${sidebarItems.length} sidebar items`);
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            // Xóa trạng thái active khỏi tất cả các mục
            sidebarItems.forEach(si => si.classList.remove('active'));
            
            // Thêm trạng thái active cho mục được chọn
            this.classList.add('active');
            
            // Lấy tên của mục được chọn (từ sidebar-text)
            const textElement = this.querySelector('.sidebar-text');
            if (!textElement) {
                console.error("No .sidebar-text element found in clicked item", this);
                return;
            }
            
            const itemName = textElement.textContent.trim();
            console.log("Clicked sidebar item:", itemName);
            
            // Xử lý điều hướng
            handleSidebarNavigation(itemName);
        });
    });
}