// models/storage.js - Updated to use API instead of localStorage
import { eventsService } from "../services/eventsService.js";
import { isTheSameDay } from "./date.js";

// Cache để tránh gọi API liên tục
let eventsCache = [];
let cacheExpiry = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get all events from API (with caching)
 */
export async function getAllEvents() {
  // Check cache first
  if (cacheExpiry && Date.now() < cacheExpiry && eventsCache.length > 0) {
    return eventsCache;
  }

  try {
    const result = await eventsService.searchEvents();
    if (result.success) {
      eventsCache = result.events;
      cacheExpiry = Date.now() + CACHE_DURATION;
      return eventsCache;
    }
    return [];
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

/**
 * Save all events (this method is now deprecated, but kept for compatibility)
 */
export function saveAllEvents(events) {
  // This method is no longer used since we save to API directly
  // But we update cache
  eventsCache = events;
  cacheExpiry = Date.now() + CACHE_DURATION;
}

/**
 * Get events by date from API
 */
export async function getEventsByDate(date) {
  try {
    const events = await eventsService.getEventsByDate(date);
    return events;
  } catch (error) {
    console.error("Error fetching events by date:", error);
    return [];
  }
}

/**
 * Clear cache (useful when events are modified)
 */
export function clearEventsCache() {
  eventsCache = [];
  cacheExpiry = null;
}