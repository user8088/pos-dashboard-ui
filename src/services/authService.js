// Direct API URL - Laravel will handle CORS
const API_BASE_URL = 'http://localhost:8000/api';

class AuthService {
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      const contentType = response.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        // If backend returned HTML (often a login page), expose a clearer message
        const snippet = text.substring(0, 200);
        throw new Error(`Non-JSON response from server. Check API route and CORS. Preview: ${snippet}`);
      }
      
      if (!response.ok) {
        // Handle different HTTP status codes
        if (response.status === 401) {
          throw new Error(data.message || 'Invalid credentials');
        } else if (response.status === 419 || (data && data.message && data.message.includes('CSRF'))) {
          throw new Error('CSRF token mismatch. Please restart your development server to enable the proxy.');
        } else if (response.status === 422) {
          // Validation errors
          throw new Error(data.message || 'Validation failed', data.errors);
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(data.message || 'Request failed');
        }
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Re-throw with enhanced error information
      const enhancedError = new Error(error.message);
      enhancedError.status = error.status;
      enhancedError.errors = error.errors;
      throw enhancedError;
    }
  }

  async login(credentials) {
    return this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.makeRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(token) {
    return this.makeRequest('/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async logoutAll(token) {
    return this.makeRequest('/logout-all', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getProfile(token) {
    return this.makeRequest('/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async updateProfile(profileData, token) {
    return this.makeRequest('/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
  }

  async getCurrentUser(token) {
    return this.makeRequest('/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

export const authService = new AuthService();
