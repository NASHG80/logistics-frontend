import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Shipment API endpoints
export const shipmentAPI = {
  // Get all shipments with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.delayRisk) params.append('delayRisk', filters.delayRisk);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/shipments?${params.toString()}`);
    return response.data;
  },

  // Get single shipment by ID
  getById: async (id) => {
    const response = await api.get(`/shipments/${id}`);
    return response.data;
  },

  // Create new shipment
  create: async (shipmentData) => {
    const response = await api.post('/shipments', shipmentData);
    return response.data;
  },

  // Update shipment
  update: async (id, shipmentData) => {
    const response = await api.put(`/shipments/${id}`, shipmentData);
    return response.data;
  },

  // Delete shipment
  delete: async (id) => {
    const response = await api.delete(`/shipments/${id}`);
    return response.data;
  },

  // Get shipment statistics
  getStats: async () => {
    const response = await api.get('/shipments/stats');
    return response.data;
  },

  // Update shipment status
  updateStatus: async (id, status) => {
    const response = await api.put(`/shipments/${id}`, { status });
    return response.data;
  }
};

// Vehicle API endpoints
export const vehicleAPI = {
  // Get all vehicles with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/vehicles?${params.toString()}`);
    return response.data;
  },

  // Get single vehicle by ID
  getById: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  // Create new vehicle
  create: async (vehicleData) => {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  },

  // Update vehicle
  update: async (id, vehicleData) => {
    const response = await api.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  },

  // Delete vehicle
  delete: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  // Assign vehicle to shipment
  assign: async (vehicleId, shipmentId) => {
    const response = await api.post('/vehicles/assign', { vehicleId, shipmentId });
    return response.data;
  },

  // Unassign vehicle
  unassign: async (id) => {
    const response = await api.post(`/vehicles/unassign/${id}`);
    return response.data;
  },

  // Get vehicle statistics
  getStats: async () => {
    const response = await api.get('/vehicles/stats');
    return response.data;
  },

  // Update vehicle location
  updateLocation: async (id, locationData) => {
    const response = await api.put(`/vehicles/${id}/location`, locationData);
    return response.data;
  },

  // Get active vehicles for live tracking
  getActiveVehicles: async () => {
    const response = await api.get('/vehicles/active');
    return response.data;
  }
};

// User API endpoints
export const userAPI = {
  // Get all drivers
  getDrivers: async () => {
    const response = await api.get('/auth/drivers');
    return response.data;
  }
};

// POD API endpoints
export const podAPI = {
  // Driver uploads POD
  uploadPOD: async (podData) => {
    const response = await api.post('/pod/driver-pod', podData);
    return response.data;
  }
};

// EPOD API endpoints
export const epodAPI = {
  // Customer submits electronic signature
  submitSignature: async (shipmentId, signatureData) => {
    const response = await api.post(`/epod/${shipmentId}`, signatureData);
    return response.data;
  }
};

export default api;
