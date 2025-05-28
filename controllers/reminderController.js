// controllers/reminderController.js - Controller cho reminder management
import { reminderService } from '../services/reminderService.js';
import { reminderView } from '../views/reminderView.js';

/**
 * Controller cho reminder management
 */
export class ReminderController {
  constructor() {
    this.currentReminders = new Map(); // Map để lưu reminders theo eventId
  }

  /**
   * Khởi tạo reminder controller
   */
  init() {
    // Khởi tạo view
    reminderView.init();

    // Lắng nghe các sự kiện từ view
    this.bindEvents();

    // Thêm reminder button vào event details dialog
    this.addReminderButtonToEventDetails();
  }

  /**
   * Bind các sự kiện
   */
  bindEvents() {
    // Lắng nghe sự kiện tạo reminder
    document.addEventListener('reminder-create', (e) => {
      this.handleCreateReminder(e.detail);
    });

    // Lắng nghe sự kiện cập nhật reminder
    document.addEventListener('reminder-update', (e) => {
      this.handleUpdateReminder(e.detail);
    });

    // Lắng nghe sự kiện xóa reminder
    document.addEventListener('reminder-delete', (e) => {
      this.handleDeleteReminder(e.detail);
    });

    // Lắng nghe sự kiện mở reminder modal từ event details
    document.addEventListener('reminder-open', (e) => {
      this.handleOpenReminder(e.detail);
    });
  }

  /**
   * Thêm nút reminder vào event details dialog
   */
  addReminderButtonToEventDetails() {
    // Observer để theo dõi khi event details dialog được tạo
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const eventDetailsDialog = node.querySelector('[data-dialog="event-details"]') || 
                                     (node.matches && node.matches('[data-dialog="event-details"]') ? node : null);
            
            if (eventDetailsDialog) {
              this.addReminderButtonToDialog(eventDetailsDialog);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Kiểm tra dialog đã tồn tại
    const existingDialog = document.querySelector('[data-dialog="event-details"]');
    if (existingDialog) {
      this.addReminderButtonToDialog(existingDialog);
    }
  }

  /**
   * Thêm nút reminder vào dialog cụ thể
   * @param {HTMLElement} dialog - Event details dialog
   */
  addReminderButtonToDialog(dialog) {
    // Kiểm tra xem đã có nút reminder chưa
    if (dialog.querySelector('.reminder-btn')) return;

    // Tìm container cho các nút action
    let actionContainer = dialog.querySelector('.event-details-actions');
    
    if (!actionContainer) {
      // Tạo container nếu chưa có
      actionContainer = document.createElement('div');
      actionContainer.className = 'event-details-actions';
      
      // Tìm vị trí phù hợp để thêm container
      const editBtn = dialog.querySelector('[data-event-details-edit-button]');
      const deleteBtn = dialog.querySelector('[data-event-details-delete-button]');
      
      if (editBtn && deleteBtn) {
        // Tạo container chứa tất cả các nút
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'event-details-buttons';
        
        // Move existing buttons to new container
        const editBtnParent = editBtn.parentNode;
        buttonsContainer.appendChild(editBtn);
        buttonsContainer.appendChild(deleteBtn);
        
        // Add action container
        buttonsContainer.appendChild(actionContainer);
        editBtnParent.appendChild(buttonsContainer);
      } else {
        // Fallback: thêm vào cuối dialog content
        const dialogContent = dialog.querySelector('.modal-body') || dialog.querySelector('.dialog-content');
        if (dialogContent) {
          dialogContent.appendChild(actionContainer);
        }
      }
    }

    // Tạo nút reminder
    const reminderBtn = document.createElement('button');
    reminderBtn.className = 'btn btn-outline-primary reminder-btn';
    reminderBtn.type = 'button';
    reminderBtn.innerHTML = '🔔 Reminder';
    reminderBtn.title = 'Set reminder for this event';

    // Thêm sự kiện click
    reminderBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleReminderButtonClick(dialog);
    });

    actionContainer.appendChild(reminderBtn);

