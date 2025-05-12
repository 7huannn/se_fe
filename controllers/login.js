// controllers/login.js

/**
 * Kiểm tra định dạng email hợp lệ
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Redirect sang backend để khởi động OAuth flow
 */
export function socialAuthRedirect(provider) {
  const base = 'https://se_backend.hrzn.run/public_apiauth';
  const url = new URL(base);
  url.searchParams.set('provider', provider);
  window.location.href = url.toString();
}
// Wrapper cho từng provider (dễ đọc, dễ bảo trì)
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
 * Đăng nhập
 * @param {{ email: string, password: string }} creds
 * @returns {Promise<Object>}
 */
export async function login({ email, password }) {
  if (!email || !password) {
    throw new Error('Please fill in all fields');
  }
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  const apiUrl = 'https://se_backend.hrzn.run/public_apiauth/login';
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  } catch (err) {
    const msg = err.message.includes('Failed to fetch')
      ? 'Network error: Please check your connection.'
      : err.message;
    throw new Error(msg);
  }
}

/**
 * Đăng ký
 * @param {{ username: string, email: string, password: string, confirmPassword: string }} payload
 * @returns {Promise<Object>}
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

  const apiUrl = 'https://se_backend.hrzn.run/public_apiauth/register';
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  } catch (err) {
    const msg = err.message.includes('Failed to fetch')
      ? 'Network error: Please check your connection.'
      : err.message;
    throw new Error(msg);
  }
}

/**
 * Quên mật khẩu
 * @param {string} email
 * @returns {Promise<Object>}
 */
export async function forgotPassword(email) {
  if (!email || !isValidEmail(email)) {
    throw new Error('Please enter a valid email');
  }

  const apiUrl = 'https://se_backend.hrzn.run/public_apiauth/forgot';
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send reset link');
    }
    return data;
  } catch (err) {
    const msg = err.message.includes('Failed to fetch')
      ? 'Network error: Please check your connection.'
      : err.message;
    throw new Error(msg);
  }
}
