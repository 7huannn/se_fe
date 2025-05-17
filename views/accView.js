export default class AccountView {
  constructor() {
    this.passwordInput    = document.getElementById('password');
    this.passwordToggle   = document.getElementById('passwordToggle');
    this.avatarInput      = document.getElementById('avatar');
    this.avatarPreview    = document.getElementById('avatarPreview');
    this.darkModeToggle   = document.getElementById('darkModeToggle');
    this.body             = document.body;
  }

  togglePassword() {
    const isPwd = this.passwordInput.type === 'password';
    this.passwordInput.type = isPwd ? 'text' : 'password';
    this.passwordToggle.classList.toggle('fa-eye');
    this.passwordToggle.classList.toggle('fa-eye-slash');
  }

  previewAvatar(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      this.avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
    };
    reader.readAsDataURL(file);
  }

  toggleDarkMode() {
    this.body.classList.toggle('dark-mode');
    // cập nhật icon và thay đổi CSS variables
    if (this.body.classList.contains('dark-mode')) {
      this.darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      document.documentElement.style.setProperty('--text-color', '#f8f9fa');
      document.documentElement.style.setProperty('--light-color', '#2c3e50');
      document.documentElement.style.setProperty('--border-color', '#4d5b6a');
      this.body.style.backgroundColor = '#1a2332';
      this._setBgColor('.account-card, .form-control', '#2c3e50', '#f8f9fa');
    } else {
      this.darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      document.documentElement.style.setProperty('--text-color', '#333');
      document.documentElement.style.setProperty('--light-color', '#f8f9fa');
      document.documentElement.style.setProperty('--border-color', '#e0e0e0');
      this.body.style.backgroundColor = '#f5f7fa';
      this._setBgColor('.account-card, .form-control', '#fff', '#333');
    }
  }

  _setBgColor(selector, bg, color) {
    document.querySelectorAll(selector).forEach(el => {
      el.style.backgroundColor = bg;
      el.style.color = color;
    });
  }
}
