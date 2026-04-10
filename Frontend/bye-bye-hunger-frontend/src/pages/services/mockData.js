// src/services/mockData.js
// This file is deprecated - all data comes from the backend API now.
// Keeping it only for development fallback if backend is not available.

import api from './api';

// Check if backend is available
export const checkBackendStatus = async () => {
  try {
    await api.get('/health');
    return true;
  } catch (error) {
    console.warn('Backend not available, using mock data');
    return false;
  }
};

// Initialize mock data (only used as fallback)
export const initializeMockData = () => {
  // Only initialize if backend is not available
  // This is a fallback for development
  if (!localStorage.getItem('users') && !localStorage.getItem('backend_available')) {
    localStorage.setItem(
      'users',
      JSON.stringify([
        { id: '1', email: 'admin@gmail.com', password: 'admin123', role: 'admin', name: 'Admin User' },
        { id: '2', email: 'user1@gmail.com', password: 'user123', role: 'user', name: 'John Doe' },
      ])
    );
  }

  if (!localStorage.getItem('foods')) {
    localStorage.setItem(
      'foods',
      JSON.stringify([
        { id: '1', name: 'Margherita Pizza', price: 12.99, category: 'main-course', description: 'Fresh mozzarella, tomato sauce, basil', isVegetarian: true },
        { id: '2', name: 'Caesar Salad', price: 8.99, category: 'salad', description: 'Romaine lettuce, croutons, parmesan cheese', isVegetarian: true },
        { id: '3', name: 'Grilled Salmon', price: 18.99, category: 'main-course', description: 'Fresh salmon with lemon butter sauce', isVegetarian: false },
        { id: '4', name: 'Chocolate Lava Cake', price: 6.99, category: 'dessert', description: 'Warm chocolate cake with molten center', isVegetarian: true },
      ])
    );
  }

  if (!localStorage.getItem('orders')) {
    localStorage.setItem(
      'orders',
      JSON.stringify([
        {
          id: 'ORD-1',
          userEmail: 'user1@gmail.com',
          items: [{ name: 'Burger' }, { name: 'Pizza' }],
          total: 21.98,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      ])
    );
  }
};