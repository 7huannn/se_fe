// views/loginView.js
import {
  login,
  signup,
  forgotPassword,
  verifyEmail,
  resendVerificationCode,
  isValidEmail,
} from '../controllers/login.js';

export function initLoginView() {
  document.addEventListener('DOMContentLoaded', () => {
    const container    = document.getElementById('container');
    const registerBtn  = document.getElementById('register');
    const loginBtn     = document.getElementById('login');
    const showForgot   = document.getElementById('showForgotPassword');
    const backToLogin  = document.getElementById('backToLogin');
    const backToSignUp = document.getElementById('backToSignUp');
    const resendCode   = document.getElementById('resendCode');

    // Store user email for verification
    let pendingVerificationEmail = '';

    // --- Toggle Sign Up / Sign In ---
    registerBtn?.addEventListener('click', () => {
      container.classList.remove('verification-mode');
      container.classList.add('active');
    });
    
    loginBtn?.addEventListener('click', () => {
      container.classList.remove('active');
      container.classList.remove('verification-mode');
    });

    // --- Toggle Forgot Password ---
    showForgot?.addEventListener('click', e => {
      e.preventDefault();
      container.classList.add('forgot-mode');
      container.classList.remove('verification-mode');
    });
    
    backToLogin?.addEventListener('click', e => {
      e.preventDefault();
      container.classList.remove('forgot-mode');
      container.classList.remove('verification-mode');
    });

    // --- Back to Sign Up from Verification ---
    backToSignUp?.addEventListener('click', e => {
      e.preventDefault();
      container.classList.remove('verification-mode');
      container.classList.add('active');
      pendingVerificationEmail = '';
    });

    // --- Resend Verification Code ---
    resendCode?.addEventListener('click', async e => {
      e.preventDefault();
      if (!pendingVerificationEmail) {
        alert('No email found for verification');
        return;
      }
      
      try {
        await resendVerificationCode(pendingVerificationEmail);
        alert('Verification code sent successfully!');
      } catch (err) {
        alert(err.message);
      }
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
        
        // Store email for verification and switch to verification mode
        pendingVerificationEmail = email;
        container.classList.remove('active');
        container.classList.add('verification-mode');
        signUpForm.reset();
        
        alert('Registration successful! Please check your email for verification token.');
      } catch (err) {
        alert(err.message);
      }
    });

    // --- Email Verification Form ---
    const emailVerificationForm = document.getElementById('emailVerificationForm');
    emailVerificationForm?.addEventListener('submit', async e => {
      e.preventDefault();
      const verificationToken = document.getElementById('verificationToken').value.trim();
      
      try {
        if (!verificationToken) throw new Error('Please enter verification token');
        if (!pendingVerificationEmail) throw new Error('No email found for verification');
        
        await verifyEmail({ email: pendingVerificationEmail, token: verificationToken });
        
        alert('Email verified successfully! You can now sign in.');
        
        // Reset and go back to sign in
        emailVerificationForm.reset();
        container.classList.remove('verification-mode');
        pendingVerificationEmail = '';
        
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

    // Auto-focus verification token input when in verification mode
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (container.classList.contains('verification-mode')) {
            setTimeout(() => {
              const tokenInput = document.getElementById('verificationToken');
              tokenInput?.focus();
            }, 300);
          }
        }
      });
    });
    
    observer.observe(container, { attributes: true });
  });
}

initLoginView();