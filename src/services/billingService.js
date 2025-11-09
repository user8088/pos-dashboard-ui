const API_BASE_URL = 'http://localhost:8000/api';

class BillingService {
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
      try {
        const txt = await response.text();
        data = { message: txt };
      } catch (_) {
        data = {};
      }
    }
    if (!response.ok) {
      const msg = (data && (data.message || data.error)) ? String(data.message || data.error) : `Request failed (${response.status})`;
      const err = new Error(msg);
      err.status = response.status;
      err.errors = data?.errors;
      throw err;
    }
    return data;
  }

  // Bills
  async createBill(payload) {
    // payload: { tag, amount, bill_date, note?, udhaar_id? }
    return this.makeRequest('/bills', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async listBills(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/bills${queryString ? `?${queryString}` : ''}`);
  }
}

export const billingService = new BillingService();


