// controllers/profileController.js

/**
 * Controller xử lý dropdown profile kiểu GitHub và đồng bộ avatar
 * @returns {Object} API của controller
 */
export function initProfileController() {
  // Lấy avatar từ localStorage hoặc dùng avatar mặc định
  function loadUserAvatar() {
    const avatarUrl = localStorage.getItem('user_avatar');
    const avatarContainer = document.querySelector('.profile-avatar img');
    const avatarFallback = document.querySelector('.profile-avatar .avatar-fallback');
    
    if (avatarUrl && avatarContainer) {
      avatarContainer.src = avatarUrl;
      avatarContainer.style.display = 'block';
      if (avatarFallback) {
        avatarFallback.style.display = 'none';
      }
    } else if (avatarFallback) {
      avatarFallback.style.display = 'flex';
      if (avatarContainer) {
        avatarContainer.style.display = 'none';
      }
    }
  }
  
  // Lấy thông tin người dùng từ localStorage
  function loadUserInfo() {
    const username = localStorage.getItem('username') || 'User';
    const email = localStorage.getItem('email') || '';
    
    const usernameElement = document.getElementById('profile-username');
    const emailElement = document.getElementById('profile-email');
    
    if (usernameElement) {
      usernameElement.textContent = username;
    }
    
    if (emailElement) {
      emailElement.textContent = email;
    }
    
    // Xử lý avatar fallback nếu không có avatar
    const avatarFallback = document.querySelector('.profile-avatar .avatar-fallback');
    if (avatarFallback) {
      // Lấy chữ cái đầu tiên của username để hiển thị
      avatarFallback.textContent = username.charAt(0).toUpperCase();
    }
  }
  
  // Khởi tạo chức năng dropdown
  function initProfileDropdown() {
    const profileButton = document.getElementById('profile-dropdown-button');
    const profileMenu = document.getElementById('profile-menu');
    
    if (!profileButton || !profileMenu) return;
    
    // Toggle dropdown khi click vào avatar
    profileButton.addEventListener('click', function(e) {
      e.stopPropagation();
      profileMenu.classList.toggle('active');
      
      // Xoay mũi tên caret
      const caret = profileButton.querySelector('.dropdown-caret');
      if (caret) {
        caret.style.transform = profileMenu.classList.contains('active') ? 'rotate(180deg)' : '';
      }
    });
    
    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', function(e) {
      if (!profileButton.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.classList.remove('active');
        
        // Reset mũi tên caret
        const caret = profileButton.querySelector('.dropdown-caret');
        if (caret) {
          caret.style.transform = '';
        }
      }
    });
    
    // Xử lý khi click vào mục Account
    const accountMenuItem = document.getElementById('menu-item-account');
    if (accountMenuItem) {
      accountMenuItem.addEventListener('click', function() {
        window.location.href = "manageAcc.html";
      });
    }
    
    // Xử lý khi click vào mục Logout
    const logoutMenuItem = document.getElementById('menu-item-logout');
    if (logoutMenuItem) {
      logoutMenuItem.addEventListener('click', function() {
        // Xóa token xác thực
        localStorage.removeItem('auth_token');
        // Chuyển về trang đăng nhập
        window.location.href = "login.html";
      });
    }
  }
  
  // Đồng bộ avatar giữa các trang
  function syncAvatarWithAccountPage() {
    // Lắng nghe sự kiện khi avatar được cập nhật
    document.addEventListener('avatar-updated', function(e) {
      const avatarUrl = e.detail.avatarUrl;
      if (avatarUrl) {
        localStorage.setItem('user_avatar', avatarUrl);
        
        const avatarContainer = document.querySelector('.profile-avatar img');
        const avatarFallback = document.querySelector('.profile-avatar .avatar-fallback');
        
        if (avatarContainer) {
          avatarContainer.src = avatarUrl;
          avatarContainer.style.display = 'block';
          
          if (avatarFallback) {
            avatarFallback.style.display = 'none';
          }
        }
      }
    });
    
    // Cũng lưu thông tin người dùng nếu có
    document.addEventListener('user-info-updated', function(e) {
      const { username, email } = e.detail;
      
      if (username) {
        localStorage.setItem('username', username);
        const usernameElement = document.getElementById('profile-username');
        if (usernameElement) {
          usernameElement.textContent = username;
        }
      }
      
      if (email) {
        localStorage.setItem('email', email);
        const emailElement = document.getElementById('profile-email');
        if (emailElement) {
          emailElement.textContent = email;
        }
      }
    });
  }
  
  // Khởi tạo
  loadUserAvatar();
  loadUserInfo();
  initProfileDropdown();
  syncAvatarWithAccountPage();
  
  // Trả về API công khai
  return {
    loadUserAvatar,
    loadUserInfo,
    updateAvatar: function(avatarUrl) {
      localStorage.setItem('user_avatar', avatarUrl);
      
      const avatarContainer = document.querySelector('.profile-avatar img');
      const avatarFallback = document.querySelector('.profile-avatar .avatar-fallback');
      
      if (avatarContainer) {
        avatarContainer.src = avatarUrl;
        avatarContainer.style.display = 'block';
        
        if (avatarFallback) {
          avatarFallback.style.display = 'none';
        }
      }
    },
    updateUserInfo: function(username, email) {
      if (username) localStorage.setItem('username', username);
      if (email) localStorage.setItem('email', email);
      loadUserInfo();
    }
  };
}