const WEB_BASE_URL = 'http://localhost:8000';

class ReservationService {
  async request(path, options = {}) {
    const token = localStorage.getItem('token');
    const url = `${WEB_BASE_URL}${path}`;
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };
    const res = await fetch(url, { ...options, headers });
    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
    if (!res.ok) {
      const message = data?.message || 'Request failed';
      const err = new Error(message);
      err.status = res.status;
      err.errors = data?.errors;
      throw err;
    }
    return data;
  }

  createReservation(payload) {
    return this.request('/api/reservations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  completeReservation(reservationId, payload) {
    return this.request(`/api/reservations/${reservationId}/complete`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  releaseReservation(reservationId, payload) {
    return this.request(`/api/reservations/${reservationId}/release`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async fetchReservationReceipt(reservationId) {
    const token = localStorage.getItem('token');
    const url = `${WEB_BASE_URL}/api/reservations/${reservationId}/receipt`;
    const headers = {
      Accept: 'application/pdf',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error?.message || 'Failed to download reservation receipt');
    }
    return res.blob();
  }
}

export const reservationService = new ReservationService();

