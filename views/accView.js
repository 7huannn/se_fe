// views/accView.js - FIXED MVC COMPLIANT VERSION

/**
 * View chỉ chịu trách nhiệm về presentation và DOM manipulation
 * Không chứa business logic hoặc data processing
 */
export default class AccView {
  constructor() {
    this.emailInput = document.getElementById('email');
    this.usernameInput = document.getElementById('username');
    this.fnameInput = document.getElementById('fname');
    this.lnameInput = document.getElementById('lname');
    this.genderInputs = document.querySelectorAll('input[name="gender"]');
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

    this._initializeDateSelects();
    this._initDarkMode();
  }

  /**
   * Initialize date select dropdowns - PURE UI SETUP
   */
  _initializeDateSelects() {
    if (this.birthDaySelect) {
      for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        this.birthDaySelect.appendChild(option);
      }
    }

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

  /**
   * Initialize dark mode from saved preference - PURE UI STATE
   */
  _initDarkMode() {
    if (localStorage.getItem('dark_mode') === 'enabled') {
      this.body.classList.add('dark-mode');
      if (this.darkModeToggle) {
        this.darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      }
      this._applyDarkModeStyles();
    }
  }

  /**
   * Populate form with account data - PURE DATA DISPLAY
   */
  populateForm(data) {
    if (this.emailInput) {
      this.emailInput.value = data.email || '';
    }

    if (this.usernameInput) {
      this.usernameInput.value = data.username || '';
    }
    if (this.fnameInput) {
      this.fnameInput.value = data.fname || '';
    }
    if (this.lnameInput) {
      this.lnameInput.value = data.lname || '';
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
      const dateOfBirth = this._parseDateOfBirth(data.dateOfBirth);
      this.setDateOfBirth(dateOfBirth);
    }

    // Display avatar if exists
    if (data.avatar) {
      this.previewAvatar({ src: data.avatar });
    }
  }

  /**
   * Get form data - PURE DATA COLLECTION
   */
  getFormData() {
    return {
      email: this.emailInput ? this.emailInput.value.trim() : '',
      username: this.usernameInput ? this.usernameInput.value.trim() : '',
      fname: this.fnameInput ? this.fnameInput.value.trim() : '',
      lname: this.lnameInput ? this.lnameInput.value.trim() : '',
      gender: document.querySelector('input[name="gender"]:checked')?.value || 'male',
      password: this.passwordInput ? this.passwordInput.value : '',
      confirmPassword: this.confirmPasswordInput ? this.confirmPasswordInput.value : '',
      dateOfBirth: this.getDateOfBirth(),
      hasPassword: this.passwordInput && this.passwordInput.value.trim() !== '',
      hasAvatar: this.avatarInput && this.avatarInput.files && this.avatarInput.files.length > 0,
      avatarFile: this.avatarInput && this.avatarInput.files ? this.avatarInput.files[0] : null
    };
  }

  /**
   * Bind password toggle events - PURE EVENT BINDING
   */
  bindPasswordToggle() {
    if (this.passwordToggle && this.passwordInput) {
      this.passwordToggle.addEventListener('click', () => {
        this.togglePassword(this.passwordInput, this.passwordToggle);
      });
    }

    if (this.confirmPasswordToggle && this.confirmPasswordInput) {
      this.confirmPasswordToggle.addEventListener('click', () => {
        this.togglePassword(this.confirmPasswordInput, this.confirmPasswordToggle);
      });
    }
  }

