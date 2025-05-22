// views/event-searchView.js
import { isTheSameDay } from "../models/date.js";

/**
 * View cho chức năng tìm kiếm sự kiện
 */
export class EventSearchView {
  constructor() {
    this.searchInput = null;
    this.searchOverlay = null;
    this.resultsContainer = null;
    this.isSearchOpen = false;
  }

  /**
   * Initialize search view elements
   * @param {string} searchInputId - ID của search input
   */
  init(searchInputId = 'search-input') {
    this.searchInput = document.getElementById(searchInputId);
    if (!this.searchInput) {
      console.warn('Search input not found');
      return;
    }

    this.createSearchOverlay();
  }

  /**
   * Tạo search overlay và results container
   */
  createSearchOverlay() {
    if (document.getElementById('search-overlay')) return;

    this.searchOverlay = document.createElement('div');
    this.searchOverlay.id = 'search-overlay';
    this.searchOverlay.className = 'search-overlay';
    this.searchOverlay.innerHTML = `
      <div class="search-results-container">
        <div class="search-results-header">
          <h3>Search Results</h3>
          <button class="search-close-btn" title="Close">&times;</button>
        </div>
        <div id="search-results" class="search-results"></div>
      </div>
    `;
    
    document.body.appendChild(this.searchOverlay);
    this.resultsContainer = document.getElementById('search-results');
  }

