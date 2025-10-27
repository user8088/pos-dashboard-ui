import { getApiBaseUrl, getHeaders } from './apiConfig';

export class ApiService {
  constructor(dashboard) {
    this.dashboard = dashboard;
    this.baseURL = getApiBaseUrl(dashboard);
  }
  
  // Stock Management
  async getStock() {
    const response = await fetch(`${this.baseURL}/stock`, {
      headers: getHeaders(),
    });
    return response.json();
  }
  
  async addStock(data) {
    const response = await fetch(`${this.baseURL}/stock`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }
  
  async updateStock(id, data) {
    const response = await fetch(`${this.baseURL}/stock/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }
  
  async deleteStock(id) {
    const response = await fetch(`${this.baseURL}/stock/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response.json();
  }
  
  // Production (Factory only)
  async produceStock(id, data) {
    if (this.dashboard !== 'factory') {
      throw new Error('Production only available in Factory dashboard');
    }
    const response = await fetch(`${this.baseURL}/stock/${id}/produce`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }
  
  // Raw Materials (Factory only)
  async getRawMaterials() {
    if (this.dashboard !== 'factory') {
      throw new Error('Raw materials only available in Factory dashboard');
    }
    const response = await fetch(`${this.baseURL}/raw-material`, {
      headers: getHeaders(),
    });
    return response.json();
  }
  
  async addRawMaterial(data) {
    if (this.dashboard !== 'factory') {
      throw new Error('Raw materials only available in Factory dashboard');
    }
    const response = await fetch(`${this.baseURL}/raw-material`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }
  
  // Customer Management
  async getCustomers() {
    const response = await fetch(`${this.baseURL}/customer`, {
      headers: getHeaders(),
    });
    return response.json();
  }
  
  async addCustomer(data) {
    const response = await fetch(`${this.baseURL}/customer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }
  
  async getCustomer(id) {
    const response = await fetch(`${this.baseURL}/customer/${id}`, {
      headers: getHeaders(),
    });
    return response.json();
  }
  
  async recordPurchase(customerId, data) {
    const response = await fetch(`${this.baseURL}/customer/${customerId}/purchase`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }
  
  async getCustomerPurchases(customerId) {
    const response = await fetch(`${this.baseURL}/customer/${customerId}/purchases`, {
      headers: getHeaders(),
    });
    return response.json();
  }
  
  // Units
  async getUnits() {
    const response = await fetch(`${this.baseURL}/unit`, {
      headers: getHeaders(),
    });
    return response.json();
  }
  
  async addUnit(data) {
    const response = await fetch(`${this.baseURL}/unit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }
  
  async updateUnit(id, data) {
    const response = await fetch(`${this.baseURL}/unit/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }
  
  async deleteUnit(id) {
    const response = await fetch(`${this.baseURL}/unit/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response.json();
  }
  
  // Categories
  async getCategories() {
    const response = await fetch(`${this.baseURL}/category`, {
      headers: getHeaders(),
    });
    return response.json();
  }
  
  async addCategory(data) {
    const response = await fetch(`${this.baseURL}/category`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }
  
  async updateCategory(id, data) {
    const response = await fetch(`${this.baseURL}/category/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }
  
  async deleteCategory(id) {
    const response = await fetch(`${this.baseURL}/category/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response.json();
  }
  
  // Analytics
  async getDashboard(period = 'today') {
    const response = await fetch(`${this.baseURL}/analytics/dashboard?period=${period}`, {
      headers: getHeaders(),
    });
    return response.json();
  }
  
  async getTodayAnalytics() {
    const response = await fetch(`${this.baseURL}/analytics/today`, {
      headers: getHeaders(),
    });
    return response.json();
  }
  
  // Manufacturing (Factory only)
  async getManufacturingDashboard() {
    if (this.dashboard !== 'factory') {
      throw new Error('Manufacturing analytics only available in Factory dashboard');
    }
    const response = await fetch(`${this.baseURL}/manufacturing/dashboard`, {
      headers: getHeaders(),
    });
    return response.json();
  }
  
  // Unit Conversions
  async getUnitConversions() {
    const response = await fetch(`${this.baseURL}/unit-conversions`, {
      headers: getHeaders(),
    });
    return response.json();
  }
  
  async createUnitConversion(data) {
    const response = await fetch(`${this.baseURL}/unit-conversions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }
  
  async updateUnitConversion(id, data) {
    const response = await fetch(`${this.baseURL}/unit-conversions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }
  
  async deleteUnitConversion(id) {
    const response = await fetch(`${this.baseURL}/unit-conversions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response.json();
  }
  
  // Transport
  async getVehicles() {
    const response = await fetch(`${this.baseURL}/transport/vehicles`, {
      headers: getHeaders(),
    });
    return response.json();
  }
  
  async addVehicle(data) {
    const response = await fetch(`${this.baseURL}/transport/vehicles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }
  
  async getRuns() {
    const response = await fetch(`${this.baseURL}/transport/runs`, {
      headers: getHeaders(),
    });
    return response.json();
  }
  
  async addRun(data) {
    const response = await fetch(`${this.baseURL}/transport/runs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }
  
  // Payables
  async getPayables() {
    const response = await fetch(`${this.baseURL}/payables`, {
      headers: getHeaders(),
    });
    return response.json();
  }
  
  async addPayable(data) {
    const response = await fetch(`${this.baseURL}/payables`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }
  
  // Notifications
  async getNotifications() {
    const response = await fetch(`${this.baseURL}/notifications`, {
      headers: getHeaders(),
    });
    return response.json();
  }

  async markNotificationRead(id) {
    const response = await fetch(`${this.baseURL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return response.json();
  }

  // Staff Management
  async getStaff() {
    const response = await fetch(`${this.baseURL}/staff`, {
      headers: getHeaders(),
    });
    return response.json();
  }

  async addStaff(data) {
    const response = await fetch(`${this.baseURL}/staff`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateStaff(id, data) {
    const response = await fetch(`${this.baseURL}/staff/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async deleteStaff(id) {
    const response = await fetch(`${this.baseURL}/staff/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response.json();
  }

  async getStaffStats() {
    const response = await fetch(`${this.baseURL}/staff/stats`, {
      headers: getHeaders(),
    });
    return response.json();
  }

  // Attendance Management
  async getStaffAttendance(staffId, month = null) {
    const url = month 
      ? `${this.baseURL}/staff/${staffId}/attendance?month=${month}`
      : `${this.baseURL}/staff/${staffId}/attendance`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    return response.json();
  }

  async markAttendance(data) {
    const response = await fetch(`${this.baseURL}/staff/attendance`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async getAttendanceStats() {
    const response = await fetch(`${this.baseURL}/staff/attendance/stats`, {
      headers: getHeaders(),
    });
    return response.json();
  }

  // Salary Management
  async getStaffSalary(staffId, month = null) {
    const url = month 
      ? `${this.baseURL}/staff/${staffId}/salary?month=${month}`
      : `${this.baseURL}/staff/${staffId}/salary`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    return response.json();
  }

  async paySalary(data) {
    const response = await fetch(`${this.baseURL}/staff/salary/pay`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async getSalaryHistory(staffId) {
    const response = await fetch(`${this.baseURL}/staff/${staffId}/salary/history`, {
      headers: getHeaders(),
    });
    return response.json();
  }

  // Accounts (for payment)
  async getAccounts() {
    const response = await fetch(`${this.baseURL}/accounts`, {
      headers: getHeaders(),
    });
    return response.json();
  }
}
