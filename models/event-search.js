// models/event-search.js
import { getAllEvents } from "./storage.js";
import { getTeamEvents } from "./group/team-calendar.js";
import { isTheSameDay } from "./date.js";

/**
 * Model cho chức năng tìm kiếm sự kiện
 */
export class EventSearchModel {
  constructor() {
    this.searchHistory = this.loadSearchHistory();
  }

  /**
   * Tìm kiếm events trong personal calendar
   * @param {string} query - Từ khóa tìm kiếm
   * @returns {Array} Danh sách events tìm được
   */
  searchPersonalEvents(query) {
    const events = getAllEvents();
    return this.searchEvents(events, query);
  }

  /**
   * Tìm kiếm events trong team calendar
   * @param {number} teamId - ID của team
   * @param {string} query - Từ khóa tìm kiếm
   * @returns {Array} Danh sách events tìm được
   */
  searchTeamEvents(teamId, query) {
    if (!teamId) return [];
    const events = getTeamEvents(teamId);
    return this.searchEvents(events, query);
  }

  /**
   * Tìm kiếm events theo query
   * @param {Array} events - Danh sách events để tìm
   * @param {string} query - Từ khóa tìm kiếm
   * @returns {Array} Danh sách events đã được sắp xếp theo độ liên quan
   */
  searchEvents(events, query) {
    if (!query.trim()) return [];
    
    const queryLower = query.toLowerCase();
    
    const results = events.filter(event => {
      // Tìm theo title
      if (event.title.toLowerCase().includes(queryLower)) {
        return true;
      }
      
      // Tìm theo ngày
      const eventDate = new Date(event.date);
      const dateStrings = [
        eventDate.toLocaleDateString('en-GB'), // dd/mm/yyyy
        eventDate.toLocaleDateString('en-US'), // mm/dd/yyyy
        eventDate.toISOString().split('T')[0], // yyyy-mm-dd
        eventDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }).toLowerCase()
      ];
      
      return dateStrings.some(dateStr => 
        dateStr.toLowerCase().includes(queryLower)
      );
    });

    // Sắp xếp theo độ liên quan
    return this.sortByRelevance(results, query);
  }

  /**
   * Sắp xếp kết quả theo độ liên quan
   * @param {Array} events - Danh sách events
   * @param {string} query - Từ khóa tìm kiếm
   * @returns {Array} Danh sách đã sắp xếp
   */
  sortByRelevance(events, query) {
    return events.sort((a, b) => {
      const aRelevance = this.calculateRelevance(a, query);
      const bRelevance = this.calculateRelevance(b, query);
      
      if (aRelevance !== bRelevance) {
        return bRelevance - aRelevance;
      }
      
      // Nếu độ liên quan bằng nhau, sắp xếp theo thời gian gần nhất
      return new Date(b.date) - new Date(a.date);
    });
  }

  /**
   * Tính toán độ liên quan của kết quả
   * @param {Object} event - Event object
   * @param {string} query - Từ khóa tìm kiếm
   * @returns {number} Điểm độ liên quan
   */
  calculateRelevance(event, query) {
    const queryLower = query.toLowerCase();
    const titleLower = event.title.toLowerCase();
    
    let relevance = 0;
    
    // Exact match gets highest score
    if (titleLower === queryLower) {
      relevance += 100;
    }
    // Starts with query
    else if (titleLower.startsWith(queryLower)) {
      relevance += 50;
    }
    // Contains query
    else if (titleLower.includes(queryLower)) {
      relevance += 25;
    }
    
    // Boost recent events
    const daysDiff = Math.abs(new Date() - new Date(event.date)) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 7) relevance += 10;
    else if (daysDiff <= 30) relevance += 5;
    
    return relevance;
  }

  /**
   * Nhóm kết quả theo ngày
   * @param {Array} events - Danh sách events
   * @returns {Object} Object với key là ngày, value là array events
   */
  groupEventsByDate(events) {
    return events.reduce((groups, event) => {
      const dateKey = new Date(event.date).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
      return groups;
    }, {});
  }

  /**
   * Lấy event theo ID từ personal calendar
   * @param {number} eventId - ID của event
   * @returns {Object|null} Event object hoặc null
   */
  getPersonalEventById(eventId) {
    return getAllEvents().find(e => e.id === eventId) || null;
  }

  /**
   * Lấy event theo ID từ team calendar
   * @param {number} teamId - ID của team
   * @param {number} eventId - ID của event
   * @returns {Object|null} Event object hoặc null
   */
  getTeamEventById(teamId, eventId) {
    if (!teamId) return null;
    return getTeamEvents(teamId).find(e => e.id === eventId) || null;
  }

  /**
   * Lưu từ khóa tìm kiếm vào lịch sử
   * @param {string} query - Từ khóa tìm kiếm
   */
  saveSearchQuery(query) {
    if (!query.trim()) return;
    
    // Remove duplicate if exists
    this.searchHistory = this.searchHistory.filter(item => item !== query);
    
    // Add to beginning
    this.searchHistory.unshift(query);
    
    // Keep only last 10 searches
    this.searchHistory = this.searchHistory.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem('event_search_history', JSON.stringify(this.searchHistory));
  }

  /**
   * Lấy lịch sử tìm kiếm
   * @returns {Array} Danh sách từ khóa đã tìm
   */
  getSearchHistory() {
    return this.searchHistory;
  }

  /**
   * Load lịch sử tìm kiếm từ localStorage
   * @returns {Array} Danh sách từ khóa
   */
  loadSearchHistory() {
    try {
      const history = localStorage.getItem('event_search_history');
      return history ? JSON.parse(history) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Xóa lịch sử tìm kiếm
   */
  clearSearchHistory() {
    this.searchHistory = [];
    localStorage.removeItem('event_search_history');
  }
}