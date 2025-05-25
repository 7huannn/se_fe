// models/event.js - ENHANCED MVC COMPLIANT VERSION

/**
 * Model chỉ chịu trách nhiệm về data và business logic
 * Không can thiệp vào UI hoặc DOM
 */

/**
 * Event Model - Pure data and business logic
 */
export class EventModel {
  /**
   * Validate form data from View
   * @param {Object} formData - Raw form data from view
   * @returns {Object} validation result
   */
  static validateFormData(formData) {
    if (!formData.title || !formData.title.trim()) {
      return {
        isValid: false,
        message: 'Event title is required'
      };
    }

    if (!formData.date) {
      return {
        isValid: false,
        message: 'Event date is required'
      };
    }

    if (!formData.startTime && formData.startTime !== 0) {
      return {
        isValid: false,
        message: 'Start time is required'
      };
    }

    if (!formData.endTime && formData.endTime !== 0) {
      return {
        isValid: false,
        message: 'End time is required'
      };
    }

    const startTime = Number(formData.startTime);
    const endTime = Number(formData.endTime);

    if (isNaN(startTime) || isNaN(endTime)) {
      return {
        isValid: false,
        message: 'Invalid time format'
      };
    }

    if (startTime >= endTime) {
      return {
        isValid: false,
        message: 'End time must be after start time'
      };
    }

    if (startTime < 0 || startTime >= 1440 || endTime < 0 || endTime > 1440) {
      return {
        isValid: false,
        message: 'Time must be within 24 hours'
      };
    }

    return {
      isValid: true,
      message: null
    };
  }

  /**
   * Create event object from form data
   * @param {Object} formData - Validated form data
   * @returns {Object} Event object
   */
  static createEventFromFormData(formData) {
    return {
      title: formData.title.trim(),
      date: new Date(formData.date),
      startTime: Number(formData.startTime),
      endTime: Number(formData.endTime),
      color: formData.color || "#2563eb"
    };
  }

  /**
   * Generate unique event ID
   * @returns {number} Unique event ID
   */
  static generateEventId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  /**
   * Validate complete event object
   * @param {Object} event - Event object to validate
   * @returns {string|null} Error message or null if valid
   */
  static validateEvent(event) {
    if (!event) {
      return "Event object is required";
    }

    if (!event.title || typeof event.title !== 'string' || !event.title.trim()) {
      return "Event title is required";
    }

    if (!event.date || !(event.date instanceof Date) || isNaN(event.date.getTime())) {
      return "Valid event date is required";
    }

    if (typeof event.startTime !== 'number' || event.startTime < 0 || event.startTime >= 1440) {
      return "Valid start time is required (0-1439 minutes)";
    }

    if (typeof event.endTime !== 'number' || event.endTime < 0 || event.endTime > 1440) {
      return "Valid end time is required (0-1440 minutes)";
    }

    if (event.startTime >= event.endTime) {
      return "Event end time must be after start time";
    }

    if (!event.color || typeof event.color !== 'string') {
      return "Event color is required";
    }

    // Validate color format (basic hex color validation)
    if (!/^#[0-9A-F]{6}$/i.test(event.color)) {
      return "Event color must be a valid hex color";
    }

    return null;
  }

  /**
   * Check if event is all day
   * @param {Object} event - Event object
   * @returns {boolean} True if all day event
   */
  static isEventAllDay(event) {
    return event.startTime === 0 && event.endTime === 1440;
  }

  /**
   * Compare events by start time
   * @param {Object} eventA - First event
   * @param {Object} eventB - Second event
   * @returns {boolean} True if eventA starts before eventB
   */
  static eventStartsBefore(eventA, eventB) {
    return eventA.startTime < eventB.startTime;
  }

  /**
   * Compare events by end time
   * @param {Object} eventA - First event
   * @param {Object} eventB - Second event
   * @returns {boolean} True if eventA ends before eventB
   */
  static eventEndsBefore(eventA, eventB) {
    return eventA.endTime < eventB.endTime;
  }

  /**
   * Check if two events collide in time
   * @param {Object} eventA - First event
   * @param {Object} eventB - Second event
   * @returns {boolean} True if events collide
   */
  static eventCollidesWith(eventA, eventB) {
    const maxStart = Math.max(eventA.startTime, eventB.startTime);
    const minEnd = Math.min(eventA.endTime, eventB.endTime);
    return minEnd > maxStart;
  }

  /**
   * Convert event time (minutes) to Date object
   * @param {Object} event - Event object
   * @param {number} eventTime - Time in minutes since midnight
   * @returns {Date} Date object with event time
   */
  static eventTimeToDate(event, eventTime) {
    return new Date(
      event.date.getFullYear(),
      event.date.getMonth(),
      event.date.getDate(),
      Math.floor(eventTime / 60),
      eventTime % 60
    );
  }

  /**
   * Format event for display
   * @param {Object} event - Event object
   * @returns {Object} Formatted event data
   */
  static formatEventForDisplay(event) {
    const startDate = this.eventTimeToDate(event, event.startTime);
    const endDate = this.eventTimeToDate(event, event.endTime);
    
    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true
    });

    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return {
      ...event,
      formattedStartTime: timeFormatter.format(startDate),
      formattedEndTime: timeFormatter.format(endDate),
      formattedDate: dateFormatter.format(event.date),
      isAllDay: this.isEventAllDay(event)
    };
  }

  /**
   * Create a copy of event with modifications
   * @param {Object} event - Original event
   * @param {Object} modifications - Properties to modify
   * @returns {Object} Modified event copy
   */
  static copyEventWithModifications(event, modifications) {
    return {
      ...event,
      ...modifications,
      // Ensure date is properly handled
      date: modifications.date ? new Date(modifications.date) : event.date
    };
  }

  /**
   * Sort events by start time
   * @param {Array} events - Array of events
   * @returns {Array} Sorted events array
   */
  static sortEventsByStartTime(events) {
    return [...events].sort((a, b) => {
      if (this.isEventAllDay(a) && !this.isEventAllDay(b)) return -1;
      if (!this.isEventAllDay(a) && this.isEventAllDay(b)) return 1;
      return this.eventStartsBefore(a, b) ? -1 : 1;
    });
  }
}

// Legacy exports for backward compatibility
export function eventTimeToDate(event, eventTime) {
  return EventModel.eventTimeToDate(event, eventTime);
}

export function isEventAllDay(event) {
  return EventModel.isEventAllDay(event);
}

export function eventStartsBefore(a, b) {
  return EventModel.eventStartsBefore(a, b);
}

export function eventEndsBefore(a, b) {
  return EventModel.eventEndsBefore(a, b);
}

export function eventCollidesWith(a, b) {
  return EventModel.eventCollidesWith(a, b);
}

export function validateEvent(event) {
  return EventModel.validateEvent(event);
}

export function generateEventId() {
  return EventModel.generateEventId();
}