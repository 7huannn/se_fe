// views/event-searchView.js

/**
 * View class for event search functionality
 */
export class EventSearchView {
  constructor() {
    this.searchInput = null;
    this.resultsContainer = null;
    this.searchIsOpen = false;
  }

  /**
   * Initialize the search view
   * @param {string} searchInputId - ID of the search input element
   */
  init(searchInputId) {
    this.searchInput = document.getElementById(searchInputId);
    if (!this.searchInput) {
      console.error('Search input element not found');
      return;
    }

    // Create search results container if it doesn't exist
    this.createSearchResultsContainer();
  }

  /**
   * Create the search results container
   */
  createSearchResultsContainer() {
    // Check if container already exists
    let container = document.querySelector('.search-results-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'search-results-container';
      container.innerHTML = `
        <div class="search-results-header">
          <h3>Search Results</h3>
          <button class="search-close-btn">&times;</button>
        </div>
        <div class="search-results-content">
          <div class="search-query-info"></div>
          <div class="search-results-list"></div>
          <div class="search-empty-results hidden">No results found</div>
        </div>
      `;
      document.body.appendChild(container);

      // Add styles for search results
      this.addSearchStyles();
    }

    this.resultsContainer = container;
    this.searchResultsList = container.querySelector('.search-results-list');
    this.searchQueryInfo = container.querySelector('.search-query-info');
    this.searchEmptyResults = container.querySelector('.search-empty-results');
  }

  /**
   * Add CSS styles for search functionality
   */
  addSearchStyles() {
    // Check if styles already exist
    if (document.getElementById('search-styles')) return;

    const styleElement = document.createElement('style');
    styleElement.id = 'search-styles';
    styleElement.textContent = `
      .search-results-container {
        position: absolute;
        top: 55px;
        right: 16px;
        width: 400px;
        max-height: 500px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        overflow: hidden;
        display: none;
        animation: searchFadeIn 0.2s ease;
      }
      
      @keyframes searchFadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .search-results-container.open {
        display: block;
      }
      
      .search-results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #eee;
        background-color: #f9f9f9;
      }
      
      .search-results-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .search-close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #666;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
      }
      
      .search-close-btn:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
      
      .search-results-content {
        max-height: 450px;
        overflow-y: auto;
      }
      
      .search-query-info {
        padding: 12px 16px;
        font-size: 14px;
        color: #666;
        border-bottom: 1px solid #eee;
      }
      
      .search-result-item {
        padding: 12px 16px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
      }
      
      .search-result-item:hover {
        background-color: #f5f5f5;
      }
      
      .search-result-title {
        font-weight: 500;
        margin-bottom: 4px;
        color: #333;
      }
      
      .search-result-date {
        font-size: 13px;
        color: #666;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .search-result-time {
        color: #888;
        font-size: 12px;
      }
      
      .search-result-actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }
      
      .search-result-btn {
        background-color: #f0f0f0;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        color: #333;
        cursor: pointer;
      }
      
      .search-result-btn:hover {
        background-color: #e0e0e0;
      }
      
      .search-empty-results {
        padding: 24px 16px;
        text-align: center;
        color: #666;
        font-style: italic;
      }
      
      .hidden {
        display: none;
      }
      
      /* Highlight matching text */
      .search-highlight {
        background-color: rgba(255, 225, 0, 0.3);
        padding: 0 2px;
        border-radius: 2px;
      }
      
      /* Team indicator */
      .search-team-indicator {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #0078d4;
        background-color: #e6f7ff;
        padding: 2px 6px;
        border-radius: 12px;
        margin-left: 8px;
      }
      
      /* Responsive styles */
      @media (max-width: 768px) {
        .search-results-container {
          width: 100%;
          max-width: calc(100% - 32px);
          right: 16px;
          left: 16px;
        }
      }
    `;
    
    document.head.appendChild(styleElement);
  }

