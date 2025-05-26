// controllers/event-store.js - Updated to use API
import { eventsService } from "../services/eventsService.js";
import { getEventsByDate, clearEventsCache } from "../models/storage.js";

export function initEventStore() {
  // Helper để dispatch change event
  function notify() {
    document.dispatchEvent(new CustomEvent("events-change", {
      bubbles: true
    }));
  }

  // Handle event creation
  document.addEventListener("event-create", async ({ detail }) => {
    try {
      const eventData = detail.event || detail;
      const result = await eventsService.createEvent(eventData);
      
      if (result.success) {
        clearEventsCache(); // Clear cache to force refresh
        notify();
        console.log("Event created successfully:", result.event);
      } else {
        console.error("Failed to create event:", result.message);
        // Show error to user (you can customize this)
        alert("Failed to create event: " + result.message);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Error creating event: " + error.message);
    }
  });

  // Handle event deletion
  document.addEventListener("event-delete", async ({ detail }) => {
    try {
      const eventData = detail.event || detail;
      const result = await eventsService.deleteEvent(eventData.id);
      
      if (result.success) {
        clearEventsCache(); // Clear cache to force refresh
        notify();
        console.log("Event deleted successfully");
      } else {
        console.error("Failed to delete event:", result.message);
        alert("Failed to delete event: " + result.message);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error deleting event: " + error.message);
    }
  });

  // Handle event editing
  document.addEventListener("event-edit", async ({ detail }) => {
    try {
      const eventData = detail.event || detail;
      const result = await eventsService.updateEvent(eventData.id, eventData);
      
      if (result.success) {
        clearEventsCache(); // Clear cache to force refresh
        notify();
        console.log("Event updated successfully:", result.event);
      } else {
        console.error("Failed to update event:", result.message);
        alert("Failed to update event: " + result.message);
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Error updating event: " + error.message);
    }
  });

  return {
    // Return the same interface for calendar view
    getEventsByDate(date) {
      return getEventsByDate(date);
    }
  };
}