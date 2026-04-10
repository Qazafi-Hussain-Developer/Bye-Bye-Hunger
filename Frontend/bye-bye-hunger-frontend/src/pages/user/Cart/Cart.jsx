import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Cart.css";
import { getImageUrl } from '../../utils/imageHelper';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Cart = () => {
  const { user, isAuthenticated, token } = useAuth();
  const { 
    cart, 
    cartCount, 
    cartTotal,
    removeFromCart, 
    updateQuantity, 
    clearCart,
    isLoaded  // ← ADD THIS
  } = useCart();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Checkout form data
  const [checkoutData, setCheckoutData] = useState({
    deliveryAddress: user?.address || "",
    paymentMethod: "cash",
    orderType: "delivery",
    specialInstructions: ""
  });

  // Debug: Log cart when it changes
  useEffect(() => {
    console.log('🛒 Cart updated in Cart page:', cart);
    console.log('📦 Cart count:', cartCount);
    console.log('💰 Cart total:', cartTotal);
  }, [cart, cartCount, cartTotal]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
    }
  }, [isAuthenticated, navigate]);

  // Set default address from user profile
  useEffect(() => {
    if (user?.address) {
      setCheckoutData(prev => ({ ...prev, deliveryAddress: user.address }));
    }
  }, [user]);

  // Calculate totals
  const subtotal = cartTotal;
  const tax = subtotal * 0.1;
  const deliveryFee = checkoutData.orderType === "takeaway" ? 0 : 5;
  const total = subtotal + tax + deliveryFee;

  // Handle quantity change
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  // Handle checkout form change
  const handleCheckoutChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  // Place order
  const placeOrder = async () => {
    if (cart.length === 0) {
      setError("Your cart is empty. Please add some items first.");
      return;
    }

    // Validate delivery address for delivery orders
    if (checkoutData.orderType === "delivery" && !checkoutData.deliveryAddress.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    // Prepare order items
    const orderItems = cart.map(item => ({
      foodId: item._id || item.id,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions || ""
    }));

    console.log('📦 Sending order items:', orderItems);

    try {
      setCheckoutLoading(true);
      setError("");
      
      const response = await axios.post(
        `${API_URL}/orders`,
        {
          items: orderItems,
          deliveryAddress: checkoutData.deliveryAddress,
          paymentMethod: checkoutData.paymentMethod,
          specialInstructions: checkoutData.specialInstructions,
          orderType: checkoutData.orderType
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccess(response.data.message || "Order placed successfully!");
        clearCart();
        
        setTimeout(() => {
          navigate("/my-orders");
        }, 2000);
      }
    } catch (err) {
      console.error("Order placement error:", err);
      setError(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Show loading while cart is being loaded from localStorage
  if (!isLoaded) {
    return (
      <div className="cart-loading py-5">
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="cart-page py-5">
      <div className="container">
        <div className="cart-header">
          <h1 className="section-title ff-secondary text-primary fw-normal mb-3">
            My Cart
          </h1>
          <p className="text-muted">Review your items before checkout</p>
        </div>

        {error && (
          <div className="cart-alert cart-alert-error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="cart-alert cart-alert-success">
            <i className="fas fa-check-circle"></i>
            <span>{success}</span>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="empty-cart">
            <i className="fas fa-shopping-cart"></i>
            <h3>Your Cart is Empty</h3>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link to="/menu" className="btn btn-primary">
              Browse Menu <i className="fas fa-arrow-right ms-2"></i>
            </Link>
          </div>
        ) : (
          <div className="cart-grid">
            {/* Cart Items Section */}
            <div className="cart-items-section">
              <div className="cart-items-header">
                <h3>Cart Items ({cartCount})</h3>
                <button className="btn btn-sm btn-outline-danger" onClick={clearCart}>
                  <i className="fas fa-trash-alt"></i> Clear Cart
                </button>
              </div>
              
              <div className="cart-items-list">
                {cart.map(item => (
                  <div key={item._id || item.id} className="cart-item">
                    <div className="cart-item-image">
                     {item.image ? (
  <img src={item.image.startsWith('http') ? item.image : `${API_URL.replace('/api', '')}${item.image}`} alt={item.name} />
) : (
  <div className="image-placeholder">
    <i className="fas fa-utensils"></i>
  </div>
)}
                    </div>
                    
                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      <p className="item-price">${(item.price || 0).toFixed(2)}</p>
                      {item.isVegetarian !== undefined && (
                        <span className={`item-badge ${item.isVegetarian ? 'veg' : 'non-veg'}`}>
                          {item.isVegetarian ? "Vegetarian" : "Non-Veg"}
                        </span>
                      )}
                    </div>
                    
                    <div className="cart-item-quantity">
                      <button 
                        className="qty-btn"
                        onClick={() => handleQuantityChange(item._id || item.id, (item.quantity || 1) - 1)}
                        disabled={checkoutLoading}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <span className="qty-value">{item.quantity || 1}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => handleQuantityChange(item._id || item.id, (item.quantity || 1) + 1)}
                        disabled={checkoutLoading}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                    
                    <div className="cart-item-total">
                      <span>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                      <button 
                        className="remove-btn"
                        onClick={() => removeFromCart(item._id || item.id)}
                        disabled={checkoutLoading}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="order-summary-section">
              <div className="order-summary-card">
                <h3>Order Summary</h3>
                
                <div className="summary-items">
                  <div className="summary-row">
                    <span>Subtotal ({cartCount} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Delivery Fee</span>
                    <span>
                      {deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Order Type Selection */}
                <div className="order-type-section">
                  <label className="section-label">Order Type</label>
                  <div className="order-type-buttons">
                    <button
                      type="button"
                      className={`type-btn ${checkoutData.orderType === "delivery" ? "active" : ""}`}
                      onClick={() => setCheckoutData(prev => ({ ...prev, orderType: "delivery" }))}
                      disabled={checkoutLoading}
                    >
                      <i className="fas fa-truck"></i>
                      Delivery
                    </button>
                    <button
                      type="button"
                      className={`type-btn ${checkoutData.orderType === "takeaway" ? "active" : ""}`}
                      onClick={() => setCheckoutData(prev => ({ ...prev, orderType: "takeaway" }))}
                      disabled={checkoutLoading}
                    >
                      <i className="fas fa-store"></i>
                      Takeaway
                    </button>
                  </div>
                </div>

                {/* Delivery Address (only for delivery) */}
                {checkoutData.orderType === "delivery" && (
                  <div className="form-group">
                    <label htmlFor="deliveryAddress">
                      <i className="fas fa-map-marker-alt"></i> Delivery Address *
                    </label>
                    <textarea
                      id="deliveryAddress"
                      name="deliveryAddress"
                      rows="2"
                      placeholder="Enter your complete delivery address"
                      value={checkoutData.deliveryAddress}
                      onChange={handleCheckoutChange}
                      disabled={checkoutLoading}
                    ></textarea>
                  </div>
                )}

                {/* Payment Method */}
                <div className="form-group">
                  <label htmlFor="paymentMethod">
                    <i className="fas fa-credit-card"></i> Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={checkoutData.paymentMethod}
                    onChange={handleCheckoutChange}
                    disabled={checkoutLoading}
                  >
                    <option value="cash">Cash on Delivery</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>

                {/* Special Instructions */}
                <div className="form-group">
                  <label htmlFor="specialInstructions">
                    <i className="fas fa-comment"></i> Special Instructions
                  </label>
                  <textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    rows="2"
                    placeholder="Any special requests? (e.g., extra spicy, no onions, etc.)"
                    value={checkoutData.specialInstructions}
                    onChange={handleCheckoutChange}
                    disabled={checkoutLoading}
                  ></textarea>
                </div>

                {/* Order Button */}
                <button 
                  className="checkout-btn"
                  onClick={placeOrder}
                  disabled={checkoutLoading || cart.length === 0}
                >
                  {checkoutLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle"></i>
                      Place Order (${total.toFixed(2)})
                    </>
                  )}
                </button>
                
                <p className="secure-checkout">
                  <i className="fas fa-lock"></i> Secure checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;