  /**
   * Bind avatar preview events - PURE EVENT BINDING
   */
  bindAvatarPreview() {
    if (this.avatarInput) {
      this.avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.previewAvatar(file);
        }
      });
    }
  }

  /**
   * Bind dark mode toggle events - PURE EVENT BINDING
   */
  bindDarkModeToggle() {
    if (this.darkModeToggle) {
      this.darkModeToggle.addEventListener('click', () => {
        this.toggleDarkMode();
      });
    }
  }

  /**
   * Bind date validation events - PURE EVENT BINDING
   */
  bindDateValidation() {
    if (this.birthMonthSelect && this.birthDaySelect) {
      this.birthMonthSelect.addEventListener('change', () => {
        const month = parseInt(this.birthMonthSelect.value);
        const year = parseInt(this.birthYearSelect.value);
        this.updateDaysInMonth(month, year);
      });

      this.birthYearSelect.addEventListener('change', () => {
        if (this.birthMonthSelect.value === '1') { // February
          const month = parseInt(this.birthMonthSelect.value);
          const year = parseInt(this.birthYearSelect.value);
          this.updateDaysInMonth(month, year);
        }
      });
    }
  }

  /**
   * Toggle password visibility - PURE UI INTERACTION
   */
  togglePassword(inputElement, toggleElement) {
    if (!inputElement || !toggleElement) return;

    const isPwd = inputElement.type === 'password';
    inputElement.type = isPwd ? 'text' : 'password';
    toggleElement.classList.toggle('fa-eye');
    toggleElement.classList.toggle('fa-eye-slash');
  }

  /**
   * Preview avatar - PURE UI DISPLAY
   */
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

  /**
   * Toggle dark mode - PURE UI STATE CHANGE
   */
  toggleDarkMode() {
    this.body.classList.toggle('dark-mode');

    if (this.body.classList.contains('dark-mode')) {
      this.darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      this._applyDarkModeStyles();
      localStorage.setItem('dark_mode', 'enabled');
    } else {
      this.darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      this._applyLightModeStyles();
      localStorage.setItem('dark_mode', 'disabled');
    }
  }

  /**
   * Apply dark mode styles - PURE UI STYLING
   */
  _applyDarkModeStyles() {
    document.documentElement.style.setProperty('--text-color', '#f8f9fa');
    document.documentElement.style.setProperty('--light-color', '#2c3e50');
    document.documentElement.style.setProperty('--border-color', '#4d5b6a');
    this.body.style.backgroundColor = '#1a2332';
    this._setBgColor('.account-card, .form-control, .date-select-item', '#2c3e50', '#f8f9fa');
  }

  /**
   * Apply light mode styles - PURE UI STYLING
   */
  _applyLightModeStyles() {
    document.documentElement.style.setProperty('--text-color', '#333');
    document.documentElement.style.setProperty('--light-color', '#f8f9fa');
    document.documentElement.style.setProperty('--border-color', '#e0e0e0');
    this.body.style.backgroundColor = '#f5f7fa';
    this._setBgColor('.account-card, .form-control, .date-select-item', '#fff', '#333');
  }

  /**
   * Set background color for elements - PURE UI STYLING
   */
  _setBgColor(selector, bg, color) {
    document.querySelectorAll(selector).forEach(el => {
      el.style.backgroundColor = bg;
      el.style.color = color;
    });
  }

  /**
   * Show save indicator - PURE UI FEEDBACK
   */
  showSaveIndicator(saveIndicator, duration = 1500) {
    if (!saveIndicator) return;

    saveIndicator.textContent = 'Saved successfully! Redirecting...';
    saveIndicator.style.display = 'block';
  }

  /**
   * Set date of birth values - PURE UI STATE
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
   * Get date of birth values - PURE DATA COLLECTION
   */
  getDateOfBirth() {
    return {
      day: this.birthDaySelect ? this.birthDaySelect.value : '',
      month: this.birthMonthSelect ? this.birthMonthSelect.value : '',
      year: this.birthYearSelect ? this.birthYearSelect.value : ''
    };
  }

  /**
   * Check if date of birth is valid - PURE VALIDATION
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

    // Check if the date is reasonable (not in the future)
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
   * Update days in month based on selected month/year - PURE UI UPDATE
   */
  updateDaysInMonth(month, year) {
    if (!this.birthDaySelect || isNaN(month)) return;

    const currentDay = this.birthDaySelect.value;

    // Clear existing options except placeholder
    while (this.birthDaySelect.options.length > 1) {
      this.birthDaySelect.remove(1);
    }

    // Determine days in month
    let daysInMonth = 31;

    if (month === 1) { // February (0-based)
      daysInMonth = 28;
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
   * Show error message - PURE UI FEEDBACK
   */
  showError(message, fieldId = null) {
    let errorDiv;

    if (fieldId) {
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
      errorDiv = document.querySelector('#form-error');
      if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'form-error';
        errorDiv.className = 'error-message';
        const form = document.getElementById('accountForm');
        if (form) {
          form.insertBefore(errorDiv, form.firstChild);
        }
      }
    }

    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.add('show');

      setTimeout(() => {
        errorDiv.classList.remove('show');
      }, 5000);
    }
  }

  /**
   * Clear password fields - PURE UI RESET
   */
  clearPasswordFields() {
    if (this.passwordInput) {
      this.passwordInput.value = '';
    }
    if (this.confirmPasswordInput) {
      this.confirmPasswordInput.value = '';
    }
  }

  /**
   * Clear avatar input - PURE UI RESET
   */
  clearAvatarInput() {
    if (this.avatarInput) {
      this.avatarInput.value = '';
    }
  }

  /**
   * Parse date of birth string - PURE DATA PARSING
   */
  _parseDateOfBirth(dateString) {
    if (!dateString) return { day: '', month: '', year: '' };

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return { day: '', month: '', year: '' };

    return {
      day: date.getDate(),
      month: date.getMonth(), // 0-based month
      year: date.getFullYear()
    };
  }
}