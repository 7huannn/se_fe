// services/reminderService.js - Service để gọi API reminder
import { apiClient } from './api.js';

export class ReminderService {
  /**
   * Tạo reminder mới cho event
   * @param {number} eventId - ID của event
   * @param {Object} reminderData - Dữ liệu reminder
   * @returns {Promise<Object>} Response từ API
   */
  async createReminder(eventId, reminderData) {
    try {
      const response = await apiClient.post(`/api/events/${eventId}/reminders/`, reminderData);
      
      return {
        success: true,
        message: 'Reminder created successfully',
        reminder: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Lấy thông tin reminder
   * @param {number} eventId - ID của event
   * @param {number} reminderId - ID của reminder
   * @returns {Promise<Object>} Response từ API
   */
  async getReminder(eventId, reminderId) {
    try {
      const response = await apiClient.get(`/api/events/${eventId}/reminders/${reminderId}`);
      
      return {
        success: true,
        reminder: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Cập nhật reminder
   * @param {number} eventId - ID của event
   * @param {number} reminderId - ID của reminder
   * @param {Object} reminderData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Response từ API
   */
  async updateReminder(eventId, reminderId, reminderData) {
    try {
      const response = await apiClient.put(`/api/events/${eventId}/reminders/${reminderId}`, reminderData);
      
      return {
        success: true,
        message: 'Reminder updated successfully',
        reminder: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Xóa reminder
   * @param {number} eventId - ID của event
   * @param {number} reminderId - ID của reminder
   * @returns {Promise<Object>} Response từ API
   */
  async deleteReminder(eventId, reminderId) {
    try {
      await apiClient.delete(`/api/events/${eventId}/reminders/${reminderId}`);
      
      return {
        success: true,
        message: 'Reminder deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Chuyển đổi thời gian từ minutes sang định dạng HH:MM:SS
   * @param {number} minutes - Số phút trước event
   * @returns {string} Thời gian theo định dạng HH:MM:SS
   */
  formatMinutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
  }

  /**
   * Chuyển đổi thời gian từ HH:MM:SS sang minutes
   * @param {string} timeString - Thời gian theo định dạng HH:MM:SS
   * @returns {number} Số phút
   */
  parseTimeToMinutes(timeString) {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Lấy danh sách tùy chọn thời gian nhắc nhở phổ biến
   * @returns {Array<Object>} Danh sách các tùy chọn
   */
  getCommonReminderOptions() {
    return [
      { label: '5 minutes before', value: '00:05:00', minutes: 5 },
      { label: '10 minutes before', value: '00:10:00', minutes: 10 },
      { label: '15 minutes before', value: '00:15:00', minutes: 15 },
      { label: '30 minutes before', value: '00:30:00', minutes: 30 },
      { label: '1 hour before', value: '01:00:00', minutes: 60 },
      { label: '2 hours before', value: '02:00:00', minutes: 120 },
      { label: '1 day before', value: '24:00:00', minutes: 1440 },
      { label: 'Custom', value: 'custom', minutes: null }
    ];
  }
}

// Tạo singleton instance
export const reminderService = new ReminderService();