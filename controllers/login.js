// controllers/login.js

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

  // ---------- PHẦN GỌI API THẬT (TẠM ẨN) ----------
  // const apiUrl = 'https://your-ngrok-or-production.login.endpoint/login';
  // try {
  //   const response = await fetch(apiUrl, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ email, password })
  //   });
  //   const data = await response.json();
  //   if (!response.ok) {
  //     // API trả về lỗi
  //     throw new Error(data.message || 'Login failed');
  //   }
  //   // nếu ok thì tiếp tục flow (vd: lưu token, redirect…)
  //   return;
  // } catch (err) {
  //   // Xử lý lỗi fetch (mất mạng, server không reachable…)
  //   const msg = err.message.includes('Failed to fetch')
  //     ? 'Network error: Please check your connection.'
  //     : err.message;
  //   throw new Error(msg);
  // }

  // ----------- TEST LOCAL (KHÔNG DÙNG API) -----------
  return Promise.resolve();
}

/**
 * Xử lý đăng ký (Sign Up)
 * - Kiểm tra bắt buộc các trường
 * - Format email, confirm password khớp
 * - Gọi API thật (tạm comment) hoặc resolve ngay
 *
 * @param {{email: string, password: string, confirmPassword: string}} data
 * @throws Error nếu validation không pass
 * @returns {Promise<void>}
 */
export async function signup({ email, password, confirmPassword }) {
  if (!email || !password || !confirmPassword) {
    throw new Error('Please fill in all fields');
  }
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }
  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  // ---------- PHẦN GỌI API THỰC (TẠM ẨN) ----------
  // const apiUrl = 'https://your-ngrok-or-production.register.endpoint/register';
  // try {
  //   const response = await fetch(apiUrl, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ email, password })
  //   });
  //   const data = await response.json();
  //   if (!response.ok) {
  //     throw new Error(data.message || 'Registration failed');
  //   }
  //   return;
  // } catch (err) {
  //   const msg = err.message.includes('Failed to fetch')
  //     ? 'Network error: Please check your connection.'
  //     : err.message;
  //   throw new Error(msg);
  // }

  // ----------- TEST LOCAL (KHÔNG DÙNG API) -----------
  return Promise.resolve();
}

/**
 * Xử lý quên mật khẩu (Forgot Password)
 * - Kiểm tra email hợp lệ
 * - Gọi API gửi link reset (tạm comment) hoặc resolve ngay
 *
 * @param {string} email
 * @throws Error nếu email không hợp lệ
 * @returns {Promise<void>}
 */
export async function forgotPassword(email) {
  if (!email || !isValidEmail(email)) {
    throw new Error('Please enter a valid email');
  }

  // ---------- PHẦN GỌI API THỰC (TẠM ẨN) ----------
  // const apiUrl = 'https://your-ngrok-or-production.forgot.endpoint/forgot';
  // try {
  //   await fetch(apiUrl, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ email })
  //   });
  //   return;
  // } catch (err) {
  //   const msg = err.message.includes('Failed to fetch')
  //     ? 'Network error: Please check your connection.'
  //     : err.message;
  //   throw new Error(msg);
  // }

  // ----------- TEST LOCAL (KHÔNG DÙNG API) -----------
  return Promise.resolve();
}
