// controllers/event-form-dialog.js - FIXED VERSION

import { initDialog } from "../views/dialogView.js";
import { initToaster } from "../views/toasterView.js";

/**
 * Initialize the event form dialog controller
 * This replaces the broken event-form-dialog.js file
 */
export function initEventFormController() {
  console.log("Initializing Event Form Controller");
  
  // Get the dialog element
  const dialogElement = document.querySelector("[data-dialog='event-form']");
  if (!dialogElement) {
    console.error("Event form dialog not found");
    return;
  }

  // Initialize the dialog
  const dialog = initDialog("event-form");
  
  // Initialize toaster for feedback
  const toaster = initToaster(document.body);
  
  // Get form element
  const formElement = dialogElement.querySelector("[data-event-form]");
  if (!formElement) {
    console.error("Event form element not found");
    return;
  }

  let currentMode = "create";

  // Form submission handler
  formElement.addEventListener("submit", (e) => {
    e.preventDefault();
    handleFormSubmit();
  });

  // Listen for create event requests
  document.addEventListener("event-create-request", (e) => {
    const { date, startTime, endTime } = e.detail;
    switchToCreateMode(date, startTime, endTime);
    dialog.open();
  });

  // Listen for edit event requests
  document.addEventListener("event-edit-request", (e) => {
    const { event } = e.detail;
    switchToEditMode(event);
    dialog.open();
  });

  // Listen for dialog close
  document.addEventListener("dialog-close", () => {
    resetForm();
  });

  /**
   * Handle form submission
   */
  function handleFormSubmit() {
    const formData = getFormData();
    
    // Basic validation
    if (!formData.title.trim()) {
      toaster.error("Event title is required");
      return;
    }

    if (!formData.date) {
      toaster.error("Event date is required");
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toaster.error("End time must be after start time");
      return;
    }

    // Create event object
    const eventData = {
      id: currentMode === "create" ? generateEventId() : parseInt(formData.id),
      title: formData.title.trim(),
      date: new Date(formData.date),
      startTime: parseInt(formData.startTime),
      endTime: parseInt(formData.endTime),
      color: formData.color || "#2563eb"
    };

    // Dispatch appropriate event
    const eventType = currentMode === "create" ? "event-create" : "event-edit";
    document.dispatchEvent(new CustomEvent(eventType, {
      detail: { event: eventData },
      bubbles: true
    }));

    toaster.success(`Event ${currentMode === "create" ? "created" : "updated"} successfully!`);
    dialog.close();
  }

  /**
   * Get form data
   */
  function getFormData() {
    return {
      id: formElement.querySelector("#id")?.value,
      title: formElement.querySelector("#title")?.value || "",
      date: formElement.querySelector("#date")?.value || "",
      startTime: formElement.querySelector("#start-time")?.value || "600",
      endTime: formElement.querySelector("#end-time")?.value || "660",
      color: formElement.querySelector(".color-select__input:checked")?.value || "#2563eb"
    };
  }

  /**
   * Switch to create mode
   */
  function switchToCreateMode(date, startTime, endTime) {
    currentMode = "create";
    
    const titleInput = formElement.querySelector("#title");
    const dateInput = formElement.querySelector("#date");
    const startTimeInput = formElement.querySelector("#start-time");
    const endTimeInput = formElement.querySelector("#end-time");
    const colorInputs = formElement.querySelectorAll(".color-select__input");

    if (titleInput) titleInput.value = "";
    if (dateInput) dateInput.value = date.toISOString().slice(0, 10);
    if (startTimeInput) startTimeInput.value = startTime;
    if (endTimeInput) endTimeInput.value = endTime;
    if (colorInputs.length > 0) colorInputs[0].checked = true;

    populateTimeOptions();
  }

  /**
   * Switch to edit mode
   */
  function switchToEditMode(eventData) {
    currentMode = "edit";
    
    const idInput = formElement.querySelector("#id");
    const titleInput = formElement.querySelector("#title");
    const dateInput = formElement.querySelector("#date");
    const startTimeInput = formElement.querySelector("#start-time");
    const endTimeInput = formElement.querySelector("#end-time");
    const colorInputs = formElement.querySelectorAll(".color-select__input");

    if (idInput) idInput.value = eventData.id;
    if (titleInput) titleInput.value = eventData.title;
    if (dateInput) dateInput.value = eventData.date.toISOString().slice(0, 10);
    if (startTimeInput) startTimeInput.value = eventData.startTime;
    if (endTimeInput) endTimeInput.value = eventData.endTime;

    const matchedColor = Array.from(colorInputs).find(inp => inp.value === eventData.color);
    if (matchedColor) matchedColor.checked = true;

    populateTimeOptions();
  }

  /**
   * Reset form
   */
  function resetForm() {
    formElement.reset();
    currentMode = "create";
  }

  /**
   * Populate time options
   */
  function populateTimeOptions() {
    const startTimeSelect = formElement.querySelector('#start-time');
    const endTimeSelect = formElement.querySelector('#end-time');
    
    if (!startTimeSelect || !endTimeSelect) return;
    
    // Clear existing options except the first (if any)
    while (startTimeSelect.options.length > 1) {
      startTimeSelect.remove(1);
    }
    
    while (endTimeSelect.options.length > 1) {
      endTimeSelect.remove(1);
    }
    
    // Create time options for every 30 minutes
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const minutesSinceMidnight = hour * 60 + minute;
        const displayHour = hour % 12 || 12;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const displayMinute = minute === 0 ? '00' : '30';
        const displayTime = `${displayHour}:${displayMinute} ${ampm}`;
        
        // Add to start time
        const startOption = document.createElement('option');
        startOption.value = minutesSinceMidnight;
        startOption.textContent = displayTime;
        startTimeSelect.appendChild(startOption);
        
        // Add to end time (skip midnight for end time)
        if (minutesSinceMidnight > 0) {
          const endOption = document.createElement('option');
          endOption.value = minutesSinceMidnight;
          endOption.textContent = displayTime;
          endTimeSelect.appendChild(endOption);
        }
      }
    }
  }

  /**
   * Generate unique event ID
   */
  function generateEventId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  console.log("Event Form Controller initialized successfully");
}