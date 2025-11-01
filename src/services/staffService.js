const API_BASE_URL = 'http://localhost:8000/api';

class StaffService {
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

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        } else if (response.status === 422) {
          throw new Error(data.message || 'Validation failed', data.errors);
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(data.message || 'Request failed');
        }
      }
      
      return data;
    } catch (error) {
      console.error('Staff API request failed:', error);
      throw error;
    }
  }

  // User Management
  async getAllUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/users${queryString ? `?${queryString}` : ''}`);
  }

  async getStaff() {
    return this.makeRequest('/staff');
  }

  async getUser(id) {
    return this.makeRequest(`/users/${id}`);
  }

  async createUser(userData) {
    return this.makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.makeRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.makeRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserStats() {
    return this.makeRequest('/user-stats');
  }

  // Attendance Management
  async getAttendanceRecords(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/attendances${queryString ? `?${queryString}` : ''}`);
  }

  async markAttendance(attendanceData) {
    return this.makeRequest('/attendances', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async bulkMarkAttendance(bulkData) {
    return this.makeRequest('/attendances/bulk-mark', {
      method: 'POST',
      body: JSON.stringify(bulkData),
    });
  }

  async getAttendanceSummary(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/attendances/summary/${userId}${queryString ? `?${queryString}` : ''}`);
  }

  async updateAttendance(id, attendanceData) {
    return this.makeRequest(`/attendances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(attendanceData),
    });
  }

  async deleteAttendance(id) {
    return this.makeRequest(`/attendances/${id}`, {
      method: 'DELETE',
    });
  }

  // Salary Structure Management
  async getSalaryStructures(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/salary-structures${queryString ? `?${queryString}` : ''}`);
  }

  async createSalaryStructure(structureData) {
    return this.makeRequest('/salary-structures', {
      method: 'POST',
      body: JSON.stringify(structureData),
    });
  }

  async getSalaryStructureByUser(userId) {
    return this.makeRequest(`/salary-structures/user/${userId}`);
  }

  async updateSalaryStructure(id, structureData) {
    return this.makeRequest(`/salary-structures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(structureData),
    });
  }

  async deleteSalaryStructure(id) {
    return this.makeRequest(`/salary-structures/${id}`, {
      method: 'DELETE',
    });
  }

  // Salary Payments
  async getSalaryPayments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/salary-payments${queryString ? `?${queryString}` : ''}`);
  }

  async createSalaryPayment(paymentData) {
    return this.makeRequest('/salary-payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async generateMonthlyPayments(monthData) {
    return this.makeRequest('/salary-payments/generate-monthly', {
      method: 'POST',
      body: JSON.stringify(monthData),
    });
  }

  async markPaymentAsPaid(id, paymentData) {
    return this.makeRequest(`/salary-payments/${id}/mark-paid`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Convenience alias: accepts (id, paymentDateString)
  async markPaymentPaid(id, paymentDate) {
    return this.markPaymentAsPaid(id, { payment_date: paymentDate });
  }

  async getPaymentSummary(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/salary-payments/summary/${userId}${queryString ? `?${queryString}` : ''}`);
  }

  async updateSalaryPayment(id, paymentData) {
    return this.makeRequest(`/salary-payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });
  }

  async deleteSalaryPayment(id) {
    return this.makeRequest(`/salary-payments/${id}`, {
      method: 'DELETE',
    });
  }

  // Partial payment transactions
  async createPaymentTransaction(paymentId, txn) {
    return this.makeRequest(`/salary-payments/${paymentId}/transactions`, {
      method: 'POST',
      body: JSON.stringify(txn),
    });
  }

  async listPaymentTransactions(paymentId) {
    return this.makeRequest(`/salary-payments/${paymentId}/transactions`);
  }

  async deletePaymentTransaction(txnId) {
    return this.makeRequest(`/salary-payments/transactions/${txnId}`, {
      method: 'DELETE',
    });
  }
}

export const staffService = new StaffService();
