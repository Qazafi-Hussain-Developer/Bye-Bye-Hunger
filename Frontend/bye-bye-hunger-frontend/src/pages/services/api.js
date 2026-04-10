// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH API ============
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  getDashboardStats: () => api.get('/auth/dashboard'),
  addLoyaltyPoints: (points, reason) => api.post('/auth/add-points', { points, reason }),
};

// ============ ADMIN API (NEW - for admin panel) ============
export const adminAPI = {
  // User management
  getAllUsers: () => api.get('/auth/users'),
  updateUserRole: (userId, role) => api.put(`/auth/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/auth/users/${userId}`),
  
  // Dashboard stats
  getAdminStats: () => api.get('/auth/admin/stats'),
  
  // Booking management (admin)
  getAllBookings: (params = {}) => api.get('/bookings/admin/all', { params }),
  getBookingStats: () => api.get('/bookings/admin/stats'),
  deleteBooking: (bookingId) => api.delete(`/bookings/${bookingId}`),
  updateBookingStatus: (bookingId, status) => api.put(`/bookings/${bookingId}/status`, { status }),
  
  // Contact management
  getAllContacts: (params = {}) => api.get('/contact', { params }),
  getContactStats: () => api.get('/contact/stats'),
  replyToContact: (contactId, replyMessage) => api.post(`/contact/${contactId}/reply`, { replyMessage }),
  updateContactStatus: (contactId, status) => api.put(`/contact/${contactId}/status`, { status }),
  deleteContact: (contactId) => api.delete(`/contact/${contactId}`),
};

// ============ FOODS API ============
export const foodAPI = {
  getAll: (params = {}) => api.get('/foods', { params }),
  getById: (id) => api.get(`/foods/${id}`),
  getByCategory: (category) => api.get(`/foods/category/${category}`),
  create: (foodData) => api.post('/foods', foodData),
  update: (id, foodData) => api.put(`/foods/${id}`, foodData),
  delete: (id) => api.delete(`/foods/${id}`),
  toggleAvailability: (id) => api.patch(`/foods/${id}/toggle-availability`),
};

// ============ ORDERS API ============
export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
  trackOrder: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  getAllOrders: (params = {}) => api.get('/orders', { params }),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// ============ BOOKINGS API ============
export const bookingAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  getAvailableTimeSlots: (date, guests) => api.get(`/bookings/available-times/${date}`, { params: { guests } }),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
};

// ============ CONTACT API ============
export const contactAPI = {
  submit: (contactData) => api.post('/contact', contactData),
  getAll: (params = {}) => api.get('/contact', { params }),
  getById: (id) => api.get(`/contact/${id}`),
  reply: (id, replyMessage) => api.post(`/contact/${id}/reply`, { replyMessage }),
  delete: (id) => api.delete(`/contact/${id}`),
  updateStatus: (id, status) => api.put(`/contact/${id}/status`, { status }),
  getStats: () => api.get('/contact/stats'),
};

// ============ TESTIMONIALS API ============
export const testimonialAPI = {
  getAll: (params = {}) => api.get('/testimonials', { params }),
  getById: (id) => api.get(`/testimonials/${id}`),
  create: (data) => api.post('/testimonials', data),
  update: (id, data) => api.put(`/testimonials/${id}`, data),
  delete: (id) => api.delete(`/testimonials/${id}`),
  updateStatus: (id, status) => api.patch(`/testimonials/${id}/status`, { status }),
};

// ============ STATS API ============
export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
  getAdminStats: () => api.get('/stats/admin'),
};

// Default export
export default api;