// views/reminderView.js - View component cho reminder

/**
 * View class cho reminder management
 */
export class ReminderView {
  constructor() {
    this.reminderModal = null;
    this.reminderForm = null;
    this.currentEventId = null;
    this.currentReminderId = null;
    this.mode = 'create'; // 'create' hoặc 'edit'
  }

  /**
   * Khởi tạo reminder view
   */
  init() {
    this.createReminderModal();
    this.bindEvents();
    this.addStyles();
  }

  /**
   * Tạo modal cho reminder
   */
  createReminderModal() {
    // Kiểm tra xem modal đã tồn tại chưa
    this.reminderModal = document.querySelector('#reminderModal');
    
    if (!this.reminderModal) {
      this.reminderModal = document.createElement('div');
      this.reminderModal.id = 'reminderModal';
      this.reminderModal.className = 'modal reminder-modal';
      this.reminderModal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="reminderModalTitle">Set Reminder</h3>
            <button class="modal-close" id="closeReminderModal">&times;</button>
          </div>
          <div class="modal-body">
            <form id="reminderForm" class="reminder-form">
              <div class="form-group">
                <label for="reminderEvent">Event:</label>
                <input type="text" id="reminderEvent" readonly class="form-control">
              </div>
              
              <div class="form-group">
                <label for="reminderTime">Remind me:</label>
                <select id="reminderTime" class="form-control" required>
                  <option value="">Select reminder time</option>
                  <option value="00:05:00">5 minutes before</option>
                  <option value="00:10:00">10 minutes before</option>
                  <option value="00:15:00">15 minutes before</option>
                  <option value="00:30:00">30 minutes before</option>
                  <option value="01:00:00">1 hour before</option>
                  <option value="02:00:00">2 hours before</option>
                  <option value="24:00:00">1 day before</option>
                  <option value="custom">Custom time</option>
                </select>
              </div>

              <div class="form-group custom-time-group" id="customTimeGroup" style="display: none;">
                <label>Custom reminder time:</label>
                <div class="custom-time-inputs">
                  <input type="number" id="customHours" min="0" max="23" placeholder="Hours" class="time-input">
                  <span>:</span>
                  <input type="number" id="customMinutes" min="0" max="59" placeholder="Minutes" class="time-input">
                  <span>before event</span>
                </div>
              </div>

              <div class="reminder-preview" id="reminderPreview" style="display: none;">
                <p><strong>Reminder will be sent at:</strong></p>
                <p id="reminderDateTime" class="reminder-time"></p>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" id="saveReminder" class="btn btn-primary">Save Reminder</button>
            <button type="button" id="cancelReminder" class="btn btn-secondary">Cancel</button>
            <button type="button" id="deleteReminder" class="btn btn-danger" style="display: none;">Delete Reminder</button>
          </div>
        </div>
      `;

      document.body.appendChild(this.reminderModal);
    }

    this.reminderForm = this.reminderModal.querySelector('#reminderForm');
  }

  /**
   * Bind các sự kiện
   */
  bindEvents() {
    // Close modal events
    const closeBtn = this.reminderModal.querySelector('#closeReminderModal');
    const cancelBtn = this.reminderModal.querySelector('#cancelReminder');
    
    closeBtn.addEventListener('click', () => this.closeModal());
    cancelBtn.addEventListener('click', () => this.closeModal());

    // Click outside modal to close
    this.reminderModal.addEventListener('click', (e) => {
      if (e.target === this.reminderModal) {
        this.closeModal();
      }
    });

    // Reminder time select change
    const reminderTimeSelect = this.reminderModal.querySelector('#reminderTime');
    reminderTimeSelect.addEventListener('change', () => this.handleReminderTimeChange());

    // Custom time inputs change
    const customHours = this.reminderModal.querySelector('#customHours');
    const customMinutes = this.reminderModal.querySelector('#customMinutes');
    
    customHours.addEventListener('input', () => this.updateReminderPreview());
    customMinutes.addEventListener('input', () => this.updateReminderPreview());

    // Save reminder button
    const saveBtn = this.reminderModal.querySelector('#saveReminder');
    saveBtn.addEventListener('click', () => this.handleSaveReminder());

    // Delete reminder button
    const deleteBtn = this.reminderModal.querySelector('#deleteReminder');
    deleteBtn.addEventListener('click', () => this.handleDeleteReminder());
  }

  /**
   * Xử lý thay đổi thời gian nhắc nhở
   */
  handleReminderTimeChange() {
    const reminderTimeSelect = this.reminderModal.querySelector('#reminderTime');
    const customTimeGroup = this.reminderModal.querySelector('#customTimeGroup');
    
    if (reminderTimeSelect.value === 'custom') {
      customTimeGroup.style.display = 'block';
    } else {
      customTimeGroup.style.display = 'none';
      this.updateReminderPreview();
    }
  }

  /**
   * Cập nhật preview thời gian nhắc nhở
   */
  updateReminderPreview() {
    const reminderTimeSelect = this.reminderModal.querySelector('#reminderTime');
    const customHours = this.reminderModal.querySelector('#customHours');
    const customMinutes = this.reminderModal.querySelector('#customMinutes');
    const reminderPreview = this.reminderModal.querySelector('#reminderPreview');
    const reminderDateTime = this.reminderModal.querySelector('#reminderDateTime');

    let beforeEvent = reminderTimeSelect.value;

    // Nếu là custom time
    if (beforeEvent === 'custom') {
      const hours = parseInt(customHours.value) || 0;
      const minutes = parseInt(customMinutes.value) || 0;
      
      if (hours === 0 && minutes === 0) {
        reminderPreview.style.display = 'none';
        return;
      }

      beforeEvent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    }

    if (beforeEvent && beforeEvent !== 'custom' && this.currentEventData) {
      try {
        // Tính toán thời gian nhắc nhở
        const eventStartTime = new Date(this.currentEventData.start_time);
        const [hours, minutes, seconds] = beforeEvent.split(':').map(Number);
        const reminderTime = new Date(eventStartTime.getTime() - ((hours * 60 + minutes) * 60 * 1000));

        reminderDateTime.textContent = reminderTime.toLocaleString();
        reminderPreview.style.display = 'block';
      } catch (error) {
        reminderPreview.style.display = 'none';
      }
    } else {
      reminderPreview.style.display = 'none';
    }
  }

  /**
   * Mở modal tạo reminder mới
   * @param {Object} eventData - Dữ liệu event
   */
  openCreateModal(eventData) {
    this.mode = 'create';
    this.currentEventId = eventData.id;
    this.currentEventData = eventData;
    this.currentReminderId = null;

    // Cập nhật tiêu đề và form
    this.reminderModal.querySelector('#reminderModalTitle').textContent = 'Set Reminder';
    this.reminderModal.querySelector('#reminderEvent').value = eventData.title;
    this.reminderModal.querySelector('#deleteReminder').style.display = 'none';

    // Reset form
    this.resetForm();
    
    // Hiển thị modal
    this.showModal();
  }

  /**
   * Mở modal chỉnh sửa reminder
   * @param {Object} eventData - Dữ liệu event
   * @param {Object} reminderData - Dữ liệu reminder
   */
  openEditModal(eventData, reminderData) {
    this.mode = 'edit';
    this.currentEventId = eventData.id;
    this.currentEventData = eventData;
    this.currentReminderId = reminderData.id;

    // Cập nhật tiêu đề và form
    this.reminderModal.querySelector('#reminderModalTitle').textContent = 'Edit Reminder';
    this.reminderModal.querySelector('#reminderEvent').value = eventData.title;
    this.reminderModal.querySelector('#deleteReminder').style.display = 'inline-block';

    // Fill form với dữ liệu reminder
    this.fillForm(reminderData);
    
    // Hiển thị modal
    this.showModal();
  }

  /**
   * Fill form với dữ liệu reminder
   * @param {Object} reminderData - Dữ liệu reminder
   */
  fillForm(reminderData) {
    const reminderTimeSelect = this.reminderModal.querySelector('#reminderTime');
    const customHours = this.reminderModal.querySelector('#customHours');
    const customMinutes = this.reminderModal.querySelector('#customMinutes');

    // Tìm option phù hợp hoặc set custom
    const beforeEvent = reminderData.before_event;
    const option = reminderTimeSelect.querySelector(`option[value="${beforeEvent}"]`);

    if (option) {
      reminderTimeSelect.value = beforeEvent;
    } else {
      // Custom time
      reminderTimeSelect.value = 'custom';
      const [hours, minutes] = beforeEvent.split(':').map(Number);
      customHours.value = hours;
      customMinutes.value = minutes;
    }

    this.handleReminderTimeChange();
    this.updateReminderPreview();
  }

  /**
   * Reset form về trạng thái ban đầu
   */
  resetForm() {
    this.reminderForm.reset();
    this.reminderModal.querySelector('#customTimeGroup').style.display = 'none';
    this.reminderModal.querySelector('#reminderPreview').style.display = 'none';
  }

  /**
   * Hiển thị modal
   */
  showModal() {
    this.reminderModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  /**
   * Đóng modal
   */
  closeModal() {
    this.reminderModal.style.display = 'none';
    document.body.style.overflow = '';
    this.resetForm();
  }

  /**
   * Xử lý lưu reminder
   */
  handleSaveReminder() {
    const reminderTimeSelect = this.reminderModal.querySelector('#reminderTime');
    const customHours = this.reminderModal.querySelector('#customHours');
    const customMinutes = this.reminderModal.querySelector('#customMinutes');

    let beforeEvent = reminderTimeSelect.value;

    // Validation
    if (!beforeEvent) {
      this.showError('Please select reminder time');
      return;
    }

    if (beforeEvent === 'custom') {
      const hours = parseInt(customHours.value) || 0;
      const minutes = parseInt(customMinutes.value) || 0;
      
      if (hours === 0 && minutes === 0) {
        this.showError('Please enter valid custom time');
        return;
      }

      beforeEvent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    }

    // Dispatch event cho controller
    const eventType = this.mode === 'create' ? 'reminder-create' : 'reminder-update';
    document.dispatchEvent(new CustomEvent(eventType, {
      detail: {
        eventId: this.currentEventId,
        reminderId: this.currentReminderId,
        reminderData: {
          before_event: beforeEvent
        }
      },
      bubbles: true
    }));
  }

  /**
   * Xử lý xóa reminder
   */
  handleDeleteReminder() {
    if (confirm('Are you sure you want to delete this reminder?')) {
      document.dispatchEvent(new CustomEvent('reminder-delete', {
        detail: {
          eventId: this.currentEventId,
          reminderId: this.currentReminderId
        },
        bubbles: true
      }));
    }
  }

  /**
   * Hiển thị thông báo lỗi
   * @param {string} message - Thông báo lỗi
   */
  showError(message) {
    // Tạo hoặc cập nhật thông báo lỗi
    let errorDiv = this.reminderModal.querySelector('.error-message');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      this.reminderModal.querySelector('.modal-body').prepend(errorDiv);
    }

    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 3000);
  }

  /**
   * Thêm CSS styles
   */
  addStyles() {
    if (document.getElementById('reminder-styles')) return;

    const styleEl = document.createElement('style');
    styleEl.id = 'reminder-styles';
    styleEl.textContent = `
      .reminder-modal .modal-content {
        max-width: 500px;
        margin: 5% auto;
      }

      .reminder-form .form-group {
        margin-bottom: 1rem;
      }

      .reminder-form label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      .reminder-form .form-control {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }

      .custom-time-inputs {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .time-input {
        width: 80px;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        text-align: center;
      }

      .reminder-preview {
        background-color: #f8f9fa;
        padding: 1rem;
        border-radius: 4px;
        border-left: 4px solid #007bff;
        margin-top: 1rem;
      }

      .reminder-preview p {
        margin: 0;
      }

      .reminder-time {
        font-size: 16px;
        color: #007bff;
        font-weight: 500;
      }

      .error-message {
        background-color: #f8d7da;
        color: #721c24;
        padding: 0.75rem;
        border-radius: 4px;
        margin-bottom: 1rem;
        display: none;
      }

      .modal-footer .btn {
        margin-left: 0.5rem;
      }

      .btn-danger {
        background-color: #dc3545;
        border-color: #dc3545;
        color: white;
      }

      .btn-danger:hover {
        background-color: #c82333;
        border-color: #bd2130;
      }
    `;

    document.head.appendChild(styleEl);
  }
}

// Export singleton instance
export const reminderView = new ReminderView();