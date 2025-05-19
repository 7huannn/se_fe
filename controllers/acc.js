import AccView from '../views/accView.js';
import AccountModel from '../models/account.js';

export class AccountController {
  constructor(formId = 'accountForm', saveIndicatorId = 'saveIndicator') {
    this.form = document.getElementById(formId);
    this.saveIndicator = document.getElementById(saveIndicatorId);
    
    if (!this.form) {
      console.error(`Form with ID "${formId}" not found`);
      return;
    }
    
    this.view = new AccView();
    
    // Form fields
    this.emailInput = document.getElementById('email');
    this.usernameInput = document.getElementById('username');
    this.fullnameInput = document.getElementById('fullname');
    this.genderInputs = document.querySelectorAll('input[name="gender"]');
    this.passwordInput = document.getElementById('password');
    this.confirmPasswordInput = document.getElementById('confirmPassword');
    this.avatarInput = document.getElementById('avatar');
    this.birthDayInput = document.getElementById('birthDay');
    this.birthMonthInput = document.getElementById('birthMonth');
    this.birthYearInput = document.getElementById('birthYear');

    this._bindEvents();
    this._loadAccountData();
  }

  async _loadAccountData() {
    try {
      const accountData = await AccountModel.getAccountInfo();
      this._populateForm(accountData);
      
      // Kiểm tra xem có URL avatar đã lưu trong localStorage không
      const savedAvatarUrl = localStorage.getItem('user_avatar');
      if (savedAvatarUrl && !accountData.avatar) {
        // Nếu có avatar đã lưu nhưng không có trong dữ liệu tài khoản, sử dụng avatar đã lưu
        this.view.previewAvatar({ src: savedAvatarUrl });
      } else if (accountData.avatar) {
        // Nếu tài khoản có avatar, lưu vào localStorage để sử dụng giữa các trang
        localStorage.setItem('user_avatar', accountData.avatar);
      }
      
      // Lưu thông tin username và email vào localStorage
      if (accountData.username) {
        localStorage.setItem('username', accountData.username);
      }
      
      if (accountData.email) {
        localStorage.setItem('email', accountData.email);
      }
    } catch (error) {
      console.error('Error loading account data:', error);
      this.view.showError('Failed to load account data. Please try again later.');
    }
  }

  _populateForm(data) {
    // Fill form with user data
    if (this.emailInput) {
      this.emailInput.value = data.email || '';
    }
    
    if (this.usernameInput) {
      this.usernameInput.value = data.username || '';
    }
    
    if (this.fullnameInput) {
      this.fullnameInput.value = data.fullname || '';
    }
    
    // Set gender radio button
    if (this.genderInputs.length > 0) {
      this.genderInputs.forEach(input => {
        if (input.value === data.gender) {
          input.checked = true;
        }
      });
    }
    
    // Set date of birth if available
    if (data.dateOfBirth) {
      const dateOfBirth = AccountModel.parseDateOfBirth(data.dateOfBirth);
      this.view.setDateOfBirth(dateOfBirth);
    }
    
    // Display avatar if exists
    if (data.avatar) {
      this.view.previewAvatar({ src: data.avatar });
    }
  }

