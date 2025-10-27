// API Configuration for Dashboard Separation
export const getApiBaseUrl = (dashboard) => {
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  return `${baseUrl}/${dashboard}`;
};

export const apiFactory = {
  baseURL: getApiBaseUrl('factory'),
  endpoints: {
    stock: '/stock',
    customers: '/customer',
    units: '/unit',
    categories: '/category',
    analytics: '/analytics',
    rawMaterials: '/raw-material',
    manufacturing: '/manufacturing',
    transport: '/transport',
    payables: '/payables',
    notifications: '/notifications',
    unitConversions: '/unit-conversions'
  }
};

export const apiStore = {
  baseURL: getApiBaseUrl('store'),
  endpoints: {
    stock: '/stock',
    customers: '/customer',
    units: '/unit',
    categories: '/category',
    analytics: '/analytics',
    transport: '/transport',
    payables: '/payables',
    notifications: '/notifications',
    unitConversions: '/unit-conversions'
  }
};

export const getHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});
