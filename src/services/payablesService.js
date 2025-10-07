// Payables Service for managing bills and rents
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class PayablesService {
  getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // List all payables (bills and rents)
  async getAllPayables() {
    try {
      const response = await fetch(`${API_BASE_URL}/core/payables`, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error('Error fetching payables:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Add a new payable (bill or rent)
  async addPayable(payableData) {
    try {
      const response = await fetch(`${API_BASE_URL}/core/payables`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(payableData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error adding payable:', error);
      return { success: false, error: error.message };
    }
  }

  // Update an existing payable
  async updatePayable(id, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/core/payables/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeader(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating payable:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark payable as paid
  async markAsPaid(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/core/payables/${id}/mark-paid`, {
        method: 'POST',
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error marking payable as paid:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete a payable
  async deletePayable(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/core/payables/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error deleting payable:', error);
      return { success: false, error: error.message };
    }
  }

  // Get overdue payables
  getOverduePayables(payables) {
    const today = new Date();
    return payables.filter(payable => {
      if (payable.status === 'paid' || !payable.due_date) return false;
      return new Date(payable.due_date) < today;
    });
  }

  // Get pending payables
  getPendingPayables(payables) {
    return payables.filter(payable => payable.status === 'pending');
  }

  // Get paid payables
  getPaidPayables(payables) {
    return payables.filter(payable => payable.status === 'paid');
  }

  // Get total amount for payables
  getTotalAmount(payables) {
    return payables.reduce((total, payable) => total + (payable.amount || 0), 0);
  }

  // Get total pending amount
  getTotalPendingAmount(payables) {
    return this.getPendingPayables(payables).reduce((total, payable) => total + (payable.amount || 0), 0);
  }
}

const payablesService = new PayablesService();
export default payablesService;
