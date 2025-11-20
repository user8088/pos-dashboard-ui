const API_BASE_URL = 'http://localhost:8000/api';

class AnalyticsService {
  async makeRequest(endpoint, options = {}, authToken = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = authToken ?? localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      let data;
      // Try to read JSON; if it fails (e.g., HTML 500 page), fall back to text
      try {
        data = await response.clone().json();
      } catch (_) {
        try {
          const txt = await response.text();
          data = { message: txt };
        } catch (_) {
          data = {};
        }
      }

      if (!response.ok) {
        const serverMessage = (data && (data.message || data.error)) ? String(data.message || data.error) : '';
        if (response.status === 401) {
          throw new Error(serverMessage || 'Unauthorized. Please login again.');
        } else if (response.status === 422) {
          const error = new Error(serverMessage || 'Validation failed');
          error.errors = data.errors;
          error.status = 422;
          throw error;
        } else if (response.status === 500) {
          throw new Error(serverMessage || 'Server error. Please try again later.');
        } else {
          throw new Error(serverMessage || `Request failed (${response.status})`);
        }
      }

      return data;
    } catch (error) {
      console.error('Analytics API request failed:', error);
      throw error;
    }
  }

  // Get dashboard analytics (all analytics in one call)
  async getDashboardAnalytics(authToken = null) {
    return this.makeRequest('/analytics/dashboard', {}, authToken);
  }

  // Get today's analytics
  async getTodayAnalytics(authToken = null) {
    return this.makeRequest('/analytics/today', {}, authToken);
  }

  // Get monthly analytics
  async getMonthlyAnalytics(month = null, compareWith = null, authToken = null) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (compareWith) params.append('compare_with', compareWith);
    const queryString = params.toString();
    return this.makeRequest(`/analytics/monthly${queryString ? `?${queryString}` : ''}`, {}, authToken);
  }

  // Get yearly analytics
  async getYearlyAnalytics(year = null, compareWith = null, authToken = null) {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (compareWith) params.append('compare_with', compareWith);
    const queryString = params.toString();
    return this.makeRequest(`/analytics/yearly${queryString ? `?${queryString}` : ''}`, {}, authToken);
  }

  // Get business season analytics
  async getBusinessSeasonAnalytics(seasonId = null, compareWith = null, authToken = null) {
    const params = new URLSearchParams();
    if (seasonId) params.append('season_id', seasonId);
    if (compareWith) params.append('compare_with', compareWith);
    const queryString = params.toString();
    return this.makeRequest(`/analytics/business-season${queryString ? `?${queryString}` : ''}`, {}, authToken);
  }

  // Business Season Management
  async listBusinessSeasons(isActive = null, authToken = null) {
    const params = new URLSearchParams();
    if (isActive !== null) params.append('is_active', isActive);
    const queryString = params.toString();
    return this.makeRequest(`/business-seasons${queryString ? `?${queryString}` : ''}`, {}, authToken);
  }

  async getBusinessSeason(id, authToken = null) {
    return this.makeRequest(`/business-seasons/${id}`, {}, authToken);
  }

  async createBusinessSeason(payload, authToken = null) {
    return this.makeRequest('/business-seasons', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, authToken);
  }

  async updateBusinessSeason(id, payload, authToken = null) {
    return this.makeRequest(`/business-seasons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }, authToken);
  }

  async deleteBusinessSeason(id, authToken = null) {
    return this.makeRequest(`/business-seasons/${id}`, {
      method: 'DELETE',
    }, authToken);
  }
}

export default new AnalyticsService();

