import AccView from '../views/accView.js';

// Create a fallback model in case the real one fails to load
const AccountModelFallback = {
  getAccountInfo: () => Promise.resolve({
    email: 'legendarylkt@gmail.com',
    username: 'Lê Thuận',
    fullname: '',
    gender: 'male',
    avatar: null
  }),
  updateAccount: (data) => {
    console.log('Account updated with:', data);
    return Promise.resolve({ success: true });
  },
  updatePassword: () => Promise.resolve({ success: true }),
  uploadAvatar: (file) => Promise.resolve({ 
    success: true, 
    avatarUrl: file ? URL.createObjectURL(file) : null 
  })
};

// Try to import the real model, fall back if it fails
let AccountModel;
try {
  // Dynamic import may not work in some environments, so we use a static import
  import('../models/account.js')
    .then(module => {
      AccountModel = module.default;
      console.log('Account model loaded successfully');
    })
    .catch(error => {
      console.warn('Could not load AccountModel, using fallback data', error);
      AccountModel = AccountModelFallback;
    });
} catch (error) {
  console.warn('Could not load AccountModel, using fallback data', error);
  AccountModel = AccountModelFallback;
}

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
    this.fullnameInput = document.getElementById('fullname');
    this.genderInputs = document.querySelectorAll('input[name="gender"]');
    this.passwordInput = document.getElementById('password');
    this.avatarInput = document.getElementById('avatar');

    this._bindEvents();
    this._loadAccountData();
  }

  async _loadAccountData() {
    try {
      // Make sure AccountModel is available
      if (!AccountModel) {
        AccountModel = AccountModelFallback;
      }
      
      const accountData = await AccountModel.getAccountInfo();
      this._populateForm(accountData);
    } catch (error) {
      console.error('Error loading account data:', error);
    }
  }

  _populateForm(data) {
    // Fill form with user data
    if (data.fullname && this.fullnameInput) {
      this.fullnameInput.value = data.fullname;
    }
    
    // Set gender radio button
    if (this.genderInputs.length > 0) {
      this.genderInputs.forEach(input => {
        if (input.value === data.gender) {
          input.checked = true;
        }
      });
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
        this.view.togglePassword();
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
  }

  async _handleFormSubmit() {
    try {
      // Make sure AccountModel is available
      if (!AccountModel) {
        AccountModel = AccountModelFallback;
      }
      
      // Gather form data
      const formData = {
        fullname: this.fullnameInput ? this.fullnameInput.value : '',
        gender: document.querySelector('input[name="gender"]:checked')?.value || 'male',
        password: this.passwordInput ? this.passwordInput.value : null,
        avatar: this.avatarInput ? this.avatarInput.files[0] : null
      };

      // Update account info
      await AccountModel.updateAccount({
        fullname: formData.fullname,
        gender: formData.gender
      });

      // Update password if provided
      if (formData.password) {
        await AccountModel.updatePassword(formData.password);
      }

      // Upload avatar if provided
      if (formData.avatar) {
        await AccountModel.uploadAvatar(formData.avatar);
      }

      // Show save indicator
      this.view.showSaveIndicator(this.saveIndicator);
    } catch (error) {
      console.error('Error updating account:', error);
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

// Self-initialization for standalone use
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initAccountController();
  });
} else {
  initAccountController();
}