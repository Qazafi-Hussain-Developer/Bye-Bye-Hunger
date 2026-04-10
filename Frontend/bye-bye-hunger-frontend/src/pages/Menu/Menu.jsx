// import { getImageUrl } from '@/src/pages/utils/"imageHelper.js';
import { getImageUrl } from '@/pages/utils/imageHelper.js';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/pages/context/AuthContext';
import axios from 'axios';
import './Menu.css';
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Menu = () => {
  const [activeTab, setActiveTab] = useState('main-course');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(null);
  const [cartMessage, setCartMessage] = useState({ id: null, text: '' });
  
  const { isAuthenticated } = useAuth();

  // Define categories
  const categories = [
    { id: 'appetizer', name: 'Appetizer', icon: 'fa-utensils', label: 'Starters' },
    { id: 'main-course', name: 'Main Course', icon: 'fa-hamburger', label: 'Main' },
    { id: 'dessert', name: 'Dessert', icon: 'fa-ice-cream', label: 'Sweet' },
    { id: 'beverage', name: 'Beverage', icon: 'fa-coffee', label: 'Drinks' },
    { id: 'soup', name: 'Soup', icon: 'fa-utensil-spoon', label: 'Soup' },
    { id: 'salad', name: 'Salad', icon: 'fa-leaf', label: 'Healthy' }
  ];

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/foods?category=${activeTab}`);
        
        if (response.data.success) {
          setMenuItems(response.data.data);
        } else {
          setError('Failed to load menu items');
        }
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError('Unable to load menu. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [activeTab]);

const addToCart = (item) => {
  if (!isAuthenticated) {
    setCartMessage({ id: item._id, text: 'Please sign in to add items to cart' });
    setTimeout(() => setCartMessage({ id: null, text: '' }), 3000);
    return;
  }

  setAddingToCart(item._id);
  
  // Get existing cart from localStorage
  const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Check if item already exists in cart
  const existingItemIndex = existingCart.findIndex(cartItem => cartItem._id === item._id || cartItem.id === item._id);
  
  if (existingItemIndex !== -1) {
    // Increase quantity if already in cart
    existingCart[existingItemIndex].quantity += 1;
  } else {
    // Add new item to cart - Include BOTH _id and id for compatibility
    existingCart.push({
      _id: item._id,           // ← ADD THIS (MongoDB ID)
      id: item._id,            // ← Keep for compatibility
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      isVegetarian: item.isVegetarian,
      dietaryPreference: item.isVegetarian ? 'veg' : 'non-veg'
    });
  }
  
  // Save to localStorage
  localStorage.setItem('cart', JSON.stringify(existingCart));
  window.dispatchEvent(new Event('storage')); // ← ADD THIS
  // Trigger cart update event
  window.dispatchEvent(new Event('cartUpdated'));
  
  setCartMessage({ id: item._id, text: 'Added to cart!' });
  setTimeout(() => {
    setCartMessage({ id: null, text: '' });
    setAddingToCart(null);
  }, 1500);
};
  // Get category icon
  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : 'fa-utensils';
  };

  // Get category label
  const getCategoryLabel = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.label : categoryId;
  };

  if (loading) {
    return (
      <div className="menu-loading">
        <div className="spinner"></div>
        <p>Loading our delicious menu...</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero Header */}
      <div className="menu-hero-header">
        <div className="container">
          <div className="menu-hero-content">
            <h1 className="menu-hero-title">Food Menu</h1>
            <nav className="menu-breadcrumb">
              <ol className="menu-breadcrumb-list">
                <li className="menu-breadcrumb-item">
                  <a href="/">Home</a>
                </li>
                <li className="menu-breadcrumb-item">
                  <a href="/pages">Pages</a>
                </li>
                <li className="menu-breadcrumb-item active" aria-current="page">
                  Menu
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <section className="menu-page-section">
        <div className="container">
          <div className="menu-header">
            <h5 className="section-title ff-secondary menu-subtitle">Food Menu</h5>
            <h1 className="menu-title">Most Popular Items</h1>
          </div>

          {/* Tab Navigation */}
          <div className="menu-tabs">
            {categories.map(category => (
              <button 
                key={category.id}
                className={`menu-tab ${activeTab === category.id ? 'active' : ''}`}
                onClick={() => setActiveTab(category.id)}
              >
                <i className={`fas ${category.icon} menu-tab-icon`}></i>
                <div className="menu-tab-text">
                  <small className="text-body">{category.label}</small>
                  <h6>{category.name}</h6>
                </div>
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="menu-alert menu-alert-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Menu Items Grid */}
          {menuItems.length === 0 && !error ? (
            <div className="menu-empty">
              <i className="fas fa-utensils"></i>
              <h3>No items in this category</h3>
              <p>Check back soon for new delicious items!</p>
            </div>
          ) : (
            <div className="menu-grid">
              {menuItems.map((item) => (
                <div key={item._id} className="menu-item">
                <img 
  src={getImageUrl(item.image)} 
  alt={item.name} 
  className="menu-item-image"
  onError={(e) => {
    e.target.src = '/images/default-food.jpg';
  }}
/>
                  <div className="menu-item-content">
                    <div className="menu-item-header">
                      <h5 className="menu-item-name">{item.name}</h5>
                      <span className="menu-item-price">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="menu-item-description">{item.description}</p>
                    <div className="menu-item-footer">
                      <div className="menu-item-badges">
                        {item.isVegetarian && (
                          <span className="badge badge-veg">
                            <i className="fas fa-leaf"></i> Veg
                          </span>
                        )}
                        {item.isSpicy && (
                          <span className="badge badge-spicy">
                            <i className="fas fa-pepper-hot"></i> Spicy
                          </span>
                        )}
                        {item.preparationTime && (
                          <span className="badge badge-time">
                            <i className="fas fa-clock"></i> {item.preparationTime} min
                          </span>
                        )}
                      </div>
                      <button 
                        className={`add-to-cart-btn ${addingToCart === item._id ? 'adding' : ''}`}
                        onClick={() => addToCart(item)}
                        disabled={addingToCart === item._id}
                      >
                        {addingToCart === item._id ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-shopping-cart"></i>
                        )}
                        Add to Cart
                      </button>
                    </div>
                    {cartMessage.id === item._id && (
                      <div className={`cart-message ${cartMessage.text.includes('sign in') ? 'error' : 'success'}`}>
                        <i className={`fas fa-${cartMessage.text.includes('sign in') ? 'exclamation-circle' : 'check-circle'}`}></i>
                        {cartMessage.text}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Menu;