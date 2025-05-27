// services/authService.js - Auth service tích hợp với backend
import { apiClient } from './api.js';

export class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.loadUserFromStorage();
  }

  // Load user từ localStorage
  loadUserFromStorage() {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        this.currentUser = JSON.parse(userData);
        this.isAuthenticated = true;
        apiClient.setToken(token);
      } catch (error) {
        console.error('Error loading user data:', error);
        this.logout();
      }
    }
  }

  // Save user data
  saveUserToStorage(user, token) {
    localStorage.setItem('user_data', JSON.stringify(user));
    localStorage.setItem('auth_token', token);
    localStorage.setItem('username', user.username);
    localStorage.setItem('email', user.email);
    
    this.currentUser = user;
    this.isAuthenticated = true;
    apiClient.setToken(token);
  }

  // Login
  async login({ email, password }) {
    try {
      const response = await apiClient.post('api/auth/login', {
        email,
        password
      });

      if (response.access_token) {
        // Tạo user object từ response (backend không trả user info)
        const basicUser = { 
          email, 
          username: email.split('@')[0] // Tạm thời dùng email làm username
        };
        
        this.saveUserToStorage(basicUser, response.access_token);
        
        return {
          success: true,
          message: 'Login successful',
          user: basicUser,
          token: response.access_token
        };
      }

      return {
        success: false,
        message: 'Login failed: No token received'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Register
  async register({ username, email, password }) {
    try {
      const response = await apiClient.post('api/users/register', {
        username,
        email,
        password,
        role: 'user'
      });

      return {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Logout
  async logout() {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        await apiClient.post('api/auth/logout', { token });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local data
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

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiClient.post('api/users/password-reset-request', {
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
        message: error.message
      };
    }
  }

  // Check if authenticated
  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  // Get current user
  getCurrentUserData() {
    return this.currentUser;
  }
}

// Create singleton
export const authService = new AuthService();