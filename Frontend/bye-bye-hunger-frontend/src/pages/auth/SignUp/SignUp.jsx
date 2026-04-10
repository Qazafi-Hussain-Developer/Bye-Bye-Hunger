import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    dietaryPreference: '',
    agreeTerms: false
  });

  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');

    // Validate password match
    if (name === 'password' || name === 'confirmPassword') {
      if (name === 'password' && formData.confirmPassword) {
        setPasswordError(value !== formData.confirmPassword ? 'Passwords do not match' : '');
      } else if (name === 'confirmPassword') {
        setPasswordError(formData.password !== value ? 'Passwords do not match' : '');
      }
    }
  };

  const validatePassword = (password) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (password.length < minLength) {
      return 'Password must be at least 6 characters long';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!hasNumbers) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validateName = (name) => {
    if (name.length < 2) {
      return 'Name must be at least 2 characters long';
    }
    if (name.length > 50) {
      return 'Name cannot exceed 50 characters';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate name
    const nameError = validateName(formData.name);
    if (nameError) {
      setError(nameError);
      return;
    }

    // Validate email
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setError(emailError);
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordValidationError = validatePassword(formData.password);
    if (passwordValidationError) {
      setError(passwordValidationError);
      return;
    }

    // Validate terms agreement
    if (!formData.agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || '',
        address: formData.address || '',
        dietaryPreference: formData.dietaryPreference || '',
        rememberMe: false
      };
      
      const result = await signUp(userData);
      
      if (result.success) {
        setSuccess('Account created successfully! Redirecting to dashboard...');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(result.error || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      setError('Failed to create account. Please check your connection and try again.');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero Header */}
      <div className="signup-hero-header">
        <div className="container">
          <div className="signup-hero-content">
            <h1 className="signup-hero-title">Sign Up</h1>
            <nav className="signup-breadcrumb">
              <ol className="signup-breadcrumb-list">
                <li className="signup-breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="signup-breadcrumb-item">
                  <Link to="/pages">Pages</Link>
                </li>
                <li className="signup-breadcrumb-item active" aria-current="page">
                  Sign Up
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Sign Up Section */}
      <section className="signup-section">
        <div className="container">
          <div className="signup-header">
            <h5 className="section-title ff-secondary signup-subtitle">Join Us Today</h5>
            <h1 className="signup-title">Create Your Account</h1>
          </div>

          <div className="signup-container">
            <div className="signup-card">
              {/* Error Alert */}
              {error && (
                <div className="signup-alert signup-alert-error" role="alert">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{error}</span>
                </div>
              )}
              
              {/* Success Alert */}
              {success && (
                <div className="signup-alert signup-alert-success" role="alert">
                  <i className="fas fa-check-circle"></i>
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="signup-form">
                <div className="signup-form-group">
                  <label htmlFor="name" className="signup-form-label">
                    <i className="fas fa-user signup-form-icon"></i>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="signup-form-input"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>

                <div className="signup-form-group">
                  <label htmlFor="email" className="signup-form-label">
                    <i className="fas fa-envelope signup-form-icon"></i>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="signup-form-input"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                <div className="signup-form-group">
                  <label htmlFor="phone" className="signup-form-label">
                    <i className="fas fa-phone signup-form-icon"></i>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="signup-form-input"
                    placeholder="Enter your phone number (optional)"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="tel"
                  />
                </div>

                <div className="signup-form-group">
                  <label htmlFor="address" className="signup-form-label">
                    <i className="fas fa-map-marker-alt signup-form-icon"></i>
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="signup-form-input"
                    placeholder="Enter your address (optional)"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="street-address"
                  />
                </div>

                <div className="signup-form-group">
                  <label htmlFor="dietaryPreference" className="signup-form-label">
                    <i className="fas fa-leaf signup-form-icon"></i>
                    Dietary Preference
                  </label>
                  <select
                    id="dietaryPreference"
                    name="dietaryPreference"
                    className="signup-form-input signup-form-select"
                    value={formData.dietaryPreference}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">No Preference</option>
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten-free">Gluten Free</option>
                  </select>
                </div>

                <div className="signup-form-group">
                  <label htmlFor="password" className="signup-form-label">
                    <i className="fas fa-lock signup-form-icon"></i>
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className={`signup-form-input ${passwordError ? 'error' : ''}`}
                    placeholder="Create a password (min. 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  {formData.password && !passwordError && (
                    <small className="signup-password-hint">
                      <i className="fas fa-info-circle"></i>
                      Password must be at least 6 characters with uppercase, lowercase & number
                    </small>
                  )}
                </div>

                <div className="signup-form-group">
                  <label htmlFor="confirmPassword" className="signup-form-label">
                    <i className="fas fa-lock signup-form-icon"></i>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`signup-form-input ${passwordError ? 'error' : ''}`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  {passwordError && (
                    <span className="signup-error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      {passwordError}
                    </span>
                  )}
                </div>

                <div className="signup-form-options">
                  <label className="signup-checkbox-label">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                    <span>
                      I agree to the{' '}
                      <Link to="/terms" className="signup-terms-link">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="signup-terms-link">
                        Privacy Policy
                      </Link>
                      {' '}*
                    </span>
                  </label>
                </div>

                <button 
                  type="submit" 
                  className={`signup-btn ${loading ? 'signup-btn-loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Sign Up <i className="fas fa-user-plus"></i>
                    </>
                  )}
                </button>
              </form>

              <div className="signup-divider">
                <span className="signup-divider-text">Or sign up with</span>
              </div>

              <div className="signup-social">
                <button 
                  className="signup-social-btn google"
                  disabled={loading}
                  onClick={() => setError('Google sign up coming soon!')}
                >
                  <i className="fab fa-google"></i>
                  Google
                </button>
                <button 
                  className="signup-social-btn facebook"
                  disabled={loading}
                  onClick={() => setError('Facebook sign up coming soon!')}
                >
                  <i className="fab fa-facebook-f"></i>
                  Facebook
                </button>
              </div>

              <div className="signup-footer">
                <p className="signup-footer-text">
                  Already have an account?{' '}
                  <Link to="/signin" className="signup-footer-link">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>

            {/* Feature Side */}
            <div className="signup-feature">
              <div className="signup-feature-content">
                <h2 className="signup-feature-title">Join Our Restaurant Family</h2>
                <p className="signup-feature-description">
                  Create an account to unlock amazing benefits:
                </p>
                <ul className="signup-feature-list">
                  <li className="signup-feature-item">
                    <i className="fas fa-star signup-feature-icon"></i>
                    <span>50 welcome bonus loyalty points</span>
                  </li>
                  <li className="signup-feature-item">
                    <i className="fas fa-gift signup-feature-icon"></i>
                    <span>Birthday special offers</span>
                  </li>
                  <li className="signup-feature-item">
                    <i className="fas fa-tags signup-feature-icon"></i>
                    <span>Early access to new menu items</span>
                  </li>
                  <li className="signup-feature-item">
                    <i className="fas fa-truck signup-feature-icon"></i>
                    <span>Free delivery on your birthday</span>
                  </li>
                  <li className="signup-feature-item">
                    <i className="fas fa-percent signup-feature-icon"></i>
                    <span>Exclusive member discounts</span>
                  </li>
                  <li className="signup-feature-item">
                    <i className="fas fa-utensils signup-feature-icon"></i>
                    <span>Save your favorite dishes</span>
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

export default SignUp;