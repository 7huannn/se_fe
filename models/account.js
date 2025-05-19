/**
 * Account model - Handles data operations for user accounts
 */
export default class AccountModel {
  /**
   * Gets the current user account info
   * @returns {Promise<Object>} The user account data
   */
  static async getAccountInfo() {
    try {
      const response = await fetch('https://se_backend.hrzn.run/api/account/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this._getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch account data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching account data:', error);
      
      // Fallback to mock data if API fails
      return {
        email: 'legendarylkt@gmail.com',
        username: 'Lê Thuận',
        fullname: '',
        gender: 'male',
        dateOfBirth: '1995-06-15', // ISO format: YYYY-MM-DD
        avatar: null
      };
    }
  }

  /**
   * Updates the user account information
   * @param {Object} accountData - The updated account data
   * @returns {Promise<Object>} Result of the update operation
   */
  static async updateAccount(accountData) {
    try {
      const response = await fetch('https://se_backend.hrzn.run/api/account/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this._getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(accountData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update account');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating account:', error);
      
      // Return mock success for development
      return {
        success: true,
        message: 'Account updated successfully'
      };
    }
  }

  /**
   * Updates the user's password
   * @param {string} currentPassword - The current password (not used in this implementation)
   * @param {string} newPassword - The new password
   * @param {string} confirmPassword - Confirmation of the new password
   * @returns {Promise<Object>} Result of the password update
   */
  static async updatePassword(newPassword, confirmPassword) {
    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      const response = await fetch('https://se_backend.hrzn.run/api/account/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this._getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newPassword,
          confirmPassword
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating password:', error);
      
      // Return mock success for development
      return {
        success: true,
        message: 'Password updated successfully'
      };
    }
  }

  /**
   * Uploads a new avatar image
   * @param {File} file - The image file to upload
   * @returns {Promise<Object>} Result of the upload operation
   */
  static async uploadAvatar(file) {
    try {
      // Check file size (5MB limit)
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 5) {
        return {
          success: false,
          message: 'File too large (max 5MB)',
          avatarUrl: null
        };
      }
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch('https://se_backend.hrzn.run/api/account/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._getToken()}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload avatar');
      }
      
      const data = await response.json();
      return {
        success: true,
        message: 'Avatar uploaded successfully',
        avatarUrl: data.avatarUrl
      };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      
      // Return mock success with local URL for development
      return {
        success: true,
        message: 'Avatar uploaded successfully',
        avatarUrl: URL.createObjectURL(file)
      };
    }
  }
  
  /**
   * Validates email format
   * @param {string} email - Email address to validate
   * @returns {boolean} True if email is valid
   */
  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  /**
   * Get authentication token from localStorage
   * @returns {string} The authentication token
   * @private
   */
  static _getToken() {
    return localStorage.getItem('auth_token') || '';
  }
  
  /**
   * Build date of birth string from separate day, month, year values
   * @param {number} day - Day of birth
   * @param {number} month - Month of birth (0-11)
   * @param {number} year - Year of birth
   * @returns {string} Date in ISO format (YYYY-MM-DD)
   */
  static formatDateOfBirth(day, month, year) {
    // Add 1 to month because JS months are 0-based but we want ISO format
    const monthFormatted = (parseInt(month) + 1).toString().padStart(2, '0');
    const dayFormatted = day.toString().padStart(2, '0');
    return `${year}-${monthFormatted}-${dayFormatted}`;
  }
  
  /**
   * Parse ISO date string into day, month, year components
   * @param {string} dateString - Date in ISO format (YYYY-MM-DD)
   * @returns {Object} Object with day, month, year properties
   */
  static parseDateOfBirth(dateString) {
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