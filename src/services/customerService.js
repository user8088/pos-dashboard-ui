// Reuse same base URL pattern as stockService
const WEB_BASE_URL = 'http://localhost:8000';

class CustomerService {
  async request(path, options = {}) {
    const token = localStorage.getItem('token');
    const url = `${WEB_BASE_URL}${path}`;
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };
    const res = await fetch(url, { ...options, headers });
    let data = null;
    try { data = await res.json(); } catch (e) { data = null; }
    if (!res.ok) {
      const message = data?.message || 'Request failed';
      const err = new Error(message);
      err.status = res.status;
      err.errors = data?.errors;
      throw err;
    }
    return data;
  }

  // Customers CRUD
  list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/customers${qs ? `?${qs}` : ''}`);
  }
  create(payload) {
    return this.request('/api/customers', { method: 'POST', body: JSON.stringify(payload) });
  }
  get(id) {
    return this.request(`/api/customers/${id}`);
  }
  update(id, payload) {
    return this.request(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }
  delete(id) {
    return this.request(`/api/customers/${id}`, { method: 'DELETE' });
  }

  // Profile & related
  profile(id) {
    return this.request(`/api/customers/${id}/profile`);
  }
  rate(id, payload) {
    return this.request(`/api/customers/${id}/rate`, { method: 'POST', body: JSON.stringify(payload) });
  }
  recordPayment(id, payload) {
    return this.request(`/api/customers/${id}/payments`, { method: 'POST', body: JSON.stringify(payload) });
  }
  createSale(id, payload) {
    return this.request(`/api/customers/${id}/sales`, { method: 'POST', body: JSON.stringify(payload) });
  }
}

export const customerService = new CustomerService();


