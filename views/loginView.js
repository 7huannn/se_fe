// views/loginView.js
import {
    login,
    signup,
    forgotPassword,
    isValidEmail
  } from '../controllers/login.js';
  
  /**
   * Khởi tạo giao diện đăng nhập/đăng ký/quên mật khẩu
   */
  export function initLoginView() {
    document.addEventListener('DOMContentLoaded', function () {
      const container = document.getElementById('container');
      const registerBtn = document.getElementById('register');
      const loginBtn = document.getElementById('login');
      const showForgotLink = document.getElementById('showForgotPassword');
      const backToLoginLink = document.getElementById('backToLogin');
      const forgotFormContainer = document.querySelector('.forgot-password');
      const signInContainer = document.querySelector('.sign-in');
      
      if (showForgotLink && backToLoginLink && forgotFormContainer && signInContainer) {
  
        forgotFormContainer.style.display = "";
  
        showForgotLink.addEventListener("click", (e) => {
          e.preventDefault();
          container.classList.remove("active");       // Tắt toggle slide
          container.classList.add("forgot-mode");     // Hiện form quên mật khẩu
        });
    
        backToLoginLink.addEventListener("click", (e) => {
          e.preventDefault();
          container.classList.remove("forgot-mode");  // Ẩn form quên mật khẩu
          container.classList.add("active");          // Quay lại form login
        });
      }
  
      if (registerBtn && loginBtn && container) {
        registerBtn.addEventListener('click', () => {
          container.classList.add("active");
        });
  
        loginBtn.addEventListener('click', () => {
          container.classList.remove("active");
        });
      }
  
      //------------------------------------------SIGN IN------------------------------------------------------
      const signInForm = document.querySelector('.sign-in form');
  
      if (signInForm) {
        signInForm.addEventListener('submit', async (event) => {
          event.preventDefault();
  
          const email = signInForm.querySelector('input[type="email"]').value;
          const password = signInForm.querySelector('input[type="password"]').value;
  
          try {
            await login({ email, password });
            alert('Login successful! (Local test mode)');
            window.location.href = '../public/index.html';
          } catch (error) {
            alert(error.message);
          }
        });
      }
  
      //------------------------------------------SIGN UP------------------------------------------------------
      const signUpForm = document.querySelector('.sign-up form');
  
      if (signUpForm) {
        signUpForm.addEventListener('submit', async (event) => {
          event.preventDefault();
  
          const email = signUpForm.querySelector('input[type="email"]').value;
          const password = signUpForm.querySelector('input[type="password"]').value;
          const confirmPassword = document.getElementById("confirmPassword").value;
  
          try {
            await signup({ email, password, confirmPassword });
            alert("Sign up successful! (Local test mode)");
            container.classList.remove("active");
          } catch (error) {
            alert(error.message);
          }
        });
      }
  
      //------------------------------------------FORGOT PASSWORD------------------------------------------------------
      const forgotForm = document.getElementById("forgotPasswordForm");
  
      if (forgotForm) {
        forgotForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const email = document.getElementById("forgotEmail").value.trim();
  
          try {
            await forgotPassword(email);
            alert("A reset link has been sent to your email (simulated).");
            forgotForm.reset();
          } catch (error) {
            alert(error.message);
          }
        });
      }
    });
  }
initLoginView();