// views/loginView.js
import {
  login,
  signup,
  forgotPassword,
  isValidEmail
} from '../controllers/login.js';

export function initLoginView() {
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');

    // toggle SignUp/SignIn
    if (registerBtn && loginBtn && container) {
      registerBtn.addEventListener('click', () => container.classList.add('active'));
      loginBtn.addEventListener('click', () => container.classList.remove('active'));
    }

    //-------------------------------- SIGN UP --------------------------------
    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
      signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = signUpForm.querySelector('#signUpUsername').value.trim();
        const email = signUpForm.querySelector('#signUpEmail').value.trim();
        const password = signUpForm.querySelector('#signUpPassword').value;
        const confirmPassword = signUpForm.querySelector('#confirmPassword').value;

        try {
          await signup({ username, email, password, confirmPassword });
          alert('Sign up successful!');
          container.classList.remove('active'); // trở về Sign In
          signUpForm.reset();
        } catch (err) {
          alert(err.message);
        }
      });
    }

    //-------------------------------- SIGN IN --------------------------------
    const signInForm = document.getElementById('signInForm');
    if (signInForm) {
      signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = signInForm.querySelector('#loginEmail').value.trim();
        const password = signInForm.querySelector('#loginPassword').value;

        try {
          await login({ email, password });
          alert('Login successful!');
          window.location.href = '../public/index.html';
        } catch (err) {
          alert(err.message);
        }
      });
    }

    //------------------------------ FORGOT PASSWORD ----------------------------
    const showForgot = document.getElementById('showForgotPassword');
    const backToLogin = document.getElementById('backToLogin');
    const forgotBox = document.querySelector('.forgot-password');
    const signInBox = document.querySelector('.sign-in');

    if (showForgot && backToLogin && forgotBox && signInBox) {
      showForgot.addEventListener('click', (e) => {
        e.preventDefault();
        container.classList.add('forgot-mode');
      });
      backToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        container.classList.remove('forgot-mode');
      });
    }

    //------------------------------ FORGOT PASSWORD FORM ------------------------
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) {
      forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = forgotForm.querySelector('#forgotEmail').value.trim();
        try {
          await forgotPassword(email);
          alert('A reset link has been sent to your email.');
          forgotForm.reset();
        } catch (err) {
          alert(err.message);
        }
      });
    }
  });
}

initLoginView();
