// services/authService.js - Authentication service
import { apiClient } from './api.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.loadUserFromStorage();
  }

  // Load user from localStorage
  loadUserFromStorage() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user_data');
    
    if (token && user) {
      try {
        this.currentUser = JSON.parse(user);
        this.isAuthenticated = true;
        apiClient.setToken(token);
      } catch (error) {
        console.error('Error loading user data:', error);
        this.logout();
      }
    }
  }

  // Save user to localStorage
  saveUserToStorage(user, token) {
    localStorage.setItem('user_data', JSON.stringify(user));
    localStorage.setItem('auth_token', token);
    this.currentUser = user;
    this.isAuthenticated = true;
    apiClient.setToken(token);
  }

  // Register new user
  async register({ username, email, password, role = 'user' }) {
    try {
      const response = await apiClient.post('/api/users/register', {
        username,
        email,
        password,
        role
      });

      return {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Login user
  async login({ email, password }) {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      });

      if (response.access_token) {
        // Get user profile after successful login
        apiClient.setToken(response.access_token);
        
        try {
          const userProfile = await this.getCurrentUser();
          this.saveUserToStorage(userProfile, response.access_token);
          
          return {
            success: true,
            message: 'Login successful',
            user: userProfile,
            token: response.access_token
          };
        } catch (profileError) {
          // If getting profile fails, still save token but with minimal user data
          const basicUser = { email };
          this.saveUserToStorage(basicUser, response.access_token);
          
          return {
            success: true,
            message: 'Login successful',
            user: basicUser,
            token: response.access_token
          };
        }
      }

      return {
        success: false,
        message: 'Login failed: No token received'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Logout user
  async logout() {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        await apiClient.post('/api/auth/logout', { token });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local data regardless of API call result
      this.currentUser = null;
      this.isAuthenticated = false;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      localStorage.removeItem('user_avatar');
      apiClient.removeToken();
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      // This endpoint might not exist in your backend, adjust as needed
      const response = await apiClient.get('/api/users/me');
      return response;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(updateData) {
    try {
      const response = await apiClient.put('/api/users/me/update', updateData);
      
      // Update local user data
      this.currentUser = { ...this.currentUser, ...response };
      localStorage.setItem('user_data', JSON.stringify(this.currentUser));
      
      return {
        success: true,
        message: 'Profile updated successfully',
        user: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Change password
  async changePassword({ oldPassword, newPassword }) {
    try {
      const response = await apiClient.post('/api/users/me/change-password', {
        old_password: oldPassword,
        new_password: newPassword
      });

      return {
        success: true,
        message: 'Password changed successfully',
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Request password reset
  async requestPasswordReset(email) {
    try {
      const response = await apiClient.post('/api/users/password-reset-request', {
        email
      });

      return {
        success: true,
        message: 'Password reset email sent successfully',
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Reset password with token
  async resetPassword({ token, newPassword }) {
    try {
      const response = await apiClient.post('/api/users/reset-password', {
        token,
        new_password: newPassword
      });

      return {
        success: true,
        message: 'Password reset successfully',
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const response = await apiClient.post('/api/users/verify-email', {
        token
      });

      return {
        success: true,
        message: 'Email verified successfully',
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Update email notification preferences
  async updateEmailNotification(enabled) {
    try {
      const response = await apiClient.put('/api/users/me/email-notification', {
        enabled
      });

      return {
        success: true,
        message: 'Email notification preferences updated',
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Check if user is authenticated
  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  // Get current user data
  getCurrentUserData() {
    return this.currentUser;
  }

  // Check if user has specific role
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole('admin');
  }
}

// Create singleton instance
const authService = new AuthService();

export { authService };