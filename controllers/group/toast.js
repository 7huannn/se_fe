// controllers/group/toast.js - Toast notification utility

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 */
export function showToast(message, type = 'success') {
    // Find or create toast container
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}