  /**
   * Bind events cho search view
   * @param {Object} eventHandlers - Object chứa các event handlers
   */
  bindEvents(eventHandlers) {
    if (!this.searchInput) return;

    // Search input events
    this.searchInput.addEventListener('input', (e) => {
      if (eventHandlers.onSearch) {
        eventHandlers.onSearch(e.target.value);
      }
    });

    this.searchInput.addEventListener('focus', () => {
      if (eventHandlers.onFocus) {
        eventHandlers.onFocus();
      }
    });

    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && eventHandlers.onEscape) {
        eventHandlers.onEscape();
      }
    });

    // Close button event
    const closeBtn = this.searchOverlay?.querySelector('.search-close-btn');
    if (closeBtn && eventHandlers.onClose) {
      closeBtn.addEventListener('click', eventHandlers.onClose);
    }

    // Overlay click event
    if (this.searchOverlay && eventHandlers.onClose) {
      this.searchOverlay.addEventListener('click', (e) => {
        if (e.target === this.searchOverlay) {
          eventHandlers.onClose();
        }
      });
    }
  }

  /**
   * Hiển thị kết quả tìm kiếm
   * @param {Array} results - Danh sách kết quả
   * @param {string} query - Từ khóa tìm kiếm
   * @param {Object} eventHandlers - Event handlers cho kết quả
   */
  displayResults(results, query, eventHandlers = {}) {
    if (!this.resultsContainer) return;

    if (results.length === 0) {
      this.displayNoResults();
      return;
    }

    const resultsByDate = this.groupResultsByDate(results);
    let html = `<div class="search-results-count">${results.length} result${results.length !== 1 ? 's' : ''} found</div>`;
    
    Object.entries(resultsByDate).forEach(([dateKey, events]) => {
      const dateLabel = this.formatDateLabel(new Date(dateKey));
      
      html += `
        <div class="search-date-group">
          <div class="search-date-header">${dateLabel}</div>
          <div class="search-events-group">
            ${events.map(event => this.renderSearchResult(event, query)).join('')}
          </div>
        </div>
      `;
    });

    this.resultsContainer.innerHTML = html;
    this.bindResultEvents(eventHandlers);
  }

  /**
   * Hiển thị thông báo không có kết quả
   */
  displayNoResults() {
    this.resultsContainer.innerHTML = `
      <div class="search-no-results">
        <div class="search-no-results-icon">🔍</div>
        <div class="search-no-results-text">
          <h4>No events found</h4>
          <p>Try searching with different keywords</p>
        </div>
      </div>
    `;
  }

  /**
   * Nhóm kết quả theo ngày
   * @param {Array} results - Danh sách kết quả
   * @returns {Object} Object nhóm theo ngày
   */
  groupResultsByDate(results) {
    return results.reduce((groups, event) => {
      const dateKey = new Date(event.date).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
      return groups;
    }, {});
  }

  /**
   * Format date label
   * @param {Date} date - Ngày cần format
   * @returns {string} Chuỗi ngày đã format
   */
  formatDateLabel(date) {
    const isToday = isTheSameDay(date, new Date());
    const isTomorrow = isTheSameDay(date, new Date(Date.now() + 24 * 60 * 60 * 1000));
    
    if (isToday) {
      return 'Today';
    } else if (isTomorrow) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  }

  /**
   * Render một kết quả tìm kiếm
   * @param {Object} event - Event object
   * @param {string} query - Từ khóa tìm kiếm
   * @returns {string} HTML string
   */
  renderSearchResult(event, query) {
    const startTime = this.formatTime(event.startTime);
    const endTime = this.formatTime(event.endTime);
    const highlightedTitle = this.highlightQuery(event.title, query);
    
    return `
      <div class="search-result-item" data-event-id="${event.id}">
        <div class="search-result-color" style="background-color: ${event.color}"></div>
        <div class="search-result-content">
          <div class="search-result-title">${highlightedTitle}</div>
          <div class="search-result-time">${startTime} - ${endTime}</div>
        </div>
        <div class="search-result-actions">
          <button class="search-result-view-btn" title="View event">👁️</button>
          <button class="search-result-edit-btn" title="Edit event">✏️</button>
        </div>
      </div>
    `;
  }

  /**
   * Highlight query trong text
   * @param {string} text - Text cần highlight
   * @param {string} query - Từ khóa cần highlight
   * @returns {string} Text đã được highlight
   */
  highlightQuery(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Format thời gian từ minutes thành HH:MM AM/PM
   * @param {number} minutes - Số phút từ 00:00
   * @returns {string} Thời gian đã format
   */
  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${ampm}`;
  }

  /**
   * Bind events cho các kết quả tìm kiếm
   * @param {Object} eventHandlers - Event handlers
   */
  bindResultEvents(eventHandlers) {
    if (!this.resultsContainer) return;

    // View event buttons
    this.resultsContainer.querySelectorAll('.search-result-view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = parseInt(btn.closest('.search-result-item').dataset.eventId);
        if (eventHandlers.onViewEvent) {
          eventHandlers.onViewEvent(eventId);
        }
      });
    });

    // Edit event buttons
    this.resultsContainer.querySelectorAll('.search-result-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = parseInt(btn.closest('.search-result-item').dataset.eventId);
        if (eventHandlers.onEditEvent) {
          eventHandlers.onEditEvent(eventId);
        }
      });
    });

    // Click on result item
    this.resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const eventId = parseInt(item.dataset.eventId);
        if (eventHandlers.onViewEvent) {
          eventHandlers.onViewEvent(eventId);
        }
      });
    });
  }

  /**
   * Mở search overlay
   */
  openSearch() {
    if (this.searchOverlay && !this.isSearchOpen) {
      this.searchOverlay.style.display = 'flex';
      this.isSearchOpen = true;
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Đóng search overlay
   */
  closeSearch() {
    if (this.searchOverlay && this.isSearchOpen) {
      this.searchOverlay.style.display = 'none';
      this.isSearchOpen = false;
      document.body.style.overflow = '';
      if (this.searchInput) {
        this.searchInput.blur();
      }
    }
  }

  /**
   * Clear search input
   */
  clearSearchInput() {
    if (this.searchInput) {
      this.searchInput.value = '';
    }
  }

  /**
   * Get current search query
   * @returns {string} Current search query
   */
  getSearchQuery() {
    return this.searchInput ? this.searchInput.value.trim() : '';
  }

  /**
   * Check if search is currently open
   * @returns {boolean} True if search overlay is open
   */
  isOpen() {
    return this.isSearchOpen;
  }
}