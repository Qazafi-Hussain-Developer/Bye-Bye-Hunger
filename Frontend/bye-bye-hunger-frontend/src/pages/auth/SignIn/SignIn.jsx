import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './SignIn.css';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!formData.password) {
      setError('Please enter your password');
      return;
    }
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      const result = await signIn(formData.email, formData.password, formData.rememberMe);
      
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        
        // Redirect based on role after a short delay
        setTimeout(() => {
          if (result.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        }, 1000);
      } else {
        setError(result.error || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('Failed to sign in. Please check your connection and try again.');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero Header */}
      <div className="signin-hero-header">
        <div className="container">
          <div className="signin-hero-content">
            <h1 className="signin-hero-title">Sign In</h1>
            <nav className="signin-breadcrumb">
              <ol className="signin-breadcrumb-list">
                <li className="signin-breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="signin-breadcrumb-item">
                  <Link to="/pages">Pages</Link>
                </li>
                <li className="signin-breadcrumb-item active" aria-current="page">
                  Sign In
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Sign In Section */}
      <section className="signin-section">
        <div className="container">
          <div className="signin-header">
            <h5 className="section-title ff-secondary signin-subtitle">Welcome Back</h5>
            <h1 className="signin-title">Sign In to Your Account</h1>
          </div>

          <div className="signin-container">
            <div className="signin-card">
              {/* Error Alert */}
              {error && (
                <div className="signin-alert signin-alert-error" role="alert">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{error}</span>
                </div>
              )}
              
              {/* Success Alert */}
              {success && (
                <div className="signin-alert signin-alert-success" role="alert">
                  <i className="fas fa-check-circle"></i>
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="signin-form">
                <div className="signin-form-group">
                  <label htmlFor="email" className="signin-form-label">
                    <i className="fas fa-envelope signin-form-icon"></i>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="signin-form-input"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                <div className="signin-form-group">
                  <label htmlFor="password" className="signin-form-label">
                    <i className="fas fa-lock signin-form-icon"></i>
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="signin-form-input"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>

                <div className="signin-form-options">
                  <label className="signin-checkbox-label">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <span>Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="signin-forgot-link">
  Forgot Password?
</Link>
                </div>

                <button 
                  type="submit" 
                  className={`signin-btn ${loading ? 'signin-btn-loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In <i className="fas fa-arrow-right"></i>
                    </>
                  )}
                </button>
              </form>

              <div className="signin-divider">
                <span className="signin-divider-text">Or sign in with</span>
              </div>

              <div className="signin-social">
                <button 
                  className="signin-social-btn google"
                  disabled={loading}
                  onClick={() => {
                    setError('Google login coming soon!');
                  }}
                >
                  <i className="fab fa-google"></i>
                  Google
                </button>
                <button 
                  className="signin-social-btn facebook"
                  disabled={loading}
                  onClick={() => {
                    setError('Facebook login coming soon!');
                  }}
                >
                  <i className="fab fa-facebook-f"></i>
                  Facebook
                </button>
              </div>

              <div className="signin-footer">
                <p className="signin-footer-text">
                  Don't have an account?{' '}
                  <Link to="/signup" className="signin-footer-link">
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>

            {/* Feature Side */}
            <div className="signin-feature">
              <div className="signin-feature-content">
                <h2 className="signin-feature-title">Welcome to Restoran</h2>
                <p className="signin-feature-description">
                  Sign in to access your account and enjoy exclusive benefits:
                </p>
                <ul className="signin-feature-list">
                  <li className="signin-feature-item">
                    <i className="fas fa-utensils signin-feature-icon"></i>
                    <span>Save your favorite dishes</span>
                  </li>
                  <li className="signin-feature-item">
                    <i className="fas fa-calendar-alt signin-feature-icon"></i>
                    <span>Quick table reservations</span>
                  </li>
                  <li className="signin-feature-item">
                    <i className="fas fa-gift signin-feature-icon"></i>
                    <span>Exclusive member offers</span>
                  </li>
                  <li className="signin-feature-item">
                    <i className="fas fa-clock signin-feature-icon"></i>
                    <span>Order history and reorder</span>
                  </li>
                  <li className="signin-feature-item">
                    <i className="fas fa-star signin-feature-icon"></i>
                    <span>Earn loyalty points on every order</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SignIn;