    // Thêm styles nếu cần
    this.addReminderButtonStyles();
  }

  /**
   * Xử lý click nút reminder trong event details
   * @param {HTMLElement} dialog - Event details dialog
   */
  handleReminderButtonClick(dialog) {
    // Lấy thông tin event từ dialog
    const eventTitle = dialog.querySelector('[data-event-details-title]')?.textContent;
    const eventDate = dialog.querySelector('[data-event-details-date]')?.textContent;
    const eventStartTime = dialog.querySelector('[data-event-details-start-time]')?.textContent;
    
    if (!eventTitle) {
      console.error('Cannot get event information from dialog');
      return;
    }

    // Tạo event data tạm thời (cần được cải thiện để lấy đầy đủ thông tin)
    const eventData = {
      id: this.getEventIdFromDialog(dialog),
      title: eventTitle,
      date: eventDate,
      start_time: this.parseEventDateTime(eventDate, eventStartTime)
    };

    // Kiểm tra xem event đã có reminder chưa
    this.checkExistingReminder(eventData);
  }

  /**
   * Lấy event ID từ dialog (cần implement dựa trên cấu trúc dialog)
   * @param {HTMLElement} dialog - Event details dialog
   */
  getEventIdFromDialog(dialog) {
    // Cần implement cách lấy event ID từ dialog
    // Có thể từ data attribute hoặc từ context khác
    return dialog.dataset.eventId || null;
  }

  /**
   * Parse thời gian event từ text
   * @param {string} dateText - Text ngày
   * @param {string} timeText - Text giờ
   */
  parseEventDateTime(dateText, timeText) {
    // Implementation để parse thời gian event
    // Trả về ISO string hoặc Date object
    try {
      const date = new Date(`${dateText} ${timeText}`);
      return date.toISOString();
    } catch (error) {
      console.error('Error parsing event date time:', error);
      return new Date().toISOString();
    }
  }

  /**
   * Kiểm tra reminder đã tồn tại cho event
   * @param {Object} eventData - Thông tin event
   */
  async checkExistingReminder(eventData) {
    if (!eventData.id) {
      // Nếu không có ID, mở modal tạo mới
      reminderView.openCreateModal(eventData);
      return;
    }

    // Kiểm tra cache local trước
    const cachedReminder = this.currentReminders.get(eventData.id);
    if (cachedReminder) {
      reminderView.openEditModal(eventData, cachedReminder);
      return;
    }

    // TODO: Gọi API để lấy reminders của event
    // Hiện tại mở modal tạo mới
    reminderView.openCreateModal(eventData);
  }

  /**
   * Xử lý tạo reminder mới
   * @param {Object} data - Dữ liệu từ event
   */
  async handleCreateReminder(data) {
    const { eventId, reminderData } = data;

    try {
      const result = await reminderService.createReminder(eventId, reminderData);

      if (result.success) {
        // Lưu vào cache
        this.currentReminders.set(eventId, result.reminder);
        
        // Đóng modal
        reminderView.closeModal();
        
        // Hiển thị thông báo thành công
        this.showToast('Reminder created successfully', 'success');
        
        // Dispatch event để cập nhật UI khác nếu cần
        document.dispatchEvent(new CustomEvent('reminder-created', {
          detail: { eventId, reminder: result.reminder },
          bubbles: true
        }));
      } else {
        this.showToast(result.message || 'Failed to create reminder', 'error');
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      this.showToast('An error occurred while creating reminder', 'error');
    }
  }

  /**
   * Xử lý cập nhật reminder
   * @param {Object} data - Dữ liệu từ event
   */
  async handleUpdateReminder(data) {
    const { eventId, reminderId, reminderData } = data;

    try {
      const result = await reminderService.updateReminder(eventId, reminderId, reminderData);

      if (result.success) {
        // Cập nhật cache
        this.currentReminders.set(eventId, result.reminder);
        
        // Đóng modal
        reminderView.closeModal();
        
        // Hiển thị thông báo thành công
        this.showToast('Reminder updated successfully', 'success');
        
        // Dispatch event để cập nhật UI khác nếu cần
        document.dispatchEvent(new CustomEvent('reminder-updated', {
          detail: { eventId, reminderId, reminder: result.reminder },
          bubbles: true
        }));
      } else {
        this.showToast(result.message || 'Failed to update reminder', 'error');
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      this.showToast('An error occurred while updating reminder', 'error');
    }
  }

  /**
   * Xử lý xóa reminder
   * @param {Object} data - Dữ liệu từ event
   */
  async handleDeleteReminder(data) {
    const { eventId, reminderId } = data;

    try {
      const result = await reminderService.deleteReminder(eventId, reminderId);

      if (result.success) {
        // Xóa khỏi cache
        this.currentReminders.delete(eventId);
        
        // Đóng modal
        reminderView.closeModal();
        
        // Hiển thị thông báo thành công
        this.showToast('Reminder deleted successfully', 'success');
        
        // Dispatch event để cập nhật UI khác nếu cần
        document.dispatchEvent(new CustomEvent('reminder-deleted', {
          detail: { eventId, reminderId },
          bubbles: true
        }));
      } else {
        this.showToast(result.message || 'Failed to delete reminder', 'error');
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      this.showToast('An error occurred while deleting reminder', 'error');
    }
  }

  /**
   * Xử lý mở reminder từ external request
   * @param {Object} data - Dữ liệu event
   */
  handleOpenReminder(data) {
    const { eventData } = data;
    this.checkExistingReminder(eventData);
  }

  /**
   * Lấy reminder cho một event
   * @param {number} eventId - ID của event
   * @returns {Object|null} Reminder data hoặc null
   */
  async getReminderForEvent(eventId) {
    // Kiểm tra cache trước
    const cachedReminder = this.currentReminders.get(eventId);
    if (cachedReminder) {
      return cachedReminder;
    }

    // TODO: Implement API call để lấy reminders của event
    // Hiện tại backend không có endpoint để list reminders theo event
    return null;
  }

  /**
   * Load tất cả reminders cho các events
   * @param {Array} eventIds - Danh sách event IDs
   */
  async loadRemindersForEvents(eventIds) {
    // TODO: Implement batch loading reminders
    // Hiện tại backend không hỗ trợ batch loading
    console.log('Loading reminders for events:', eventIds);
  }

  /**
   * Hiển thị toast notification
   * @param {string} message - Thông báo
   * @param {string} type - Loại thông báo (success, error, warning)
   */
  showToast(message, type = 'success') {
    // Tìm hoặc tạo toast container
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    // Tạo toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Thêm vào container
    toastContainer.appendChild(toast);

    // Tự động xóa sau 3 giây
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Thêm styles cho nút reminder
   */
  addReminderButtonStyles() {
    if (document.getElementById('reminder-button-styles')) return;

    const styleEl = document.createElement('style');
    styleEl.id = 'reminder-button-styles';
    styleEl.textContent = `
      .event-details-actions {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
      }

      .event-details-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
      }

      .reminder-btn {
        background: none;
        border: 1px solid #007bff;
        color: #007bff;
        padding: 0.375rem 0.75rem;
        border-radius: 0.25rem;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s;
      }

      .reminder-btn:hover {
        background-color: #007bff;
        color: white;
      }

      .reminder-btn:focus {
        outline: none;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
      }

      /* Toast styles */
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .toast {
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 14px;
        color: white;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        animation: toast-in 0.3s ease;
        min-width: 250px;
      }

      .toast-success {
        background-color: #28a745;
      }

      .toast-error {
        background-color: #dc3545;
      }

      .toast-warning {
        background-color: #ffc107;
        color: #212529;
      }

      .toast.fade-out {
        animation: toast-out 0.3s ease forwards;
      }

      @keyframes toast-in {
        from { 
          transform: translateX(100%); 
          opacity: 0; 
        }
        to { 
          transform: translateX(0); 
          opacity: 1; 
        }
      }

      @keyframes toast-out {
        from { 
          transform: translateX(0); 
          opacity: 1; 
        }
        to { 
          transform: translateX(100%); 
          opacity: 0; 
        }
      }
    `;

    document.head.appendChild(styleEl);
  }

  /**
   * Lấy event data từ current context (helper method)
   * @returns {Object|null} Event data nếu có
   */
  getCurrentEventData() {
    // Helper method để lấy event data từ context hiện tại
    // Implementation tùy thuộc vào cách ứng dụng quản lý state
    return null;
  }

  /**
   * Clear cache reminders
   */
  clearCache() {
    this.currentReminders.clear();
  }

  /**
   * Get all cached reminders
   * @returns {Map} Map of cached reminders
   */
  getCachedReminders() {
    return new Map(this.currentReminders);
  }
}

// Tạo và export singleton instance
export const reminderController = new ReminderController();

/**
 * Khởi tạo reminder controller
 */
export function initReminderController() {
  reminderController.init();
  return reminderController;
}