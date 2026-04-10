import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./MyOrders.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ========== STAR RATING COMPONENT (MOVE THIS OUTSIDE) ==========
const StarRating = ({ rating, onRate, orderId, disabled }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(rating || 0);
  const [submitting, setSubmitting] = useState(false);

  const handleRate = async (value) => {
    if (disabled || submitting) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/orders/${orderId}/rating`,
        { rating: value, review: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSelectedRating(value);
        if (onRate) onRate(orderId, value);
      }
    } catch (error) {
      console.error('Rating error:', error);
      alert(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`fas fa-star ${star <= (hoverRating || selectedRating) ? 'active' : ''}`}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => !disabled && setHoverRating(0)}
          onClick={() => !disabled && handleRate(star)}
          style={{ cursor: disabled ? 'default' : 'pointer', opacity: submitting ? 0.5 : 1 }}
        />
      ))}
    </div>
  );
};
// ========== END STAR RATING COMPONENT ==========

const MyOrders = () => {
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Update rating in orders list
  const handleRatingUpdate = (orderId, rating) => {
    setOrders(orders.map(order => 
      order._id === orderId 
        ? { ...order, userRating: rating, ratedAt: new Date() }
        : order
    ));
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
    }
  }, [isAuthenticated, navigate]);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !token) return;

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setOrders(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, token]);

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      setCancelling(true);
      const response = await axios.put(
        `${API_URL}/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, status: "cancelled", cancelledAt: new Date() }
            : order
        ));
        setError("");
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      setError(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  // Get order status badge class
  const getStatusClass = (status) => {
    const statusMap = {
      pending: "status-pending",
      confirmed: "status-confirmed",
      preparing: "status-preparing",
      ready: "status-ready",
      "out-for-delivery": "status-out-for-delivery",
      delivered: "status-delivered",
      cancelled: "status-cancelled"
    };
    return statusMap[status] || "status-pending";
  };

  // Get status display name
  const getStatusName = (status) => {
    const statusMap = {
      pending: "Pending",
      confirmed: "Confirmed",
      preparing: "Preparing",
      ready: "Ready for Pickup",
      "out-for-delivery": "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled"
    };
    return statusMap[status] || status;
  };

  // Check if order can be cancelled
  const canCancel = (status) => {
    return ["pending", "confirmed"].includes(status);
  };

  if (loading) {
    return (
      <div className="myorders-loading">
        <div className="spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="myorders-page py-5">
      <div className="container">
        <div className="myorders-header">
          <h1 className="section-title ff-secondary text-primary fw-normal mb-3">
            My Orders
          </h1>
          <p className="text-muted">Track and manage your orders</p>
        </div>

        {error && (
          <div className="myorders-alert myorders-alert-error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="empty-orders">
            <i className="fas fa-shopping-bag"></i>
            <h3>No Orders Yet</h3>
            <p>You haven't placed any orders yet. Start exploring our delicious menu!</p>
            <Link to="/menu" className="btn btn-primary">
              Browse Menu <i className="fas fa-arrow-right ms-2"></i>
            </Link>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <span className="order-number">#{order.orderNumber}</span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    {order.eta && order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <span className="order-eta">
                        <i className="fas fa-clock"></i> ETA: {order.eta}
                      </span>
                    )}
                  </div>
                  <span className={`order-status ${getStatusClass(order.status)}`}>
                    {getStatusName(order.status)}
                  </span>
                </div>
                
                <div className="order-items">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="order-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">x{item.quantity}</span>
                      <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="order-item more-items">
                      <span>+{order.items.length - 3} more items</span>
                    </div>
                  )}
                </div>
                
                <div className="order-footer">
                  <div className="order-total">
                    <span>Total:</span>
                    <strong>${order.totalAmount.toFixed(2)}</strong>
                  </div>
                  <div className="order-actions">
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
                    >
                      {selectedOrder === order._id ? 'Hide Details' : 'View Details'}
                    </button>
                    {canCancel(order.status) && (
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={cancelling}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* ========== RATING SECTION ========== */}
                {order.status === 'delivered' && (
                  <div className="order-rating">
                    <StarRating 
                      rating={order.userRating} 
                      orderId={order._id}
                      onRate={handleRatingUpdate}
                      disabled={!!order.userRating}
                    />
                    {order.userRating && (
                      <span className="rated-text">
                        <i className="fas fa-check-circle"></i> Thank you for rating!
                      </span>
                    )}
                  </div>
                )}
                {/* ========== END RATING SECTION ========== */}

                {/* Order Details Expanded View */}
                {selectedOrder === order._id && (
                  <div className="order-details-expanded">
                    <div className="details-section">
                      <h4>Order Items</h4>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="detail-item">
                          <div className="detail-item-info">
                            <span className="detail-item-name">{item.name}</span>
                            {item.specialInstructions && (
                              <span className="detail-item-note">Note: {item.specialInstructions}</span>
                            )}
                          </div>
                          <div className="detail-item-price">
                            {item.quantity} x ${item.price} = ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="details-section">
                      <h4>Order Summary</h4>
                      <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>${order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Tax (10%):</span>
                        <span>${order.tax.toFixed(2)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Delivery Fee:</span>
                        <span>${order.deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="summary-row total">
                        <span>Total:</span>
                        <span>${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="details-section">
                      <h4>Delivery Information</h4>
                      <p><strong>Address:</strong> {order.deliveryAddress}</p>
                      <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                      <p><strong>Order Type:</strong> {order.orderType || 'Delivery'}</p>
                      {order.specialInstructions && (
                        <p><strong>Special Instructions:</strong> {order.specialInstructions}</p>
                      )}
                    </div>
                    
                    {order.trackingTimeline && (
                      <div className="details-section">
                        <h4>Order Timeline</h4>
                        <div className="timeline">
                          {order.trackingTimeline.map((event, idx) => (
                            <div key={idx} className="timeline-item">
                              <div className="timeline-dot"></div>
                              <div className="timeline-content">
                                <strong>{event.status}</strong>
                                <span>{new Date(event.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;