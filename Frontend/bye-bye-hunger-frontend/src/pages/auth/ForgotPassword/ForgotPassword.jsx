// src/pages/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      
      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: 'Password reset link sent to your email! Please check your inbox.' 
        });
        setEmail('');
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to send reset link. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero Header */}
      <div className="forgot-hero-header">
        <div className="container">
          <div className="forgot-hero-content">
            <h1 className="forgot-hero-title">Forgot Password</h1>
            <nav className="forgot-breadcrumb">
              <ol className="forgot-breadcrumb-list">
                <li className="forgot-breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="forgot-breadcrumb-item">
                  <Link to="/signin">Sign In</Link>
                </li>
                <li className="forgot-breadcrumb-item active" aria-current="page">
                  Forgot Password
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Forgot Password Section */}
      <section className="forgot-section">
        <div className="container">
          <div className="forgot-container">
            <div className="forgot-card">
              <div className="forgot-header">
                <i className="fas fa-lock forgot-icon"></i>
                <h2>Reset Your Password</h2>
                <p>Enter your email address and we'll send you a link to reset your password.</p>
              </div>

              {message.text && (
                <div className={`forgot-alert forgot-alert-${message.type}`}>
                  <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="forgot-form">
                <div className="forgot-form-group">
                  <label htmlFor="email" className="forgot-form-label">
                    <i className="fas fa-envelope forgot-form-icon"></i>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="forgot-form-input"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <button 
                  type="submit" 
                  className="forgot-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              <div className="forgot-footer">
                <p>
                  Remember your password?{' '}
                  <Link to="/signin" className="forgot-footer-link">
                    Back to Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ForgotPassword;