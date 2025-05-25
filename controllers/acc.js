// controllers/acc.js - FIXED MVC COMPLIANT VERSION

import AccView from '../views/accView.js';
import AccountModel from '../models/account.js';

/**
 * Controller chỉ chịu trách nhiệu điều phối giữa Model và View
 * Xử lý business logic và user interactions
 * Không thao tác DOM trực tiếp
 */
export class AccountController {
  constructor(formId = 'accountForm', saveIndicatorId = 'saveIndicator') {
    this.form = document.getElementById(formId);
    this.saveIndicator = document.getElementById(saveIndicatorId);
    
    if (!this.form) {
      console.error(`Form with ID "${formId}" not found`);
      return;
    }
    
    this.view = new AccView();
    this.model = new AccountModel();
    
    this.init();
  }

  /**
   * Initialize controller - COORDINATION LOGIC
   */
  async init() {
    this._bindEvents();
    await this._loadAndDisplayAccountData();
  }

  /**
   * Load account data and coordinate display - BUSINESS LOGIC
   */
  async _loadAndDisplayAccountData() {
    try {
      const accountData = await AccountModel.getAccountInfo();
      
      // Use view to populate form
      this.view.populateForm(accountData);
      
      // Handle avatar logic
      await this._handleAvatarLogic(accountData);
      
      // Store user info
      this._storeUserInfo(accountData);
      
    } catch (error) {
      console.error('Error loading account data:', error);
      this.view.showError('Failed to load account data. Please try again later.');
    }
  }

  /**
   * Handle avatar logic - BUSINESS LOGIC
   */
  async _handleAvatarLogic(accountData) {
    const savedAvatarUrl = localStorage.getItem('user_avatar');
    
    if (savedAvatarUrl && !accountData.avatar) {
      this.view.previewAvatar({ src: savedAvatarUrl });
    } else if (accountData.avatar) {
      localStorage.setItem('user_avatar', accountData.avatar);
      this.view.previewAvatar({ src: accountData.avatar });
    }
  }

  /**
   * Store user info in localStorage - DATA MANAGEMENT
   */
  _storeUserInfo(accountData) {
    if (accountData.username) {
      localStorage.setItem('username', accountData.username);
    }
    
    if (accountData.email) {
      localStorage.setItem('email', accountData.email);
    }
  }

