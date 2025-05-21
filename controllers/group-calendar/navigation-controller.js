/**
 * Controller for group calendar navigation
 * Follows MVC pattern by separating navigation logic from view
 * Removed chat references
 */
export function initGroupCalendarNavigation() {
    // Handle navigation in the sidebar
    const sidebarItems = document.querySelectorAll('.sidebar-item, .menu-card');
    
    if (sidebarItems.length === 0) {
        console.warn("No navigation items found on the page");
        return;
    }
    
    console.log(`Found ${sidebarItems.length} navigation items`);
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            // Get the navigation target
            let targetPage = '';
            
            // Handle both sidebar-item and menu-card structures
            if (this.classList.contains('sidebar-item')) {
                const textElement = this.querySelector('.sidebar-text');
                if (textElement) {
                    const itemName = textElement.textContent.trim();
                    targetPage = getTargetPageFromName(itemName);
                }
            } else if (this.classList.contains('menu-card')) {
                const id = this.id;
                targetPage = getTargetPageFromId(id);
            }
            
            if (targetPage) {
                console.log(`Navigating to: ${targetPage}`);
                window.location.href = targetPage;
            }
        });
    });
    
    // Set active state for current page
    setActiveNavigationItem();
}

/**
 * Get the target page URL based on navigation item name
 * @param {string} itemName - The text content of the navigation item
 * @returns {string} The URL to navigate to
 */
function getTargetPageFromName(itemName) {
    switch(itemName) {
        case 'Account':
            return 'manageAcc.html';
        case 'Teams':
            return 'group.html';
        case 'Personal Calendar':
            return 'index.html';
        case 'Group Calendar':
            return 'group-calendar.html';
        default:
            console.warn(`Unknown navigation item: ${itemName}`);
            return '';
    }
}

/**
 * Get the target page URL based on button ID
 * @param {string} id - The ID of the navigation button
 * @returns {string} The URL to navigate to
 */
function getTargetPageFromId(id) {
    switch(id) {
        case 'btn-acc':
            return 'manageAcc.html';
        case 'btn-teams':
            return 'group.html';
        case 'btn-events':
        case 'btn-personal-calendar':
            return 'index.html';
        case 'btn-group-calendar':
            return 'group-calendar.html';
        default:
            console.warn(`Unknown button ID: ${id}`);
            return '';
    }
}

/**
 * Set the active state for the current navigation item
 * Based on the current URL
 */
function setActiveNavigationItem() {
    const currentPath = window.location.pathname;
    
    // Determine which page we're on
    let currentPage = '';
    if (currentPath.includes('group-calendar.html')) {
        currentPage = 'Group Calendar';
    } else if (currentPath.includes('group.html')) {
        currentPage = 'Teams';
    } else if (currentPath.includes('manageAcc.html')) {
        currentPage = 'Account';
    } else if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
        currentPage = 'Personal Calendar';
    }
    
    // Set active class on sidebar-item elements
    if (currentPage) {
        document.querySelectorAll('.sidebar-item').forEach(item => {
            const textElement = item.querySelector('.sidebar-text');
            if (textElement && textElement.textContent.trim() === currentPage) {
                // Remove active class from all items
                document.querySelectorAll('.sidebar-item').forEach(si => {
                    si.classList.remove('active');
                });
                // Add active class to current item
                item.classList.add('active');
            }
        });
        
        // Set active class on menu-card elements
        const btnMapping = {
            'Group Calendar': 'btn-group-calendar',
            'Teams': 'btn-teams',
            'Account': 'btn-acc',
            'Personal Calendar': 'btn-events'
        };
        
        const btnId = btnMapping[currentPage];
        if (btnId) {
            // Remove active class from all items
            document.querySelectorAll('.menu-card').forEach(card => {
                card.classList.remove('active');
            });
            // Add active class to current item
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.classList.add('active');
            }
        }
    }
}