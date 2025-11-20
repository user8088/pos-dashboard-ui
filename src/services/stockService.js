// Direct API URL - Laravel will handle CORS
const WEB_BASE_URL = 'http://localhost:8000';

class StockService {
  constructor() {}

  async request(path, options = {}) {
    const token = localStorage.getItem('token');
    const url = `${WEB_BASE_URL}${path}`;
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };
    const config = { ...options, headers };
    const res = await fetch(url, config);
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

  // Units (API)
  listUnits(params = {}) {
    const mapped = { ...params };
    if (mapped.search && !mapped.q) {
      mapped.q = mapped.search;
      delete mapped.search;
    }
    const qs = new URLSearchParams(mapped).toString();
    return this.request(`/api/units${qs ? `?${qs}` : ''}`);
  }
  createUnit(payload) {
    return this.request('/api/units', { method: 'POST', body: JSON.stringify(payload) });
  }
  updateUnit(id, payload) {
    return this.request(`/api/units/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }
  deleteUnit(id) {
    return this.request(`/api/units/${id}`, { method: 'DELETE' });
  }

  // Categories (API)
  listCategories(params = {}) {
    const mapped = { ...params };
    if (mapped.search && !mapped.q) {
      mapped.q = mapped.search;
      delete mapped.search;
    }
    const qs = new URLSearchParams(mapped).toString();
    return this.request(`/api/product-categories${qs ? `?${qs}` : ''}`);
  }
  createCategory(payload) {
    return this.request('/api/product-categories', { method: 'POST', body: JSON.stringify(payload) });
  }
  updateCategory(id, payload) {
    return this.request(`/api/product-categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }
  deleteCategory(id) {
    return this.request(`/api/product-categories/${id}`, { method: 'DELETE' });
  }

  // Items (using API routes)
  listItems(params = {}) {
    const mapped = { ...params };
    // Map 'search' to 'q' for backend compatibility
    if (mapped.search && !mapped.q) {
      mapped.q = mapped.search;
      delete mapped.search;
    }
    // Remove undefined values
    Object.keys(mapped).forEach(key => {
      if (mapped[key] === undefined || mapped[key] === '') {
        delete mapped[key];
      }
    });
    const qs = new URLSearchParams(mapped).toString();
    return this.request(`/api/items${qs ? `?${qs}` : ''}`);
  }
  showItem(id) {
    return this.request(`/api/items/${id}`);
  }
  listPriceHistory(itemId, params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/stock-items/${itemId}/price-history${qs ? `?${qs}` : ''}`);
  }
  lookupPriceHistoryInvoice(itemId, invoiceNumber) {
    const qs = new URLSearchParams({ invoice_number: invoiceNumber }).toString();
    return this.request(`/api/stock-items/${itemId}/price-history/invoice-lookup?${qs}`);
  }
  createItem(payload) {
    return this.request('/api/items', { method: 'POST', body: JSON.stringify(payload) });
  }
  updateItem(id, payload) {
    return this.request(`/api/items/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }
  deleteItem(id) {
    return this.request(`/api/items/${id}`, { method: 'DELETE' });
  }
}

export const stockService = new StockService();