  /**
   * Bind events to the search input and results container
   * @param {Object} handlers - Event handlers
   */
  bindEvents(handlers) {
    if (!this.searchInput) return;

    // Search input event
    this.searchInput.addEventListener('input', (e) => {
      if (handlers.onSearch) {
        handlers.onSearch(e.target.value);
      }
    });

    // Focus event
    this.searchInput.addEventListener('focus', () => {
      if (handlers.onFocus) {
        handlers.onFocus();
      }
    });

    // Escape key event
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && handlers.onEscape) {
        handlers.onEscape();
      }
    });

    // Close button event
    if (this.resultsContainer) {
      const closeBtn = this.resultsContainer.querySelector('.search-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          if (handlers.onClose) {
            handlers.onClose();
          }
        });
      }
    }
  }

  /**
   * Display search results
   * @param {Array} results - Search results
   * @param {string} query - Search query
   * @param {Object} handlers - Event handlers for result actions
   */
  displayResults(results, query, handlers) {
    if (!this.searchResultsList) return;

    // Clear previous results
    this.searchResultsList.innerHTML = '';

    // Show/hide empty results message
    if (results.length === 0) {
      this.searchEmptyResults.classList.remove('hidden');
      this.searchQueryInfo.textContent = `No results found for "${query}"`;
    } else {
      this.searchEmptyResults.classList.add('hidden');
      this.searchQueryInfo.textContent = `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`;
    }

    // Create result items
    results.forEach(event => {
      const resultItem = document.createElement('div');
      resultItem.className = 'search-result-item';
      resultItem.dataset.eventId = event.id;
      
      // Add team indicator if applicable
      if (event.teamId) {
        resultItem.dataset.teamEvent = 'true';
      }

      // Format date and time
      const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
      const formattedDate = eventDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      // Convert minutes to formatted time
      const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const period = hours < 12 ? 'AM' : 'PM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
      };

      const startTime = formatTime(event.startTime);
      const endTime = formatTime(event.endTime);

      // Highlight matching text in title
      const highlightedTitle = this.highlightText(event.title, query);

      resultItem.innerHTML = `
        <div class="search-result-title">${highlightedTitle}</div>
        <div class="search-result-date">
          <span>${formattedDate}</span>
          <span class="search-result-time">${startTime} - ${endTime}</span>
          ${event.teamId ? `<span class="search-team-indicator">Team</span>` : ''}
        </div>
        <div class="search-result-actions">
          <button class="search-result-btn search-view-btn">View Details</button>
          <button class="search-result-btn search-edit-btn">Edit</button>
        </div>
      `;

      // Add event listeners for actions
      const viewBtn = resultItem.querySelector('.search-view-btn');
      const editBtn = resultItem.querySelector('.search-edit-btn');

      if (viewBtn && handlers.onViewEvent) {
        viewBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          handlers.onViewEvent(event.id);
        });
      }

      if (editBtn && handlers.onEditEvent) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          handlers.onEditEvent(event.id);
        });
      }

      // Add click handler to the entire item (view event)
      resultItem.addEventListener('click', () => {
        if (handlers.onViewEvent) {
          handlers.onViewEvent(event.id);
        }
      });

      this.searchResultsList.appendChild(resultItem);
    });
  }

  /**
   * Highlight matching text in a string
   * @param {string} text - Text to highlight
   * @param {string} query - Search query
   * @returns {string} Text with highlighted parts
   */
  highlightText(text, query) {
    if (!query || !query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  /**
   * Open search results
   */
  openSearch() {
    if (!this.resultsContainer) return;
    this.resultsContainer.classList.add('open');
    this.searchIsOpen = true;
  }

  /**
   * Close search results
   */
  closeSearch() {
    if (!this.resultsContainer) return;
    this.resultsContainer.classList.remove('open');
    this.searchIsOpen = false;
  }

  /**
   * Get current search query
   * @returns {string} Current search query
   */
  getSearchQuery() {
    return this.searchInput ? this.searchInput.value : '';
  }

  /**
   * Check if search is open
   * @returns {boolean} True if search is open
   */
  isOpen() {
    return this.searchIsOpen;
  }
}