// controllers/event-form-dialog.js - FIXED VERSION

import { initDialog } from "../views/dialogView.js";
import { initEventForm } from "../views/event-form-dialogView.js";
import { initToaster } from "../views/toasterView.js";

/**
 * Controller cho dialog tạo/sửa event:
 * - Lắng nghe event-create-request và event-edit-request
 * - Thay đổi tiêu đề dialog, chuyển form sang đúng mode và mở dialog
 * - Đóng dialog khi form phát ra sự kiện tạo/sửa
 */
export function initEventFormController() {
  const { dialogElement, open, close } = initDialog("event-form");
  const toaster = initToaster(dialogElement);
  const eventForm = initEventForm(toaster);
  const titleEl = dialogElement.querySelector("[data-dialog-title]");
  
  // FIX: Kiểm tra eventForm có tồn tại không
  if (!eventForm || !eventForm.formElement) {
    console.error("Event form initialization failed");
    return;
  }

  document.addEventListener("event-create-request", e => {
    titleEl.textContent = "Create event";
    eventForm.switchToCreateMode(
      e.detail.date,
      e.detail.startTime,
      e.detail.endTime
    );
    populateTimeDropdowns(); // Add this line to populate time dropdowns
    open();
  });

  document.addEventListener("event-edit-request", e => {
    titleEl.textContent = "Edit event";
    eventForm.switchToEditMode(e.detail.event);
    populateTimeDropdowns(); // Add this line to populate time dropdowns
    open();
  });

  dialogElement.addEventListener("close", () => {
    eventForm.reset();
  });

  eventForm.formElement.addEventListener("event-create", () => {
    close();
  });

  eventForm.formElement.addEventListener("event-edit", () => {
    close();
  });
  
  /**
   * Populate time dropdowns in the event form dialog
   * This fixes the empty time dropdowns in the Create event modal
   */
  function populateTimeDropdowns() {
    const startTimeSelect = dialogElement.querySelector('#start-time');
    const endTimeSelect = dialogElement.querySelector('#end-time');
    
    // If dropdowns don't exist or are already populated, do nothing
    if (!startTimeSelect || !endTimeSelect || startTimeSelect.options.length > 1) {
      return;
    }
    
    // Clear existing options (keeping only placeholder if exists)
    while (startTimeSelect.options.length > 0) {
      startTimeSelect.remove(0);
    }
    
    while (endTimeSelect.options.length > 0) {
      endTimeSelect.remove(0);
    }
    
    // Create time options for every 30 minutes (48 options in a day)
    const timeOptions = [];
    
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        // Calculate minutes since midnight
        const minutesSinceMidnight = hour * 60 + minute;
        
        // Format display time (12-hour with AM/PM)
        const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
        const ampm = hour < 12 ? 'AM' : 'PM';
        const displayMinute = minute === 0 ? '00' : '30';
        const displayTime = `${displayHour}:${displayMinute} ${ampm}`;
        
        timeOptions.push({
          value: minutesSinceMidnight,
          text: displayTime
        });
      }
    }
    
    // Add options to start time dropdown
    timeOptions.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.text;
      startTimeSelect.appendChild(optionElement);
    });
    
    // Add options to end time dropdown (excluding the first option for end time)
    timeOptions.slice(1).forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.text;
      endTimeSelect.appendChild(optionElement);
    });
    
    // Add 11:59 PM (end of day) option to end time only
    const endOfDayOption = document.createElement('option');
    endOfDayOption.value = 24 * 60 - 1; // 1439 minutes (23:59)
    endOfDayOption.textContent = '11:59 PM';
    endTimeSelect.appendChild(endOfDayOption);
    
    // Set default times (e.g., current time rounded to nearest 30 min for start,
    // and 1 hour later for end)
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const roundedMinutes = Math.ceil(currentMinutes / 30) * 30;
    
    // Find closest available time
    let closestStartIndex = 0;
    let minDiff = Infinity;
    
    timeOptions.forEach((option, index) => {
      const diff = Math.abs(option.value - roundedMinutes);
      if (diff < minDiff) {
        minDiff = diff;
        closestStartIndex = index;
      }
    });
    
    // Set start time to closest time and end time to 1 hour later
    startTimeSelect.selectedIndex = closestStartIndex;
    endTimeSelect.selectedIndex = Math.min(closestStartIndex + 2, endTimeSelect.options.length - 1);
  }
}