  /**
   * Bind events to view elements - EVENT COORDINATION
   */
  _bindEvents() {
    // Password toggle events
    this.view.bindPasswordToggle();
    
    // Avatar preview events
    this.view.bindAvatarPreview();
    
    // Dark mode toggle
    this.view.bindDarkModeToggle();
    
    // Date validation events
    this.view.bindDateValidation();
    
    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleFormSubmit();
    });
  }

  /**
   * Handle form submission - BUSINESS LOGIC COORDINATION
   */
  async _handleFormSubmit() {
    try {
      // Get form data from view
      const formData = this.view.getFormData();
      
      // Validate form data
      const validation = this._validateFormData(formData);
      if (!validation.isValid) {
        this.view.showError(validation.message, validation.field);
        return;
      }
      
      // Process account update
      await this._processAccountUpdate(formData);
      
      // Process password update if needed
      if (formData.hasPassword) {
        await this._processPasswordUpdate(formData);
      }
      
      // Process avatar upload if needed
      if (formData.hasAvatar) {
        await this._processAvatarUpload(formData);
      }
      
      // Update stored user info
      this._updateStoredUserInfo(formData);
      
      // Show success and redirect
      this._handleSuccessfulUpdate();
      
    } catch (error) {
      console.error('Error updating account:', error);
      this.view.showError(error.message || 'An error occurred while updating your account');
    }
  }

  /**
   * Validate form data - BUSINESS LOGIC
   */
  _validateFormData(formData) {
    if (!formData.email.trim()) {
      return {
        isValid: false,
        message: 'Email is required',
        field: 'email'
      };
    }
    
    if (!AccountModel.isValidEmail(formData.email)) {
      return {
        isValid: false,
        message: 'Please enter a valid email address',
        field: 'email'
      };
    }
    
    if (!formData.username.trim()) {
      return {
        isValid: false,
        message: 'Username is required',
        field: 'username'
      };
    }
    
    // Validate date of birth
    if (!this.view.isValidDateOfBirth()) {
      return {
        isValid: false,
        message: 'Please enter a valid date of birth or leave all date fields empty',
        field: 'birthDay'
      };
    }
    
    // Validate passwords
    const passwordValidation = this._validatePasswords(formData);
    if (!passwordValidation.isValid) {
      return passwordValidation;
    }
    
    return { isValid: true };
  }

  /**
   * Validate password fields - BUSINESS LOGIC
   */
  _validatePasswords(formData) {
    const hasPassword = formData.password && formData.password.trim() !== '';
    const hasConfirmPassword = formData.confirmPassword && formData.confirmPassword.trim() !== '';
    
    if ((hasPassword && !hasConfirmPassword) || (!hasPassword && hasConfirmPassword)) {
      return {
        isValid: false,
        message: 'Please fill both password fields or leave both empty',
        field: 'confirmPassword'
      };
    }
    
    if (hasPassword && hasConfirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        return {
          isValid: false,
          message: 'Passwords do not match',
          field: 'confirmPassword'
        };
      }
    }
    
    return { isValid: true };
  }

  /**
   * Process account information update - BUSINESS LOGIC
   */
  async _processAccountUpdate(formData) {
    const dateOfBirth = this._formatDateOfBirth(formData);
    
    const accountData = {
      email: formData.email,
      username: formData.username,
      fullname: formData.fullname || '',
      gender: formData.gender || 'male',
      dateOfBirth: dateOfBirth
    };

    const result = await AccountModel.updateAccount(accountData);
    if (!result.success) {
      throw new Error(result.message || 'Failed to update account information');
    }
  }

  /**
   * Process password update - BUSINESS LOGIC
   */
  async _processPasswordUpdate(formData) {
    const result = await AccountModel.updatePassword(
      formData.password,
      formData.confirmPassword
    );
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update password');
    }
    
    // Clear password fields through view
    this.view.clearPasswordFields();
  }

  /**
   * Process avatar upload - BUSINESS LOGIC
   */
  async _processAvatarUpload(formData) {
    const result = await AccountModel.uploadAvatar(formData.avatarFile);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to upload avatar');
    }
    
    if (result.avatarUrl) {
      // Update view
      this.view.previewAvatar({ src: result.avatarUrl });
      
      // Dispatch events for other components
      this._dispatchAvatarUpdatedEvent(result.avatarUrl);
      
      // Store in localStorage
      localStorage.setItem('user_avatar', result.avatarUrl);
    }
    
    // Clear file input through view
    this.view.clearAvatarInput();
  }

  /**
   * Format date of birth - DATA PROCESSING
   */
  _formatDateOfBirth(formData) {
    const dob = formData.dateOfBirth;
    
    if (dob.day && dob.month && dob.year) {
      return AccountModel.formatDateOfBirth(dob.day, dob.month, dob.year);
    }
    
    return null;
  }

  /**
   * Update stored user information - DATA MANAGEMENT
   */
  _updateStoredUserInfo(formData) {
    localStorage.setItem('username', formData.username);
    localStorage.setItem('email', formData.email);
    
    // Dispatch event for other components
    this._dispatchUserInfoUpdatedEvent(formData);
  }

  /**
   * Handle successful update - UI COORDINATION
   */
  _handleSuccessfulUpdate() {
    // Show success indicator through view
    this.view.showSaveIndicator(this.saveIndicator);
    
    // Redirect after delay
    setTimeout(() => {
      this._redirectToCalendar();
    }, 1500);
  }

  /**
   * Redirect to calendar - NAVIGATION LOGIC
   */
  _redirectToCalendar() {
    window.location.href = "index.html";
  }

  /**
   * Dispatch avatar updated event - EVENT COORDINATION
   */
  _dispatchAvatarUpdatedEvent(avatarUrl) {
    document.dispatchEvent(new CustomEvent('avatar-updated', {
      detail: { avatarUrl },
      bubbles: true
    }));
  }

  /**
   * Dispatch user info updated event - EVENT COORDINATION
   */
  _dispatchUserInfoUpdatedEvent(formData) {
    document.dispatchEvent(new CustomEvent('user-info-updated', {
      detail: { 
        username: formData.username,
        email: formData.email
      },
      bubbles: true
    }));
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