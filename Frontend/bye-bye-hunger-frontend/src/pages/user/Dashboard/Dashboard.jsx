import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, getDashboardStats, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    loyaltyPoints: 0,
    totalOrders: 0,
    recentOrders: [],
    recentBookings: [],
    loyaltyHistory: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const result = await getDashboardStats();
        
        if (result.success) {
          setStats(result.stats);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Something went wrong. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, getDashboardStats]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error py-5">
        <div className="container text-center">
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-section py-5">
      <div className="container">
        {/* Welcome Header */}
        <div className="text-center mb-5">
          <h5 className="section-title ff-secondary text-primary fw-normal">
            Dashboard
          </h5>
          <h1 className="mb-3">
            Welcome, <span className="text-primary">{user?.name || 'User'}!</span>
          </h1>
          <p className="text-body">
            Manage your orders, profile and enjoy exclusive benefits.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-lg-3 col-md-6">
            <div className="dashboard-stat-card text-center p-4">
              <div className="stat-icon">
                <i className="fas fa-star"></i>
              </div>
              <h3 className="stat-value">{stats.loyaltyPoints || 0}</h3>
              <p className="stat-label">Loyalty Points</p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="dashboard-stat-card text-center p-4">
              <div className="stat-icon">
                <i className="fas fa-shopping-bag"></i>
              </div>
              <h3 className="stat-value">{stats.totalOrders || 0}</h3>
              <p className="stat-label">Total Orders</p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="dashboard-stat-card text-center p-4">
              <div className="stat-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h3 className="stat-value">{stats.recentBookings?.length || 0}</h3>
              <p className="stat-label">Active Bookings</p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="dashboard-stat-card text-center p-4">
              <div className="stat-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <h3 className="stat-value">Member</h3>
              <p className="stat-label">Since</p>
              <small className="text-muted">
                {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
              </small>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <div className="dashboard-card text-center p-4">
              <div className="card-icon">
                <i className="fas fa-shopping-bag"></i>
              </div>
              <h4 className="mb-3">My Orders</h4>
              <p className="text-body mb-4">
                View all your previous and current orders. Track delivery status.
              </p>
              <Link to="/my-orders" className="btn btn-primary">
                View Orders <i className="fas fa-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="dashboard-card text-center p-4">
              <div className="card-icon">
                <i className="fas fa-user"></i>
              </div>
              <h4 className="mb-3">My Profile</h4>
              <p className="text-body mb-4">
                Update your personal information and dietary preferences.
              </p>
              <Link to="/profile" className="btn btn-primary">
                Edit Profile <i className="fas fa-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="dashboard-card text-center p-4">
              <div className="card-icon">
                <i className="fas fa-utensils"></i>
              </div>
              <h4 className="mb-3">Book a Table</h4>
              <p className="text-body mb-4">
                Reserve your favorite table for a memorable dining experience.
              </p>
              <Link to="/book-table" className="btn btn-primary">
                Book Now <i className="fas fa-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        {stats.recentOrders && stats.recentOrders.length > 0 && (
          <div className="recent-section mt-5">
            <h3 className="mb-4">
              <i className="fas fa-clock me-2 text-primary"></i>
              Recent Orders
            </h3>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order, index) => (
                    <tr key={index}>
                      <td>
                        <span className="fw-semibold">{order.orderNumber}</span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>${order.totalAmount?.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/my-orders/${order._id}`} className="btn btn-sm btn-outline-primary">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Bookings Section */}
        {stats.recentBookings && stats.recentBookings.length > 0 && (
          <div className="recent-section mt-4">
            <h3 className="mb-4">
              <i className="fas fa-calendar-alt me-2 text-primary"></i>
              Recent Bookings
            </h3>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Guests</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map((booking, index) => (
                    <tr key={index}>
                      <td>{new Date(booking.date).toLocaleDateString()}</td>
                      <td>{booking.time}</td>
                      <td>{booking.guests}</td>
                      <td>
                        <span className={`status-badge status-${booking.status}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/my-bookings/${booking.id}`} className="btn btn-sm btn-outline-primary">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Loyalty Points History */}
        {stats.loyaltyHistory && stats.loyaltyHistory.length > 0 && (
          <div className="loyalty-section mt-4">
            <h3 className="mb-4">
              <i className="fas fa-gift me-2 text-primary"></i>
              Points History
            </h3>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Points</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.loyaltyHistory.slice(0, 5).map((item, index) => (
                    <tr key={index}>
                      <td>{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="text-success fw-bold">+{item.points}</td>
                      <td>{item.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;