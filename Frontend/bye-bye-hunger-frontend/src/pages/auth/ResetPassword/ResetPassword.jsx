// src/pages/auth/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [validToken, setValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setValidToken(false);
      setMessage({ type: 'error', text: 'Invalid reset link' });
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/reset-password/${token}`, {
        password: formData.password
      });
      
      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: 'Password reset successfully! Redirecting to sign in...' 
        });
        
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to reset password. Link may have expired.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero Header */}
      <div className="reset-hero-header">
        <div className="container">
          <div className="reset-hero-content">
            <h1 className="reset-hero-title">Reset Password</h1>
            <nav className="reset-breadcrumb">
              <ol className="reset-breadcrumb-list">
                <li className="reset-breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="reset-breadcrumb-item">
                  <Link to="/signin">Sign In</Link>
                </li>
                <li className="reset-breadcrumb-item active" aria-current="page">
                  Reset Password
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Reset Password Section */}
      <section className="reset-section">
        <div className="container">
          <div className="reset-container">
            <div className="reset-card">
              <div className="reset-header">
                <i className="fas fa-key reset-icon"></i>
                <h2>Create New Password</h2>
                <p>Please enter your new password below.</p>
              </div>

              {message.text && (
                <div className={`reset-alert reset-alert-${message.type}`}>
                  <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                  <span>{message.text}</span>
                </div>
              )}

              {validToken ? (
                <form onSubmit={handleSubmit} className="reset-form">
                  <div className="reset-form-group">
                    <label htmlFor="password" className="reset-form-label">
                      <i className="fas fa-lock reset-form-icon"></i>
                      New Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="reset-form-input"
                      placeholder="Enter new password (min. 6 characters)"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="reset-form-group">
                    <label htmlFor="confirmPassword" className="reset-form-label">
                      <i className="fas fa-check-circle reset-form-icon"></i>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="reset-form-input"
                      placeholder="Confirm your new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="reset-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Resetting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        Reset Password
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="reset-error">
                  <p>The reset link is invalid or has expired.</p>
                  <Link to="/forgot-password" className="reset-error-link">
                    Request a new reset link
                  </Link>
                </div>
              )}

              <div className="reset-footer">
                <p>
                  Remember your password?{' '}
                  <Link to="/signin" className="reset-footer-link">
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

export default ResetPassword;