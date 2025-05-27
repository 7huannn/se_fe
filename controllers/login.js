// controllers/login.js - Updated to use API
import { authService } from '../services/authService.js';

/**
 * Kiểm tra định dạng email hợp lệ
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Đăng nhập sử dụng API
 */
export async function login({ email, password }) {
  if (!email || !password) {
    throw new Error('Please fill in all fields');
  }
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  try {
    const result = await authService.login({ email, password });
    
    if (result.success) {
      return result;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
}

/**
 * Đăng ký sử dụng API
 */
export async function signup({ username, email, password, confirmPassword }) {
  if (!username || !email || !password || !confirmPassword) {
    throw new Error('Please fill in all fields');
  }
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }
  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  try {
    const result = await authService.register({ username, email, password });
    
    if (result.success) {
      return result;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
}

/**
 * Xác thực email sử dụng API
 */
export async function verifyEmail({ email, code }) {
  if (!email || !code) {
    throw new Error('Email and verification code are required');
  }
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  try {
    // Nếu authService chưa có method verifyEmail, bạn có thể tạm thời mock như sau:
    const result = await authService.verifyEmail({ email, code });
    
    if (result.success) {
      return result;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    throw new Error(error.message || 'Email verification failed');
  }
}

/**
 * Gửi lại mã xác thực
 */
export async function resendVerificationCode(email) {
  if (!email || !isValidEmail(email)) {
    throw new Error('Please enter a valid email');
  }

  try {
    // Nếu authService chưa có method resendVerificationCode, bạn có thể tạm thời mock như sau:
    const result = await authService.resendVerificationCode(email);
    
    if (result.success) {
      return result;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    throw new Error(error.message || 'Failed to resend verification code');
  }
}

/**
 * Quên mật khẩu sử dụng API
 */
export async function forgotPassword(email) {
  if (!email || !isValidEmail(email)) {
    throw new Error('Please enter a valid email');
  }

  try {
    const result = await authService.forgotPassword(email);
    
    if (result.success) {
      return result;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    throw new Error(error.message || 'Failed to send reset link');
  }
}