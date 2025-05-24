export default class AccView {
  constructor() {
    this.emailInput = document.getElementById('email');
    this.usernameInput = document.getElementById('username');
    this.passwordInput = document.getElementById('password');
    this.confirmPasswordInput = document.getElementById('confirmPassword');
    this.passwordToggle = document.getElementById('passwordToggle');
    this.confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    this.avatarInput = document.getElementById('avatar');
    this.avatarPreview = document.getElementById('avatarPreview');
    this.darkModeToggle = document.getElementById('darkModeToggle');
    this.birthDaySelect = document.getElementById('birthDay');
    this.birthMonthSelect = document.getElementById('birthMonth');
    this.birthYearSelect = document.getElementById('birthYear');
    this.body = document.body;
    
    // Initialize date selects
    this._initializeDateSelects();
    
    // Check for saved dark mode preference
    this._initDarkMode();
  }

  /**
   * Initialize the date select dropdowns with day and year options
   * @private
   */
  _initializeDateSelects() {
    // Generate days for birth day select
    if (this.birthDaySelect) {
      for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        this.birthDaySelect.appendChild(option);
      }
    }
    
    // Generate years for birth year select (100 years back from current year)
    if (this.birthYearSelect) {
      const currentYear = new Date().getFullYear();
      for (let i = currentYear; i >= currentYear - 100; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        this.birthYearSelect.appendChild(option);
      }
    }
  }

  togglePassword(inputElement, toggleElement) {
    if (!inputElement || !toggleElement) return;
    
    const isPwd = inputElement.type === 'password';
    inputElement.type = isPwd ? 'text' : 'password';
    toggleElement.classList.toggle('fa-eye');
    toggleElement.classList.toggle('fa-eye-slash');
  }

  previewAvatar(file) {
    if (!file || !this.avatarPreview) return;
    
    if (file.src) {
      // Handle case when file is actually an object with src property
      this.avatarPreview.innerHTML = `<img src="${file.src}" alt="Avatar">`;
      return;
    }
    
    const reader = new FileReader();
    reader.onload = e => {
      this.avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
    };
    reader.readAsDataURL(file);
  }

  // toggleDarkMode() {
  //   this.body.classList.toggle('dark-mode');
    
  //   if (this.body.classList.contains('dark-mode')) {
  //     this.darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  //     document.documentElement.style.setProperty('--text-color', '#f8f9fa');
  //     document.documentElement.style.setProperty('--light-color', '#2c3e50');
  //     document.documentElement.style.setProperty('--border-color', '#4d5b6a');
  //     this.body.style.backgroundColor = '#1a2332';
  //     this._setBgColor('.account-card, .form-control, .date-select-item', '#2c3e50', '#f8f9fa');
      
  //     // Save preference
  //     localStorage.setItem('dark_mode', 'enabled');
  //   } else {
  //     this.darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  //     document.documentElement.style.setProperty('--text-color', '#333');
  //     document.documentElement.style.setProperty('--light-color', '#f8f9fa');
  //     document.documentElement.style.setProperty('--border-color', '#e0e0e0');
  //     this.body.style.backgroundColor = '#f5f7fa';
  //     this._setBgColor('.account-card, .form-control, .date-select-item', '#fff', '#333');
      
  //     // Save preference
  //     localStorage.setItem('dark_mode', 'disabled');
  //   }
  // }
  
  /**
   * Initialize dark mode based on saved preference
   * @private
   */
  _initDarkMode() {
    if (localStorage.getItem('dark_mode') === 'enabled') {
      this.body.classList.add('dark-mode');
      this.darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      document.documentElement.style.setProperty('--text-color', '#f8f9fa');
      document.documentElement.style.setProperty('--light-color', '#2c3e50');
      document.documentElement.style.setProperty('--border-color', '#4d5b6a');
      this.body.style.backgroundColor = '#1a2332';
      this._setBgColor('.account-card, .form-control, .date-select-item', '#2c3e50', '#f8f9fa');
    }
  }

  _setBgColor(selector, bg, color) {
    document.querySelectorAll(selector).forEach(el => {
      el.style.backgroundColor = bg;
      el.style.color = color;
    });
  }
  
  showSaveIndicator(saveIndicator, duration = 1500) {
  if (!saveIndicator) return;
  
  // Update message to indicate redirect
  saveIndicator.textContent = 'Saved successfully! Redirecting...';
  saveIndicator.style.display = 'block';
}
  
  /**
   * Set date of birth values in the select fields
   * @param {object} dateOfBirth - Object containing day, month, year values
   */
  setDateOfBirth(dateOfBirth) {
    if (!dateOfBirth) return;
    
    if (this.birthDaySelect) {
      this.birthDaySelect.value = dateOfBirth.day || '';
    }
    
    if (this.birthMonthSelect) {
      this.birthMonthSelect.value = dateOfBirth.month || '';
    }
    
    if (this.birthYearSelect) {
      this.birthYearSelect.value = dateOfBirth.year || '';
    }
  }
  
  /**
   * Get date of birth values from the select fields
   * @returns {object} Object containing day, month, year values
   */
  getDateOfBirth() {
    return {
      day: this.birthDaySelect ? this.birthDaySelect.value : '',
      month: this.birthMonthSelect ? this.birthMonthSelect.value : '',
      year: this.birthYearSelect ? this.birthYearSelect.value : ''
    };
  }
  
  /**
   * Check if the date of birth is valid
   * @returns {boolean} True if the date is valid
   */
  isValidDateOfBirth() {
    const dob = this.getDateOfBirth();
    
    // If all fields are empty, consider it valid (not provided)
    if (!dob.day && !dob.month && !dob.year) {
      return true;
    }
    
    // If some fields are filled but others aren't, it's invalid
    if (!dob.day || !dob.month || !dob.year) {
      return false;
    }
    
    // Create a date object and check if it's valid
    const date = new Date(dob.year, dob.month, dob.day);
    if (isNaN(date.getTime())) {
      return false;
    }
    
    // Check if the date is reasonable (e.g., not in the future)
    const today = new Date();
    if (date > today) {
      return false;
    }
    
    // Check if month and day match (to catch invalid dates like Feb 30)
    if (date.getMonth() != dob.month || date.getDate() != dob.day) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Update the number of days in the day select based on month and year
   * @param {number} month - Selected month (0-based)
   * @param {number} year - Selected year
   */
  updateDaysInMonth(month, year) {
    if (!this.birthDaySelect || isNaN(month)) return;
    
    // Get current selected day
    const currentDay = this.birthDaySelect.value;
    
    // Clear existing options except the placeholder
    while (this.birthDaySelect.options.length > 1) {
      this.birthDaySelect.remove(1);
    }
    
    // Determine days in month
    let daysInMonth = 31;
    
    if (month === 1) { // February (0-based)
      daysInMonth = 28;
      
      // Check for leap year
      if (!isNaN(year) && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
        daysInMonth = 29;
      }
    } else if ([3, 5, 8, 10].includes(month)) { // April, June, September, November
      daysInMonth = 30;
    }
    
    // Add options
    for (let i = 1; i <= daysInMonth; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      this.birthDaySelect.appendChild(option);
    }
    
    // Restore selected day if possible
    if (currentDay && currentDay <= daysInMonth) {
      this.birthDaySelect.value = currentDay;
    }
  }
  
  /**
   * Display an error message
   * @param {string} message - The error message to display
   * @param {string} fieldId - The ID of the field with error (optional)
   */
  showError(message, fieldId = null) {
    let errorDiv;
    
    if (fieldId) {
      // Find or create an error div for the specific field
      const field = document.getElementById(fieldId);
      if (!field) return;
      
      const parentDiv = field.closest('.form-group');
      if (!parentDiv) return;
      
      errorDiv = parentDiv.querySelector('.error-message');
      if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        parentDiv.appendChild(errorDiv);
      }
    } else {
      // Create or find a global error message at the top of the form
      errorDiv = document.querySelector('#form-error');
      if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'form-error';
        errorDiv.className = 'error-message';
        const form = document.getElementById('accountForm');
        form.insertBefore(errorDiv, form.firstChild);
      }
    }
    
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    
    // Hide error after 5 seconds
    setTimeout(() => {
      errorDiv.classList.remove('show');
    }, 5000);
  }
  
  /**
   * Check if passwords match
   * @returns {boolean} True if passwords match or both are empty
   */
  validatePasswords() {
    const password = this.passwordInput.value;
    const confirmPassword = this.confirmPasswordInput.value;
    
    // If both are empty, no password change is requested
    if (!password && !confirmPassword) {
      return true;
    }
    
    // If one is filled but the other isn't
    if ((password && !confirmPassword) || (!password && confirmPassword)) {
      this.showError('Both password fields must be filled', 'confirmPassword');
      return false;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      this.showError('Passwords do not match', 'confirmPassword');
      return false;
    }
    
    return true;
  }
}