// Updated event handlers for sidebar navigation in sidebar-navigation.js
// Removed chat references

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
    
    // Find the current page and set the corresponding sidebar item as active
    const currentPath = window.location.pathname;
    let activeItem = null;
    
    if (currentPath.includes('group.html')) {
        activeItem = 'Teams';
    } else if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
        activeItem = 'Personal Calendar';
    } else if (currentPath.includes('group-calendar.html')) {
        activeItem = 'Group Calendar';
    } else if (currentPath.includes('manageAcc.html')) {
        activeItem = 'Settings';
    }
    
    if (activeItem) {
        sidebarItems.forEach(item => {
            const textElement = item.querySelector('.sidebar-text');
            if (textElement && textElement.textContent.trim() === activeItem) {
                item.classList.add('active');
            }
        });
    }
}

export function handleSidebarNavigation(itemName) {
    console.log("Navigation requested to:", itemName); // For debugging
    
    switch(itemName) {
        case 'Teams':
            window.location.href = "group.html";
            break;
        case 'Personal Calendar':
            window.location.href = "index.html";
            break;
        case 'Group Calendar':
            window.location.href = "group-calendar.html";
            break;
        case 'Settings':
            window.location.href = "manageAcc.html";
            break;
        default:
            console.log("Unknown navigation target:", itemName);
            break;
    }
}