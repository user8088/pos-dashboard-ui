const WEB_BASE_URL = 'http://localhost:8000';

class AccountService {
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

  listAccounts(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/accounts${qs ? `?${qs}` : ''}`);
  }

  getAccount(id) {
    return this.request(`/api/accounts/${id}`);
  }

  createAccount(payload) {
    return this.request('/api/accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  updateAccount(id, payload) {
    return this.request(`/api/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  deleteAccount(id) {
    return this.request(`/api/accounts/${id}`, {
      method: 'DELETE',
    });
  }

  transferFunds(payload) {
    return this.request('/api/accounts/transfer', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getAccountTransactions(id, params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/accounts/${id}/transactions${qs ? `?${qs}` : ''}`);
  }

  getAccountsSummary() {
    return this.request('/api/accounts-summary');
  }

  addTransaction(payload) {
    return this.request('/api/accounts/add-transaction', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getAccountsByType(types = []) {
    const params = types.length > 0 ? { types: types.join(',') } : {};
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/accounts-by-type${qs ? `?${qs}` : ''}`);
  }
}

export const accountService = new AccountService();

