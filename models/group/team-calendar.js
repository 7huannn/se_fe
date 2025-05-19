// models/group/team-calendar.js

import { isTheSameDay } from "../date.js";

const TEAM_EVENTS_KEY_PREFIX = "team_events_";

/**
 * Save team events to localStorage
 * @param {number} teamId - The team ID
 * @param {Array} events - Array of events for the team
 */
export function saveTeamEvents(teamId, events) {
  if (!teamId) return;
  
  const storageKey = `${TEAM_EVENTS_KEY_PREFIX}${teamId}`;
  const eventsToSave = events.map(evt => ({
    ...evt,
    date: evt.date.toISOString()
  }));
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(eventsToSave));
  } catch (e) {
    console.error("Error saving team events:", e);
  }
}

/**
 * Get all events for a specific team
 * @param {number} teamId - The team ID
 * @returns {Array} Array of events for the team
 */
export function getTeamEvents(teamId) {
  if (!teamId) return [];
  
  const storageKey = `${TEAM_EVENTS_KEY_PREFIX}${teamId}`;
  const rawEvents = localStorage.getItem(storageKey);
  
  if (!rawEvents) return [];
  
  try {
    const parsed = JSON.parse(rawEvents);
    return parsed.map(evt => ({
      ...evt,
      date: new Date(evt.date)
    }));
  } catch (e) {
    console.error("Error parsing team events:", e);
    return [];
  }
}

/**
 * Get team events for a specific date
 * @param {number} teamId - The team ID
 * @param {Date} date - The date to filter events by
 * @returns {Array} Array of events for the team on the specified date
 */
export function getTeamEventsByDate(teamId, date) {
  const allEvents = getTeamEvents(teamId);
  return allEvents.filter(evt => isTheSameDay(evt.date, date));
}

/**
 * Add a new event to a team's calendar
 * @param {number} teamId - The team ID
 * @param {Object} event - The event to add
 * @returns {Array} Updated array of team events
 */
export function addTeamEvent(teamId, event) {
  if (!teamId || !event) return [];
  
  const events = getTeamEvents(teamId);
  events.push(event);
  saveTeamEvents(teamId, events);
  
  return events;
}

/**
 * Update an existing team event
 * @param {number} teamId - The team ID
 * @param {Object} updatedEvent - The updated event
 * @returns {Array} Updated array of team events
 */
export function updateTeamEvent(teamId, updatedEvent) {
  if (!teamId || !updatedEvent || !updatedEvent.id) return [];
  
  const events = getTeamEvents(teamId);
  const updatedEvents = events.map(evt => 
    evt.id === updatedEvent.id ? updatedEvent : evt
  );
  
  saveTeamEvents(teamId, updatedEvents);
  
  return updatedEvents;
}

/**
 * Delete a team event
 * @param {number} teamId - The team ID
 * @param {number} eventId - The ID of the event to delete
 * @returns {Array} Updated array of team events
 */
export function deleteTeamEvent(teamId, eventId) {
  if (!teamId || !eventId) return [];
  
  const events = getTeamEvents(teamId);
  const filteredEvents = events.filter(evt => evt.id !== eventId);
  
  saveTeamEvents(teamId, filteredEvents);
  
  return filteredEvents;
}

/**
 * Create an event store for a specific team
 * @param {number} teamId - The team ID
 * @returns {Object} Event store for the team
 */
export function createTeamEventStore(teamId) {
  return {
    getEventsByDate(date) {
      return getTeamEventsByDate(teamId, date);
    },
    
    addEvent(event) {
      const events = addTeamEvent(teamId, event);
      this.notifyChange();
      return events;
    },
    
    updateEvent(event) {
      const events = updateTeamEvent(teamId, event);
      this.notifyChange();
      return events;
    },
    
    deleteEvent(eventId) {
      const events = deleteTeamEvent(teamId, eventId);
      this.notifyChange();
      return events;
    },
    
    notifyChange() {
      document.dispatchEvent(new CustomEvent("team-events-change", {
        detail: { teamId },
        bubbles: true
      }));
    }
  };
}