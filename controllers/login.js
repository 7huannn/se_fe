/**
 * Kiểm tra định dạng email hợp lệ
 * Sử dụng regex đơn giản để đảm bảo email có cấu trúc cơ bản a@b.c
 *
 * @param {string} email
 * @returns {boolean} true nếu valid, false nếu không
 */
export function isValidEmail(email) {
  // ^[^\s@]+   : ít nhất một ký tự không phải khoảng trắng và @
  // @[^\s@]+   : ký tự @ rồi đến ít nhất một ký tự không phải khoảng trắng và @
  // \.[^\s@]+$ : dấu chấm rồi ít nhất một ký tự không phải khoảng trắng và @ đến hết chuỗi
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Xử lý đăng nhập (Login)
 * - Kiểm tra bắt buộc phải điền đầy đủ
 * - Kiểm tra format email
 * - Gọi API thật (đã tạm comment) hoặc resolve ngay để test local
 *
 * @param {{email: string, password: string}} creds
 * @throws Error nếu thiếu trường hoặc format email không hợp lệ
 * @returns {Promise<void>}
 */
export async function login({ email, password }) {
  if (!email || !password) {
    throw new Error('Please fill in all fields');
  }
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  // ---------- PHẦN GỌI API THẬT ----------
  const apiUrl = 'https://se_backend.hrzn.run/public_apiauth/login';
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "email": "your-email@example.com",
        "password": "yourpassword"
      })
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
 * Xử lý đăng ký (Sign Up)
 * - Kiểm tra bắt buộc các trường
 * - Format email, confirm password khớp
 * - Gọi API thật
 *
 * @param {{username: string, email: string, password: string, confirmPassword: string}} data
 * @throws Error nếu validation không pass
 * @returns {Promise<void>}
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

  // ---------- PHẦN GỌI API THẬT ----------
  const apiUrl = 'https://se_backend.hrzn.run/public_apiauth/register';
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "username": "yourusername",
        "email": "your-email@example.com",
        "password": "yourpassword"
      })
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
 * Xử lý quên mật khẩu (Forgot Password)
 * - Kiểm tra email hợp lệ
 * - Gọi API gửi link reset
 *
 * @param {string} email
 * @throws Error nếu email không hợp lệ
 * @returns {Promise<void>}
 */
export async function forgotPassword(email) {
  if (!email || !isValidEmail(email)) {
    throw new Error('Please enter a valid email');
  }

  // ---------- PHẦN GỌI API THẬT ----------
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
