const WEB_BASE_URL = 'http://localhost:8000';

class InvoiceService {
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

  listInvoices(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/api/invoices${qs ? `?${qs}` : ''}`);
  }
  getInvoice(id) {
    return this.request(`/api/invoices/${id}`);
  }
  createInvoice(payload) {
    // Remove undefined values from payload to avoid JSON issues
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value !== undefined)
    );
    return this.request('/api/invoices', { method: 'POST', body: JSON.stringify(cleanPayload) });
  }

  async downloadInvoice(id) {
    const token = localStorage.getItem('token');
    const url = `${WEB_BASE_URL}/api/invoices/${id}/download`;
    const headers = {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
    const res = await fetch(url, { headers });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to download invoice');
    }
    
    // Get the filename from Content-Disposition header or use a default
    const contentDisposition = res.headers.get('content-disposition');
    const filenameMatch = contentDisposition?.match(/filename="?(.+)"?/);
    const filename = filenameMatch ? filenameMatch[1] : `invoice-${id}.pdf`;
    
    // Create blob and download
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
    
    return { success: true };
  }

  async fetchInvoicePdf(id) {
    const token = localStorage.getItem('token');
    const url = `${WEB_BASE_URL}/api/invoices/${id}/download`;
    const headers = {
      'Accept': 'application/pdf',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error?.message || 'Failed to fetch invoice PDF');
    }
    return res.blob();
  }
}

export const invoiceService = new InvoiceService();


