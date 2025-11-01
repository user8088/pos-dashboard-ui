const WEB_BASE_URL = 'http://localhost:8000';

class FactoryStockService {
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

  // Units (Factory API)
  listUnits(params = {}) {
    const mapped = { ...params };
    if (mapped.search && !mapped.q) {
      mapped.q = mapped.search;
      delete mapped.search;
    }
    const qs = new URLSearchParams(mapped).toString();
    return this.request(`/api/factory-units${qs ? `?${qs}` : ''}`);
  }
  createUnit(payload) {
    return this.request('/api/factory-units', { method: 'POST', body: JSON.stringify(payload) });
  }
  updateUnit(id, payload) {
    return this.request(`/api/factory-units/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }
  deleteUnit(id) {
    return this.request(`/api/factory-units/${id}`, { method: 'DELETE' });
  }

  // Categories (Factory API)
  listCategories(params = {}) {
    const mapped = { ...params };
    if (mapped.search && !mapped.q) {
      mapped.q = mapped.search;
      delete mapped.search;
    }
    const qs = new URLSearchParams(mapped).toString();
    return this.request(`/api/factory-product-categories${qs ? `?${qs}` : ''}`);
  }
  createCategory(payload) {
    return this.request('/api/factory-product-categories', { method: 'POST', body: JSON.stringify(payload) });
  }
  updateCategory(id, payload) {
    return this.request(`/api/factory-product-categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }
  deleteCategory(id) {
    return this.request(`/api/factory-product-categories/${id}`, { method: 'DELETE' });
  }

  // Items (Factory API)
  listItems(params = {}) {
    const mapped = { ...params };
    if (mapped.search && !mapped.q) {
      mapped.q = mapped.search;
      delete mapped.search;
    }
    Object.keys(mapped).forEach(key => {
      if (mapped[key] === undefined || mapped[key] === '') {
        delete mapped[key];
      }
    });
    const qs = new URLSearchParams(mapped).toString();
    return this.request(`/api/factory-stock-items${qs ? `?${qs}` : ''}`);
  }
  showItem(id) {
    return this.request(`/api/factory-stock-items/${id}`);
  }
  createItem(payload) {
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value !== undefined)
    );
    return this.request('/api/factory-stock-items', { method: 'POST', body: JSON.stringify(cleanPayload) });
  }
  updateItem(id, payload) {
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value !== undefined)
    );
    return this.request(`/api/factory-stock-items/${id}`, { method: 'PUT', body: JSON.stringify(cleanPayload) });
  }
  deleteItem(id) {
    return this.request(`/api/factory-stock-items/${id}`, { method: 'DELETE' });
  }

  // Produce Stock Item
  produceItem(id, quantity) {
    return this.request(`/api/factory-stock-items/${id}/produce`, { 
      method: 'POST', 
      body: JSON.stringify({ quantity }) 
    });
  }

  // Raw Materials (Factory API)
  listRawMaterials(params = {}) {
    const mapped = { ...params };
    if (mapped.search && !mapped.q) {
      mapped.q = mapped.search;
      delete mapped.search;
    }
    Object.keys(mapped).forEach(key => {
      if (mapped[key] === undefined || mapped[key] === '') {
        delete mapped[key];
      }
    });
    const qs = new URLSearchParams(mapped).toString();
    return this.request(`/api/factory-raw-materials${qs ? `?${qs}` : ''}`);
  }
  showRawMaterial(id) {
    return this.request(`/api/factory-raw-materials/${id}`);
  }
  createRawMaterial(payload) {
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value !== undefined)
    );
    return this.request('/api/factory-raw-materials', { method: 'POST', body: JSON.stringify(cleanPayload) });
  }
  updateRawMaterial(id, payload) {
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value !== undefined)
    );
    return this.request(`/api/factory-raw-materials/${id}`, { method: 'PUT', body: JSON.stringify(cleanPayload) });
  }
  deleteRawMaterial(id) {
    return this.request(`/api/factory-raw-materials/${id}`, { method: 'DELETE' });
  }
  addRawMaterialQuantity(id, quantity) {
    return this.request(`/api/factory-raw-materials/${id}/add-quantity`, { 
      method: 'POST', 
      body: JSON.stringify({ quantity }) 
    });
  }
  reduceRawMaterialQuantity(id, quantity) {
    return this.request(`/api/factory-raw-materials/${id}/reduce-quantity`, { 
      method: 'POST', 
      body: JSON.stringify({ quantity }) 
    });
  }
}

export const factoryStockService = new FactoryStockService();

