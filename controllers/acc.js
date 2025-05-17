import accView from '../views/accView.js';

export default class AccountController {
  constructor(formId, saveIndicatorId) {
    this.form = document.getElementById(formId);
    this.saveIndicator = document.getElementById(saveIndicatorId);
    this.view = new accView();

    this._bindEvents();
  }

  _bindEvents() {
    // toggle mật khẩu
    this.view.passwordToggle.addEventListener('click', () => {
      this.view.togglePassword();
    });

    // preview avatar
    this.view.avatarInput.addEventListener('change', e => {
      this.view.previewAvatar(e.target.files[0]);
    });

    // dark mode
    this.view.darkModeToggle.addEventListener('click', () => {
      this.view.toggleDarkMode();
    });

    // submit form
    this.form.addEventListener('submit', e => {
      e.preventDefault();
      // có thể thêm validate / gọi API ở đây
      this._showSaveIndicator();
    });
  }

  _showSaveIndicator() {
    this.saveIndicator.style.display = 'block';
    setTimeout(() => {
      this.saveIndicator.style.display = 'none';
    }, 3000);
  }
}

// Khởi tạo controller khi DOM load xong
document.addEventListener('DOMContentLoaded', () => {
  new AccountController('accountForm', 'saveIndicator');
});
