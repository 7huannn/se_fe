// controllers/event-form.js - FIXED MVC COMPLIANT VERSION

import { EventModel } from "../models/event.js";

/**
 * Controller chỉ chịu trách nhiệm điều phối giữa Model và View
 * Xử lý user interaction và business flow
 * Không thao tác DOM trực tiếp
 */
export function initEventFormController(eventForm) {
  if (!eventForm || !eventForm.formElement) {
    console.error("Event form not provided or invalid");
    return;
  }

  let currentMode = "create";

  /**
   * Handle form submission - BUSINESS LOGIC COORDINATION
   */
  function handleFormSubmit(formData) {
    try {
      // Validate form data using Model
      const validationResult = EventModel.validateFormData(formData);
      if (!validationResult.isValid) {
        eventForm.showError(validationResult.message);
        return;
      }

      // Create event object using Model
      const eventData = EventModel.createEventFromFormData(formData);
      
      // Additional validation
      const eventValidation = EventModel.validateEvent(eventData);
      if (eventValidation) {
        eventForm.showError(eventValidation);
        return;
      }

      // Dispatch appropriate event based on mode
      if (formData.mode === "create") {
        // Generate ID using Model
        eventData.id = EventModel.generateEventId();
        
        eventForm.formElement.dispatchEvent(
          new CustomEvent("event-create", { 
            detail: { event: eventData }, 
            bubbles: true 
          })
        );
        
        eventForm.showSuccess("Event created successfully!");
        
      } else if (formData.mode === "edit") {
        // Use existing ID
        eventData.id = Number(formData.id);
        
        eventForm.formElement.dispatchEvent(
          new CustomEvent("event-edit", { 
            detail: { event: eventData }, 
            bubbles: true 
          })
        );
        
        eventForm.showSuccess("Event updated successfully!");
      }
      
    } catch (error) {
      console.error('Error processing form:', error);
      eventForm.showError(error.message || 'An error occurred while processing the form');
    }
  }

  /**
   * Handle create event request
   */
  function handleCreateRequest(event) {
    currentMode = "create";
    const { date, startTime, endTime } = event.detail;
    eventForm.switchToCreateMode(date, startTime, endTime);
  }

  /**
   * Handle edit event request
   */
  function handleEditRequest(event) {
    currentMode = "edit";
    const { event: eventData } = event.detail;
    eventForm.switchToEditMode(eventData);
  }

  /**
   * Handle dialog close
   */
  function handleDialogClose() {
    eventForm.reset();
    currentMode = "create";
  }

  // Bind events
  eventForm.formElement.addEventListener("form-submit", (e) => {
    handleFormSubmit(e.detail.formData);
  });

  document.addEventListener("event-create-request", handleCreateRequest);
  document.addEventListener("event-edit-request", handleEditRequest);
  document.addEventListener("dialog-close", handleDialogClose);

  return {
    handleFormSubmit,
    handleCreateRequest,
    handleEditRequest,
    handleDialogClose,
    getCurrentMode: () => currentMode
  };
}