  _bindEvents() {
    // Toggle password visibility
    if (this.view.passwordToggle) {
      this.view.passwordToggle.addEventListener('click', () => {
        this.view.togglePassword(this.passwordInput, this.view.passwordToggle);
      });
    }
    
    // Toggle confirm password visibility
    if (this.view.confirmPasswordToggle) {
      this.view.confirmPasswordToggle.addEventListener('click', () => {
        this.view.togglePassword(this.confirmPasswordInput, this.view.confirmPasswordToggle);
      });
    }

    // Preview avatar when file selected
    if (this.view.avatarInput) {
      this.view.avatarInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (file) {
          this.view.previewAvatar(file);
        }
      });
    }

    // Toggle dark mode
    if (this.view.darkModeToggle) {
      this.view.darkModeToggle.addEventListener('click', () => {
        this.view.toggleDarkMode();
      });
    }

    // Submit form
    if (this.form) {
      this.form.addEventListener('submit', e => {
        e.preventDefault();
        this._handleFormSubmit();
      });
    }
    
    // Date of birth validation - show different day counts for different months
    if (this.birthMonthInput && this.birthDayInput) {
      this.birthMonthInput.addEventListener('change', () => {
        const month = parseInt(this.birthMonthInput.value);
        const year = parseInt(this.birthYearInput.value);
        this.view.updateDaysInMonth(month, year);
      });
      
      this.birthYearInput.addEventListener('change', () => {
        // February days depend on leap years
        if (this.birthMonthInput.value === '1') { // February (0-based)
          const month = parseInt(this.birthMonthInput.value);
          const year = parseInt(this.birthYearInput.value);
          this.view.updateDaysInMonth(month, year);
        }
      });
    }
  }

  async _handleFormSubmit() {
    try {
      // Basic validations
      if (!this.emailInput.value.trim()) {
        this.view.showError('Email is required', 'email');
        return;
      }
      
      if (!AccountModel.isValidEmail(this.emailInput.value)) {
        this.view.showError('Please enter a valid email address', 'email');
        return;
      }
      
      if (!this.usernameInput.value.trim()) {
        this.view.showError('Username is required', 'username');
        return;
      }
      
      // Validate date of birth if provided
      if (!this.view.isValidDateOfBirth()) {
        this.view.showError('Please enter a valid date of birth or leave all date fields empty', 'birthDay');
        return;
      }
      
      // Validate password fields
      const hasPassword = this.passwordInput.value.trim() !== '';
      const hasConfirmPassword = this.confirmPasswordInput.value.trim() !== '';
      
      // If one password field is filled but not the other
      if ((hasPassword && !hasConfirmPassword) || (!hasPassword && hasConfirmPassword)) {
        this.view.showError('Please fill both password fields or leave both empty', 'confirmPassword');
        return;
      }
      
      // If both password fields are filled, check if they match
      if (hasPassword && hasConfirmPassword) {
        if (this.passwordInput.value !== this.confirmPasswordInput.value) {
          this.view.showError('Passwords do not match', 'confirmPassword');
          return;
        }
      }
      
      // Get date of birth components
      const dob = this.view.getDateOfBirth();
      
      // Format date of birth if all components are provided
      let dateOfBirth = null;
      if (dob.day && dob.month && dob.year) {
        dateOfBirth = AccountModel.formatDateOfBirth(dob.day, dob.month, dob.year);
      }
      
      // Gather account data
      const accountData = {
        email: this.emailInput.value,
        username: this.usernameInput.value,
        fullname: this.fullnameInput ? this.fullnameInput.value : '',
        gender: document.querySelector('input[name="gender"]:checked')?.value || 'male',
        dateOfBirth: dateOfBirth
      };

      // Update account info
      const accountResult = await AccountModel.updateAccount(accountData);
      if (!accountResult.success) {
        throw new Error(accountResult.message || 'Failed to update account information');
      }

      // Update password if provided
      if (hasPassword) {
        const passwordResult = await AccountModel.updatePassword(
          this.passwordInput.value,
          this.confirmPasswordInput.value
        );
        
        if (!passwordResult.success) {
          throw new Error(passwordResult.message || 'Failed to update password');
        }
        
        // Clear password fields after successful update
        this.passwordInput.value = '';
        this.confirmPasswordInput.value = '';
      }

      // Upload avatar if provided
      if (this.avatarInput && this.avatarInput.files && this.avatarInput.files.length > 0) {
        const avatarResult = await AccountModel.uploadAvatar(this.avatarInput.files[0]);
        
        if (!avatarResult.success) {
          throw new Error(avatarResult.message || 'Failed to upload avatar');
        }
        
        // Update the avatar preview with the new URL
        if (avatarResult.avatarUrl) {
          this.view.previewAvatar({ src: avatarResult.avatarUrl });
          
          // Đồng bộ với avatar trong header
          document.dispatchEvent(new CustomEvent('avatar-updated', {
            detail: { avatarUrl: avatarResult.avatarUrl },
            bubbles: true
          }));
          
          // Lưu vào localStorage để giữ xuyên suốt các trang
          localStorage.setItem('user_avatar', avatarResult.avatarUrl);
        }
        
        // Clear file input
        this.avatarInput.value = '';
      }
      
      // Cập nhật thông tin người dùng trong localStorage và thông báo sự kiện
      localStorage.setItem('username', accountData.username);
      localStorage.setItem('email', accountData.email);
      
      document.dispatchEvent(new CustomEvent('user-info-updated', {
        detail: { 
          username: accountData.username,
          email: accountData.email
        },
        bubbles: true
      }));

      // Show success indicator with redirect message
      this.view.showSaveIndicator(this.saveIndicator);
      
      // Add redirect after successful update
      setTimeout(() => {
        // Redirect back to calendar page
        window.location.href = "index.html";
      }, 1500); // Redirect after 1.5 seconds so user can see success message
      
    } catch (error) {
      console.error('Error updating account:', error);
      this.view.showError(error.message || 'An error occurred while updating your account');
    }
  }
}

/**
 * Initialize the account controller 
 * Export this function to be called from the entry point
 */
export function initAccountController() {
  // Only initialize if we're on the account management page
  if (document.getElementById('accountForm')) {
    new AccountController('accountForm', 'saveIndicator');
  }
}