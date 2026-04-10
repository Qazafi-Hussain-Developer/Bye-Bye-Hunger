// src/services/auth.js
import api from './api';

// Store token in localStorage or sessionStorage
export const setToken = (token, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem('token', token);
  } else {
    sessionStorage.setItem('token', token);
  }
};

// Get stored token
export const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Remove token
export const removeToken = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

// Login user
export const login = async (email, password, rememberMe = false) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    setToken(token, rememberMe);
    return { success: true, user, token };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Login failed. Please try again.',
    };
  }
};

// Register user
export const signup = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data;
    
    setToken(token, userData.rememberMe || false);
    return { success: true, user, token };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Signup failed. Please try again.',
    };
  }
};

// Logout user
export const logout = () => {
  removeToken();
  window.location.href = '/';
};

// Get current user profile
export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const response = await api.get('/auth/profile');
    return response.data.user;
  } catch (error) {
    removeToken();
    return null;
  }
};

// Update profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/auth/profile', profileData);
    return { success: true, user: response.data.user };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update profile',
    };
  }
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  try {
    await api.put('/auth/change-password', { currentPassword, newPassword });
    return { success: true, message: 'Password changed successfully' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to change password',
    };
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};