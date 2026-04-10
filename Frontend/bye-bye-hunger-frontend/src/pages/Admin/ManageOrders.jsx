import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getAvailableActions = (currentStatus) => {
    const actions = {
      pending: ['Confirm Order'],
      confirmed: ['Start Preparing'],
      preparing: ['Mark Ready'],
      ready: ['Assign Driver', 'Mark Out for Delivery'],
      'out-for-delivery': ['Mark Delivered'],
      delivered: ['Mark Completed'],
      cancelled: []
    };
    return actions[currentStatus] || [];
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.put(`${API_URL}/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders(); // Refresh list
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  const getStatusOptions = (currentStatus) => {
    const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    return statusFlow.slice(currentIndex + 1);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="admin-manage-orders">
      <div className="page-header">
        <h1>Manage Orders</h1>
        <p>View and manage all customer orders</p>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Rating</th>
              <th>Status</th>
              <th>ETA</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>
                  <span className="order-id">{order.orderNumber}</span>
                </td>
                <td>{order.user?.name || 'Guest'}</td>
                <td>{order.items?.length || 0} items</td>
                <td className="fw-bold">${order.totalAmount?.toFixed(2)}</td>
                <td className="rating-cell">
                  {order.userRating ? (
                    <div className="admin-rating">
                      <span className="stars">
                        {'★'.repeat(order.userRating)}{'☆'.repeat(5 - order.userRating)}
                      </span>
                      {order.userReview && (
                        <span className="review-tooltip" title={order.userReview}>
                          <i className="fas fa-comment"></i>
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="no-rating">—</span>
                  )}
                </td>
                <td>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <span className="eta-badge">{order.eta || 'Processing'}</span>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="btn-view"
                    onClick={() => {
                      console.log('Opening order:', order._id);
                      setSelectedOrder(order._id);
                    }}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center empty-message">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details</h3>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {orders.find(o => o._id === selectedOrder)?.items.map((item, idx) => (
                <div key={idx} className="order-item-detail">
                  <span className="item-name">{item.name}</span>
                  <span className="item-qty">x{item.quantity}</span>
                  <span className="item-price">${item.price}</span>
                </div>
              ))}
              <div className="order-summary">
                <p>Subtotal: ${orders.find(o => o._id === selectedOrder)?.subtotal}</p>
                <p>Tax: ${orders.find(o => o._id === selectedOrder)?.tax}</p>
                <p>Delivery Fee: ${orders.find(o => o._id === selectedOrder)?.deliveryFee}</p>
                <p className="total">Total: ${orders.find(o => o._id === selectedOrder)?.totalAmount}</p>
              </div>
              <div className="order-actions">
                {/* Primary Action Button (Confirm, Start Preparing, etc.) */}
                {getAvailableActions(orders.find(o => o._id === selectedOrder)?.status).map(action => {
                  let statusMap = {
                    'Confirm Order': 'confirmed',
                    'Start Preparing': 'preparing',
                    'Mark Ready': 'ready',
                    'Assign Driver': 'out-for-delivery',
                    'Mark Out for Delivery': 'out-for-delivery',
                    'Mark Delivered': 'delivered',
                    'Mark Completed': 'completed'
                  };
                  return (
                    <button 
                      key={action}
                      className="btn btn-primary btn-sm"
                      onClick={() => updateOrderStatus(selectedOrder, statusMap[action])}
                    >
                      {action}
                    </button>
                  );
                })}
                
                {/* Quick status buttons */}
                <div className="status-quick-actions">
                  {getStatusOptions(orders.find(o => o._id === selectedOrder)?.status).map(status => (
                    <button 
                      key={status}
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => updateOrderStatus(selectedOrder, status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;