import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Admin.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalFoods: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalBookings: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Fetch orders
      const ordersRes = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orders = ordersRes.data.data || [];
      
      // Fetch users
      const usersRes = await axios.get(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const users = usersRes.data.users || [];
      
      // Fetch foods
      const foodsRes = await axios.get(`${API_URL}/foods`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const foods = foodsRes.data.data || [];
      
      // Calculate stats
      const pendingOrders = orders.filter(o => o.status === "pending").length;
      const completedOrders = orders.filter(o => o.status === "delivered").length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      setStats({
        totalOrders: orders.length,
        totalUsers: users.length,
        totalFoods: foods.length,
        pendingOrders,
        completedOrders,
        totalRevenue,
        totalBookings: 0 // Will be fetched separately
      });
      
      // Get recent orders (last 5)
      setRecentOrders(orders.slice(0, 5));
      
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, Administrator!</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-primary">
            <i className="fas fa-shopping-bag"></i>
          </div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-success">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-warning">
            <i className="fas fa-utensils"></i>
          </div>
          <div className="stat-content">
            <h3>Menu Items</h3>
            <p className="stat-value">{stats.totalFoods}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-info">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>Pending Orders</h3>
            <p className="stat-value">{stats.pendingOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-secondary">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>Completed</h3>
            <p className="stat-value">{stats.completedOrders}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-danger">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <Link to="/admin/manage-foods" className="action-card">
            <i className="fas fa-plus-circle"></i>
            <span>Add New Food</span>
          </Link>
          <Link to="/admin/manage-orders" className="action-card">
            <i className="fas fa-truck"></i>
            <span>Process Orders</span>
          </Link>
          <Link to="/admin/manage-users" className="action-card">
            <i className="fas fa-user-plus"></i>
            <span>Manage Users</span>
          </Link>
          <Link to="/admin/manage-bookings" className="action-card">
            <i className="fas fa-calendar-check"></i>
            <span>View Bookings</span>
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="recent-orders">
        <h3>Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-shopping-bag"></i>
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <span className="order-id">#{order.orderNumber}</span>
                    </td>
                    <td>{order.user?.name || 'Guest'}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td className="text-primary fw-bold">${order.totalAmount?.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link 
                        to={`/admin/manage-orders`} 
                        className="btn-view"
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;