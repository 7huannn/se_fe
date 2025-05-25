// services/eventsService.js - Events management service
import { apiClient } from './api.js';

class EventsService {
  constructor() {
    this.events = [];
  }

  // Create a new event
  async createEvent(eventData) {
    try {
      // Format dates to ISO strings if they're Date objects
      const formattedData = this.formatEventData(eventData);
      
      const response = await apiClient.post('/api/events/', formattedData);
      
      return {
        success: true,
        message: 'Event created successfully',
        event: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Get event by ID
  async getEvent(eventId) {
    try {
      const response = await apiClient.get(`/api/events/${eventId}`);
      
      return {
        success: true,
        event: this.parseEventData(response)
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Update an event
  async updateEvent(eventId, eventData) {
    try {
      const formattedData = this.formatEventData(eventData);
      
      const response = await apiClient.put(`/api/events/${eventId}`, formattedData);
      
      return {
        success: true,
        message: 'Event updated successfully',
        event: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Delete an event
  async deleteEvent(eventId) {
    try {
      await apiClient.delete(`/api/events/${eventId}`);
      
      return {
        success: true,
        message: 'Event deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status
      };
    }
  }

  // Search events
  async searchEvents({ keyword, date, eventType } = {}) {
    try {
      const params = {};
      
      if (keyword) params.keyword = keyword;
      if (date) params.date = date instanceof Date ? date.toISOString() : date;
      if (eventType) params.event_type = eventType;
      
      const response = await apiClient.get('/api/events/', params);
      
      return {
        success: true,
        events: response.map(event => this.parseEventData(event))
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status,
        events: []
      };
    }
  }

  // Format event data before sending to API
  formatEventData(eventData) {
    const formatted = { ...eventData };
    
    // Convert Date objects to ISO strings
    if (formatted.start_time instanceof Date) {
      formatted.start_time = formatted.start_time.toISOString();
    }
    if (formatted.end_time instanceof Date) {
      formatted.end_time = formatted.end_time.toISOString();
    }
    
    // Map frontend field names to backend field names if needed
    if (formatted.startTime && !formatted.start_time) {
      formatted.start_time = formatted.startTime instanceof Date ? 
        formatted.startTime.toISOString() : formatted.startTime;
      delete formatted.startTime;
    }
    
    if (formatted.endTime && !formatted.end_time) {
      formatted.end_time = formatted.endTime instanceof Date ? 
        formatted.endTime.toISOString() : formatted.endTime;
      delete formatted.endTime;
    }
    
    if (formatted.eventType && !formatted.event_type) {
      formatted.event_type = formatted.eventType;
      delete formatted.eventType;
    }
    
    return formatted;
  }

  // Parse event data received from API
  parseEventData(eventData) {
    const parsed = { ...eventData };
    
    // Convert ISO strings back to Date objects
    if (parsed.start_time) {
      parsed.startTime = new Date(parsed.start_time);
      parsed.date = new Date(parsed.start_time); // For compatibility with existing frontend
    }
    
    if (parsed.end_time) {
      parsed.endTime = new Date(parsed.end_time);
    }
    
    if (parsed.created_at) {
      parsed.createdAt = new Date(parsed.created_at);
    }
    
    if (parsed.updated_at) {
      parsed.updatedAt = new Date(parsed.updated_at);
    }
    
    // Map backend field names to frontend field names if needed
    if (parsed.event_type) {
      parsed.eventType = parsed.event_type;
    }
    
    if (parsed.creator_id) {
      parsed.creatorId = parsed.creator_id;
    }
    
    if (parsed.group_id) {
      parsed.groupId = parsed.group_id;
    }
    
    return parsed;
  }

  // Helper method to convert frontend event format to minutes since midnight
  convertToMinutes(timeString) {
    if (typeof timeString === 'number') return timeString;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Helper method to convert minutes since midnight to time string
  convertToTimeString(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Validate event data before sending
  validateEventData(eventData) {
    const errors = [];
    
    if (!eventData.title || eventData.title.trim().length === 0) {
      errors.push('Event title is required');
    }
    
    if (eventData.title && eventData.title.length > 100) {
      errors.push('Event title must be less than 100 characters');
    }
    
    if (!eventData.start_time && !eventData.startTime) {
      errors.push('Start time is required');
    }
    
    if (!eventData.end_time && !eventData.endTime) {
      errors.push('End time is required');
    }
    
    // Validate that end time is after start time
    const startTime = eventData.start_time || eventData.startTime;
    const endTime = eventData.end_time || eventData.endTime;
    
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (end <= start) {
        errors.push('End time must be after start time');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Create singleton instance
const eventsService = new EventsService();

export { eventsService };