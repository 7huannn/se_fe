// controllers/login.js - Updated to use API
import { authService } from '../services/authService.js';

/**
 * Kiểm tra định dạng email hợp lệ
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Social auth redirect (giữ nguyên)
 */
export function socialAuthRedirect(provider) {
  const base = 'http://localhost:8000/public_apiauth'; // Update URL cho đúng
  const url = new URL(base);
  url.searchParams.set('provider', provider);
  window.location.href = url.toString();
}

export function loginWithGoogle() {
  socialAuthRedirect('google');
}

export function loginWithFacebook() {
  socialAuthRedirect('facebook');
}

export function loginWithGitHub() {
  socialAuthRedirect('github');
}

export function loginWithLinkedIn() {
  socialAuthRedirect('linkedin');
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