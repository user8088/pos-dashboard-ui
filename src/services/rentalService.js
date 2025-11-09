const API_BASE_URL = 'http://localhost:8000/api';

class RentalService {
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };
    const response = await fetch(url, config);
    let data;
    try {
      data = await response.clone().json();
    } catch (_) {
      try { data = { message: await response.text() }; } catch (_) { data = {}; }
    }
    if (!response.ok) {
      const msg = data?.message || data?.error || `Request failed (${response.status})`;
      const err = new Error(msg);
      err.status = response.status; err.errors = data?.errors; throw err;
    }
    return data;
  }

  // Items
  async createItem(payload) { return this.makeRequest('/rental-items', { method: 'POST', body: JSON.stringify(payload) }); }
  async listItems(params = {}) {
    // Filter out undefined/null/empty-string params to avoid sending e.g. status=undefined
    const filtered = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const qs = new URLSearchParams(filtered).toString();
    return this.makeRequest(`/rental-items${qs ? `?${qs}` : ''}`);
  }
  async showItem(id) { return this.makeRequest(`/rental-items/${id}`); }
  async updateItem(id, payload) { return this.makeRequest(`/rental-items/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); }
  async deleteItem(id) { return this.makeRequest(`/rental-items/${id}`, { method: 'DELETE' }); }

  // Actions
  async rentItem(id, payload) { return this.makeRequest(`/rental-items/${id}/rent`, { method: 'POST', body: JSON.stringify(payload) }); }
  async returnItem(id, payload) { return this.makeRequest(`/rental-items/${id}/return`, { method: 'POST', body: JSON.stringify(payload) }); }
}

export const rentalService = new RentalService();


