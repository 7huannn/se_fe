// controllers/event-search.js
import { EventSearchModel } from "../models/event-search.js";
import { EventSearchView } from "../views/event-searchView.js";

/**
 * Controller cho chức năng tìm kiếm sự kiện (tuân thủ mô hình MVC)
 */
export class EventSearchController {
  constructor(searchInputId = 'search-input') {
    this.model = new EventSearchModel();
    this.view = new EventSearchView();
    
    this.currentSearchType = 'personal'; // 'personal' hoặc 'team'
    this.currentTeamId = null;
    this.debounceTimer = null;
    
    this.init(searchInputId);
  }

  /**
   * Initialize controller
   * @param {string} searchInputId - ID của search input
   */
  init(searchInputId) {
    // Initialize view
    this.view.init(searchInputId);
    
    // Bind view events
    this.bindViewEvents();
    
    // Detect current context
    this.detectCurrentContext();
    
    // Listen for context changes
    this.bindContextEvents();
  }

  /**
   * Bind events từ view
   */
  bindViewEvents() {
    this.view.bindEvents({
      onSearch: (query) => this.handleSearch(query),
      onFocus: () => this.handleSearchFocus(),
      onEscape: () => this.handleEscape(),
      onClose: () => this.handleClose()
    });
  }

  /**
   * Bind context change events
   */
  bindContextEvents() {
    // Listen for team selection changes in group calendar
    document.addEventListener('team-select', (e) => {
      this.currentSearchType = 'team';
      this.currentTeamId = e.detail.team?.id || null;
    });
  }

  /**
   * Detect current context (personal hoặc group calendar)
   */
  detectCurrentContext() {
    if (window.location.pathname.includes('group-calendar.html')) {
      this.currentSearchType = 'team';
    } else {
      this.currentSearchType = 'personal';
    }
  }

  /**
   * Xử lý sự kiện tìm kiếm
   * @param {string} query - Từ khóa tìm kiếm
   */
  handleSearch(query) {
    clearTimeout(this.debounceTimer);
    
    if (!query.trim()) {
      this.view.closeSearch();
      return;
    }

    // Debounce search
    this.debounceTimer = setTimeout(() => {
      this.performSearch(query.trim());
    }, 300);
  }

  /**
   * Thực hiện tìm kiếm
   * @param {string} query - Từ khóa tìm kiếm
   */
  performSearch(query) {
    let results = [];
    
    if (this.currentSearchType === 'personal') {
      results = this.model.searchPersonalEvents(query);
    } else if (this.currentSearchType === 'team' && this.currentTeamId) {
      results = this.model.searchTeamEvents(this.currentTeamId, query);
    }

    // Save search query to history
    if (results.length > 0) {
      this.model.saveSearchQuery(query);
    }

    // Display results
    this.view.displayResults(results, query, {
      onViewEvent: (eventId) => this.handleViewEvent(eventId),
      onEditEvent: (eventId) => this.handleEditEvent(eventId)
    });

    this.view.openSearch();
  }

  /**
   * Xử lý focus vào search input
   */
  handleSearchFocus() {
    const query = this.view.getSearchQuery();
    if (query) {
      this.view.openSearch();
    }
  }

  /**
   * Xử lý phím Escape
   */
  handleEscape() {
    this.view.closeSearch();
  }

  /**
   * Xử lý đóng search
   */
  handleClose() {
    this.view.closeSearch();
  }

  /**
   * Xử lý xem chi tiết event
   * @param {number} eventId - ID của event
   */
  handleViewEvent(eventId) {
    let event = null;
    
    if (this.currentSearchType === 'personal') {
      event = this.model.getPersonalEventById(eventId);
    } else if (this.currentSearchType === 'team' && this.currentTeamId) {
      event = this.model.getTeamEventById(this.currentTeamId, eventId);
    }
    
    if (event) {
      // Dispatch event-click để mở dialog chi tiết
      document.dispatchEvent(new CustomEvent('event-click', {
        detail: { event },
        bubbles: true
      }));
      
      this.view.closeSearch();
    }
  }

  /**
   * Xử lý chỉnh sửa event
   * @param {number} eventId - ID của event
   */
  handleEditEvent(eventId) {
    let event = null;
    
    if (this.currentSearchType === 'personal') {
      event = this.model.getPersonalEventById(eventId);
    } else if (this.currentSearchType === 'team' && this.currentTeamId) {
      event = this.model.getTeamEventById(this.currentTeamId, eventId);
    }
    
    if (event) {
      // Dispatch event-edit-request để mở dialog chỉnh sửa
      document.dispatchEvent(new CustomEvent('event-edit-request', {
        detail: { event },
        bubbles: true
      }));
      
      this.view.closeSearch();
    }
  }

  /**
   * Set search type và team ID
   * @param {string} type - 'personal' hoặc 'team'
   * @param {number|null} teamId - ID của team (nếu type là 'team')
   */
  setSearchType(type, teamId = null) {
    this.currentSearchType = type;
    this.currentTeamId = teamId;
  }

  /**
   * Lấy lịch sử tìm kiếm
   * @returns {Array} Danh sách từ khóa đã tìm
   */
  getSearchHistory() {
    return this.model.getSearchHistory();
  }

  /**
   * Xóa lịch sử tìm kiếm
   */
  clearSearchHistory() {
    this.model.clearSearchHistory();
  }

  /**
   * Check if search is currently open
   * @returns {boolean} True if search is open
   */
  get isSearchOpen() {
    return this.view.isOpen();
  }

  /**
   * Close search programmatically
   */
  closeSearch() {
    this.view.closeSearch();
  }
}

/**
 * Initialize search controller
 * @param {string} searchInputId - ID của search input
 * @returns {EventSearchController} Search controller instance
 */
export function initEventSearchController(searchInputId) {
  return new EventSearchController(searchInputId);
}