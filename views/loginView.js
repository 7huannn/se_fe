// views/loginView.js
import {
  login,
  signup,
  forgotPassword,
  isValidEmail,
  socialAuthRedirect
} from '../controllers/login.js';

export function initLoginView() {
  document.addEventListener('DOMContentLoaded', () => {
    const container    = document.getElementById('container');
    const registerBtn  = document.getElementById('register');
    const loginBtn     = document.getElementById('login');
    const showForgot   = document.getElementById('showForgotPassword');
    const backToLogin  = document.getElementById('backToLogin');

    // --- Toggle Sign Up / Sign In ---
    registerBtn?.addEventListener('click', () => container.classList.add('active'));
    loginBtn?.addEventListener('click',    () => container.classList.remove('active'));

    // --- Toggle Forgot Password ---
    showForgot?.addEventListener('click', e => {
      e.preventDefault();
      container.classList.add('forgot-mode');
    });
    backToLogin?.addEventListener('click', e => {
      e.preventDefault();
      container.classList.remove('forgot-mode');
    });

    // --- Social OAuth buttons ---
    ['google', 'facebook', 'github', 'linkedin'].forEach(provider => {
      const upBtn = document.getElementById(`${provider}SignUp`);
      const inBtn = document.getElementById(`${provider}SignIn`);
      upBtn?.addEventListener('click', e => {
        e.preventDefault();
        socialAuthRedirect(provider);
      });
      inBtn?.addEventListener('click', e => {
        e.preventDefault();
        socialAuthRedirect(provider);
      });
    });

    // --- Sign Up Form ---
    const signUpForm = document.getElementById('signUpForm');
    signUpForm?.addEventListener('submit', async e => {
      e.preventDefault();
      const username       = document.getElementById('signUpUsername').value.trim();
      const email          = document.getElementById('signUpEmail').value.trim();
      const password       = document.getElementById('signUpPassword').value;
      const confirmPassword= document.getElementById('confirmPassword').value;
      try {
        if (!username)                            throw new Error('Username is required');
        if (!isValidEmail(email))                 throw new Error('Invalid email address');
        await signup({ username, email, password, confirmPassword });
        alert('Sign up successful!');
        container.classList.remove('active');     // về lại Sign In
        signUpForm.reset();
      } catch (err) {
        alert(err.message);
      }
    });

    // --- Sign In Form ---
    const signInForm = document.getElementById('signInForm');
    signInForm?.addEventListener('submit', async e => {
      e.preventDefault();
      const email    = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      try {
        if (!isValidEmail(email)) throw new Error('Invalid email address');
        await login({ email, password });
        alert('Login successful!');
        window.location.href = 'index.html';
      } catch (err) {
        alert(err.message);
      }
    });

    // --- Forgot Password Form ---
    const forgotForm = document.getElementById('forgotPasswordForm');
    forgotForm?.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('forgotEmail').value.trim();
      try {
        if (!isValidEmail(email)) throw new Error('Invalid email address');
        await forgotPassword(email);
        alert('A reset link has been sent to your email.');
        forgotForm.reset();
        container.classList.remove('forgot-mode');
      } catch (err) {
        alert(err.message);
      }
    });
  });
}

initLoginView();
