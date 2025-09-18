// Authentication service for Laravel API integration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api';
const BASE_URL = API_BASE_URL.replace('/api', ''); // Base Laravel URL without /api

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.setupAxiosInterceptors();
  }

  // Setup axios interceptors for automatic token handling
  setupAxiosInterceptors() {
    // Request interceptor to add token to headers
    if (typeof window !== 'undefined' && window.axios) {
      window.axios.interceptors.request.use(
        (config) => {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Response interceptor to handle 401 errors
      window.axios.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 401) {
            this.logout();
            window.location.href = '/auth/signin';
          }
          return Promise.reject(error);
        }
      );
    }
  }

  // Enhanced request method with better error handling
  async makeRequest(url, options = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    // For token-based API authentication, we don't need credentials: 'include'
    // This avoids CORS issues with wildcards
    const requestOptions = {
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    // Only include credentials for CSRF cookie requests
    if (url.includes('/sanctum/csrf-cookie')) {
      requestOptions.credentials = 'include';
    }

    try {
      const response = await fetch(url, requestOptions);
      
      // Get response text first
      const responseText = await response.text();
      
      // Check if response is HTML (error page)
      if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
        throw new Error(`Server returned HTML error page. Status: ${response.status}. This usually indicates a Laravel route or configuration issue.`);
      }

      // Try to parse as JSON
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Response text:', responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }

      return { response, data };
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  // Login user - Simplified without Sanctum CSRF for token-based auth
  async login(email, password) {
    try {
      const { response, data } = await this.makeRequest(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        const { access_token, user } = data;
        
        // Store token in localStorage
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        
        this.token = access_token;
        
        return { success: true, user };
      } else {
        return { 
          success: false, 
          error: data.message || data.error || `Login failed with status ${response.status}` 
        };
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Network error. Please try again.';
      
      if (error.message.includes('CORS')) {
        errorMessage = 'CORS error. Please check your Laravel CORS configuration.';
      } else if (error.message.includes('HTML error page')) {
        errorMessage = 'Server configuration error. Please check if the Laravel API is running and configured correctly.';
      } else if (error.message.includes('Invalid JSON')) {
        errorMessage = 'Server returned invalid response. Please check the API endpoint.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check if the API is running at ' + API_BASE_URL;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  // Register user - Simplified without Sanctum CSRF for token-based auth
  async register(name, email, password, userRole = 'user') {
    try {
      const { response, data } = await this.makeRequest(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: password,
          user_role: userRole,
        }),
      });

      if (response.ok) {
        const { access_token, user } = data;
        
        // Store token in localStorage
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        
        this.token = access_token;
        
        return { success: true, user };
      } else {
        return { 
          success: false, 
          error: data.message || data.error || `Registration failed with status ${response.status}` 
        };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Network error. Please try again.';
      
      if (error.message.includes('CORS')) {
        errorMessage = 'CORS error. Please check your Laravel CORS configuration.';
      } else if (error.message.includes('HTML error page')) {
        errorMessage = 'Server configuration error. Please check if the Laravel API is running and configured correctly.';
      } else if (error.message.includes('Invalid JSON')) {
        errorMessage = 'Server returned invalid response. Please check the API endpoint.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check if the API is running at ' + API_BASE_URL;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  // Logout user
  async logout() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await this.makeRequest(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Remove token and user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.token = null;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      const { response, data } = await this.makeRequest(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return { success: true, user: data.user };
      } else {
        return { 
          success: false, 
          error: data.message || data.error || `Failed to get user with status ${response.status}` 
        };
      }
    } catch (error) {
      console.error('Failed to get user:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Get stored user data
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Get token
  getToken() {
    return localStorage.getItem('token');
  }

  // Test API connection
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/test`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
      
      return {
        success: response.ok,
        status: response.status,
        data: data,
        url: `${API_BASE_URL}/test`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        url: `${API_BASE_URL}/test`
      };
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;


