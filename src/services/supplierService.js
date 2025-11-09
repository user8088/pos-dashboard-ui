const API_BASE_URL = 'http://localhost:8000/api';

class SupplierService {
  async request(path, options = {}) {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}${path}`;
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };
    const res = await fetch(url, { ...options, headers });
    let data = null;
    try { data = await res.clone().json(); } catch (_) { try { data = { message: await res.text() }; } catch (_) { data = null; } }
    if (!res.ok) {
      const message = data?.message || data?.error || `Request failed (${res.status})`;
      const err = new Error(message);
      err.status = res.status; err.errors = data?.errors; throw err;
    }
    return data;
  }

  // Suppliers CRUD
  async listSuppliers(params = {}) {
    const filtered = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== ''));
    const qs = new URLSearchParams(filtered).toString();
    return this.request(`/suppliers${qs ? `?${qs}` : ''}`);
  }
  async createSupplier(payload) { return this.request('/suppliers', { method: 'POST', body: JSON.stringify(payload) }); }
  async getSupplier(id) { return this.request(`/suppliers/${id}`); }
  async updateSupplier(id, payload) { return this.request(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); }
  async deleteSupplier(id) { return this.request(`/suppliers/${id}`, { method: 'DELETE' }); }

  // Purchases
  async createPurchase(supplierId, payload) { return this.request(`/suppliers/${supplierId}/purchases`, { method: 'POST', body: JSON.stringify(payload) }); }
  async listPurchases(supplierId, params = {}) {
    const filtered = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== ''));
    const qs = new URLSearchParams(filtered).toString();
    return this.request(`/suppliers/${supplierId}/purchases${qs ? `?${qs}` : ''}`);
  }
  async repeatPurchaseBySerial(supplierId, serial) { return this.request(`/suppliers/${supplierId}/purchases/${encodeURIComponent(serial)}/repeat`, { method: 'POST' }); }
}

export const supplierService = new SupplierService();


