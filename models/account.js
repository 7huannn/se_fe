/**
 * Account model - Handles data operations for user accounts
 */
export default class AccountModel {
  /**
   * Gets the current user account info
   * @returns {Promise<Object>} The user account data
   */
  static async getAccountInfo() {
    // Simulate API call with mock data
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          email: 'legendarylkt@gmail.com',
          username: 'Lê Thuận',
          fullname: '',
          gender: 'male',
          avatar: null
        });
      }, 200);
    });
  }

  /**
   * Updates the user account information
   * @param {Object} accountData - The updated account data
   * @returns {Promise<Object>} Result of the update operation
   */
  static async updateAccount(accountData) {
    // Simulate API call
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Account data updated:', accountData);
        resolve({
          success: true,
          message: 'Account updated successfully'
        });
      }, 500);
    });
  }

  /**
   * Updates the user's password
   * @param {string} newPassword - The new password
   * @returns {Promise<Object>} Result of the password update
   */
  static async updatePassword(newPassword) {
    // Simulate API call
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Password updated (password value hidden for security)');
        resolve({
          success: true,
          message: 'Password updated successfully'
        });
      }, 500);
    });
  }

  /**
   * Uploads a new avatar image
   * @param {File} file - The image file to upload
   * @returns {Promise<Object>} Result of the upload operation
   */
  static async uploadAvatar(file) {
    // Simulate file upload API call
    return new Promise(resolve => {
      setTimeout(() => {
        // Check file size (5MB limit)
        const fileSizeInMB = file.size / (1024 * 1024);
        const success = fileSizeInMB <= 5;
        
        resolve({
          success,
          message: success ? 'Avatar uploaded successfully' : 'File too large (max 5MB)',
          avatarUrl: success ? URL.createObjectURL(file) : null
        });
      }, 800);
    });
  }
}