// services/eventsService.js - Events service tích hợp với backend
import { apiClient } from './api.js';

export class EventsService {
  // Convert frontend event format to backend format
  formatEventForBackend(frontendEvent) {
    // Convert minutes since midnight to datetime
    const baseDate = new Date(frontendEvent.date);
    const startTime = new Date(baseDate);
    startTime.setMinutes(frontendEvent.startTime);
    
    const endTime = new Date(baseDate);
    endTime.setMinutes(frontendEvent.endTime);
    
    return {
      title: frontendEvent.title,
      description: frontendEvent.description || '',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      event_type: frontendEvent.event_type || 'general',
      location: frontendEvent.location || '',
      priority: frontendEvent.priority || 'normal'
    };
  }

  // Convert backend event format to frontend format
  formatEventForFrontend(backendEvent) {
    const startTime = new Date(backendEvent.start_time);
    const endTime = new Date(backendEvent.end_time);
    
    // Convert to minutes since midnight
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();

    return {
      id: backendEvent.id,
      title: backendEvent.title,
      description: backendEvent.description,
      date: new Date(backendEvent.start_time.split('T')[0]), // Just the date part
      startTime: startMinutes,
      endTime: endMinutes,
      color: backendEvent.color || '#2563eb', // Default color
      event_type: backendEvent.event_type,
      location: backendEvent.location,
      priority: backendEvent.priority
    };
  }

  // Create event
  async createEvent(eventData) {
    try {
      const backendData = this.formatEventForBackend(eventData);
      console.log(backendData.start_time)
      
      const response = await apiClient.post('api/events/', backendData);
      
      return {
        success: true,
        message: 'Event created successfully',
        event: this.formatEventForFrontend(response)
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Get event by ID
  async getEvent(eventId) {
    try {
      localStorage.clear();

      const response = await apiClient.get(`api/events/${eventId}`);
      
      return {
        success: true,
        event: this.formatEventForFrontend(response)
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Update event
  async updateEvent(eventId, eventData) {
    try {
      const backendData = this.formatEventForBackend(eventData);
      const response = await apiClient.put(`api/events/${eventId}`, backendData);
      
      return {
        success: true,
        message: 'Event updated successfully',
        event: this.formatEventForFrontend(response)
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Delete event
  async deleteEvent(eventId) {
    try {
      await apiClient.delete(`api/events/${eventId}`);
      
      return {
        success: true,
        message: 'Event deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Search events
  async searchEvents({ keyword, date } = {}) {
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (date) params.append('date', date.toISOString());
      
      const url = `api/events/${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiClient.get(url);
      
      return {
        success: true,
        events: response.map(event => this.formatEventForFrontend(event))
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        events: []
      };
    }
  }

  // Get events for a specific date (helper method for calendar)
  async getEventsByDate(date) {
    try {

      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      const result = await this.searchEvents({ date: new Date(dateStr) });
      
      if (result.success) {
        return result.events;
      }
      return [];
    } catch (error) {
      console.error('Error getting events by date:', error);
      return [];
    }
  }
}

// Create singleton
export const eventsService = new EventsService();