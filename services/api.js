// services/api.js - Main API client service
class APIClient {
  constructor(baseURL = 'https://se_backend.hrzn.run') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new APIError(data.detail || data.message || 'API request failed', response.status, data);
      }

      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // Handle network errors
      throw new APIError('Network error: Please check your connection', 0, error);
    }
  }

  // HTTP methods
  async get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // File upload method
  async uploadFile(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {};

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new APIError(error.detail || error.message || 'Upload failed', response.status, error);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Upload failed', 0, error);
    }
  }
}

// Custom error class for API errors
class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Create singleton instance
const apiClient = new APIClient();

export { apiClient, APIError };