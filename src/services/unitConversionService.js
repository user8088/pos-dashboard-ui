import { getApiBaseUrl, getHeaders } from './apiConfig';

// Create unit conversion
export const createUnitConversion = async (dashboard, primaryUnitId, secondaryUnitId, conversionFactor, notes = '') => {
  const baseURL = getApiBaseUrl(dashboard);
  const response = await fetch(`${baseURL}/unit-conversions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      primary_unit_id: primaryUnitId,
      secondary_unit_id: secondaryUnitId,
      conversion_factor: conversionFactor,
      notes: notes,
    }),
  });
  return response.json();
};

// Get all unit conversions
export const getUnitConversions = async (dashboard) => {
  const baseURL = getApiBaseUrl(dashboard);
  const response = await fetch(`${baseURL}/unit-conversions`, {
    headers: getHeaders(),
  });
  return response.json();
};

// Get specific unit conversion by ID
export const getUnitConversion = async (dashboard, id) => {
  const baseURL = getApiBaseUrl(dashboard);
  const response = await fetch(`${baseURL}/unit-conversions/${id}`, {
    headers: getHeaders(),
  });
  return response.json();
};

// Update unit conversion
export const updateUnitConversion = async (dashboard, id, conversionFactor, notes = '') => {
  const baseURL = getApiBaseUrl(dashboard);
  const response = await fetch(`${baseURL}/unit-conversions/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({
      conversion_factor: conversionFactor,
      notes: notes,
    }),
  });
  return response.json();
};

// Delete unit conversion
export const deleteUnitConversion = async (dashboard, id) => {
  const baseURL = getApiBaseUrl(dashboard);
  const response = await fetch(`${baseURL}/unit-conversions/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return response.json();
};

// Get conversion factor between two units
export const getConversionFactor = async (dashboard, primaryUnitId, secondaryUnitId) => {
  const baseURL = getApiBaseUrl(dashboard);
  const response = await fetch(
    `${baseURL}/unit-conversions/factor?primary_unit_id=${primaryUnitId}&secondary_unit_id=${secondaryUnitId}`,
    { headers: getHeaders() }
  );
  return response.json();
};

// Convert value between units
export const convertValue = async (dashboard, value, fromUnitId, toUnitId) => {
  const baseURL = getApiBaseUrl(dashboard);
  const response = await fetch(`${baseURL}/unit-conversions/convert`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      value: value,
      from_unit_id: fromUnitId,
      to_unit_id: toUnitId,
    }),
  });
  return response.json();
};

export default {
  createUnitConversion,
  getUnitConversions,
  getUnitConversion,
  updateUnitConversion,
  deleteUnitConversion,
  getConversionFactor,
  convertValue,
};
