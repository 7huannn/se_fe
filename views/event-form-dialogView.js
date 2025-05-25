// views/event-form-dialogView.js - FIXED MVC COMPLIANT VERSION

/**
 * View chỉ chịu trách nhiệm về presentation và DOM manipulation
 * Không chứa business logic, validation, hoặc data processing
 */
export function initEventForm(toaster) {
  const formElement = document.querySelector("[data-event-form]");
  
  if (!formElement) {
    console.error("Event form element not found");
    return null;
  }
  
  const titleInput = formElement.querySelector("#title");
  const dateInput = formElement.querySelector("#date");
  const startInput = formElement.querySelector("#start-time");
  const endInput = formElement.querySelector("#end-time");
  const colorInputs = formElement.querySelectorAll(".color-select__input");

  /**
   * Populate time options in dropdowns - MOVED FROM CONTROLLER
   * This is pure DOM manipulation, belongs in View
   */
  function populateTimeOptions() {
    const startTimeSelect = formElement.querySelector('#start-time');
    const endTimeSelect = formElement.querySelector('#end-time');
    
    if (!startTimeSelect || !endTimeSelect || startTimeSelect.options.length > 1) {
      return;
    }
    
    // Clear existing options
    while (startTimeSelect.options.length > 0) {
      startTimeSelect.remove(0);
    }
    
    while (endTimeSelect.options.length > 0) {
      endTimeSelect.remove(0);
    }
    
    // Create time options for every 30 minutes
    const timeOptions = [];
    
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const minutesSinceMidnight = hour * 60 + minute;
        const displayHour = hour % 12 || 12;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const displayMinute = minute === 0 ? '00' : '30';
        const displayTime = `${displayHour}:${displayMinute} ${ampm}`;
        
        timeOptions.push({
          value: minutesSinceMidnight,
          text: displayTime
        });
      }
    }
    
    // Add options to dropdowns
    timeOptions.forEach(option => {
      const startOption = document.createElement('option');
      startOption.value = option.value;
      startOption.textContent = option.text;
      startTimeSelect.appendChild(startOption);
    });
    
    timeOptions.slice(1).forEach(option => {
      const endOption = document.createElement('option');
      endOption.value = option.value;
      endOption.textContent = option.text;
      endTimeSelect.appendChild(endOption);
    });
    
    // Add end of day option
    const endOfDayOption = document.createElement('option');
    endOfDayOption.value = 24 * 60 - 1;
    endOfDayOption.textContent = '11:59 PM';
    endTimeSelect.appendChild(endOfDayOption);
    
    // Set default times
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const roundedMinutes = Math.ceil(currentMinutes / 30) * 30;
    
    let closestStartIndex = 0;
    let minDiff = Infinity;
    
    timeOptions.forEach((option, index) => {
      const diff = Math.abs(option.value - roundedMinutes);
      if (diff < minDiff) {
        minDiff = diff;
        closestStartIndex = index;
      }
    });
    
    startTimeSelect.selectedIndex = closestStartIndex;
    endTimeSelect.selectedIndex = Math.min(closestStartIndex + 2, endTimeSelect.options.length - 1);
  }

  /**
   * Get form data - PURE DATA COLLECTION, NO BUSINESS LOGIC
   */
  function getFormData() {
    return {
      title: titleInput ? titleInput.value.trim() : "",
      date: dateInput ? dateInput.value : "",
      startTime: startInput ? startInput.value : "",
      endTime: endInput ? endInput.value : "",
      color: formElement.querySelector(".color-select__input:checked")?.value || "#2563eb",
      mode: formElement.dataset.mode || "create",
      id: formElement.dataset.id || null
    };
  }

  /**
   * Set form to create mode - PURE UI STATE CHANGE
   */
  function switchToCreateMode(date, startTime, endTime) {
    formElement.dataset.mode = "create";
    delete formElement.dataset.id;
    
    if (titleInput) titleInput.value = "";
    if (dateInput) dateInput.value = date.toISOString().slice(0, 10);
    if (startInput) startInput.value = startTime;
    if (endInput) endInput.value = endTime;
    if (colorInputs.length > 0) colorInputs[0].checked = true;
    
    populateTimeOptions();
  }

  /**
   * Set form to edit mode - PURE UI STATE CHANGE
   */
  function switchToEditMode(eventData) {
    formElement.dataset.mode = "edit";
    formElement.dataset.id = eventData.id;
    
    if (titleInput) titleInput.value = eventData.title;
    if (dateInput) dateInput.value = eventData.date.toISOString().slice(0, 10);
    if (startInput) startInput.value = eventData.startTime;
    if (endInput) endInput.value = eventData.endTime;
    
    const matchedColor = Array.from(colorInputs).find(
      inp => inp.value === eventData.color
    );
    if (matchedColor) matchedColor.checked = true;
    
    populateTimeOptions();
  }

  /**
   * Reset form - PURE UI RESET
   */
  function reset() {
    formElement.reset();
    delete formElement.dataset.mode;
    delete formElement.dataset.id;
  }

  /**
   * Show validation error - PURE UI FEEDBACK
   */
  function showError(message) {
    if (toaster && toaster.error) {
      toaster.error(message);
    }
  }

  /**
   * Show success message - PURE UI FEEDBACK
   */
  function showSuccess(message) {
    if (toaster && toaster.success) {
      toaster.success(message);
    }
  }

  /**
   * Bind form submission - ONLY DISPATCH EVENT, NO BUSINESS LOGIC
   */
  formElement.addEventListener("submit", e => {
    e.preventDefault();
    
    // Collect form data and dispatch to controller
    const formData = getFormData();
    
    formElement.dispatchEvent(
      new CustomEvent("form-submit", { 
        detail: { formData }, 
        bubbles: true 
      })
    );
  });

  // Auto-populate time options when form is initialized
  populateTimeOptions();

  return {
    formElement,
    getFormData,
    switchToCreateMode,
    switchToEditMode,
    reset,
    showError,
    showSuccess,
    populateTimeOptions
  };
}