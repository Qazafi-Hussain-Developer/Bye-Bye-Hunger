import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../pages/context/AuthContext';
import axios from 'axios';
import './BookTable.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const BookTable = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    date: '',
    time: '',
    guests: 2,
    special_requests: ''
  });
  
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dateSelected, setDateSelected] = useState(false);

  // Fetch available time slots when date changes
  const handleDateChange = async (e) => {
    const date = e.target.value;
    setFormData({ ...formData, date, time: '' });
    setDateSelected(true);
    
    if (date) {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/bookings/available-times/${date}?guests=${formData.guests}`);
        
        if (response.data.success) {
          setAvailableSlots(response.data.availableSlots);
        }
      } catch (err) {
        console.error('Error fetching available slots:', err);
        setError('Failed to load available time slots');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please sign in to book a table');
      setTimeout(() => navigate('/signin'), 2000);
      return;
    }
    
    // Validation
    if (!formData.date || !formData.time || !formData.guests) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/bookings`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccess(response.data.message || 'Table booked successfully!');
        setFormData({
          ...formData,
          date: '',
          time: '',
          special_requests: ''
        });
        setAvailableSlots([]);
        setDateSelected(false);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/my-bookings');
        }, 2000);
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Failed to book table. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get max date (3 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <>
      {/* Hero Header */}
      <div className="booking-hero-header">
        <div className="container">
          <div className="booking-hero-content">
            <h1 className="booking-hero-title">Book a Table</h1>
            <nav className="booking-breadcrumb">
              <ol className="booking-breadcrumb-list">
                <li className="booking-breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="booking-breadcrumb-item">
                  <Link to="/pages">Pages</Link>
                </li>
                <li className="booking-breadcrumb-item active" aria-current="page">
                  Book a Table
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <section className="booking-section">
        <div className="container">
          <div className="booking-header">
            <h5 className="section-title ff-secondary booking-subtitle">Reservation</h5>
            <h1 className="booking-title">Book Your Table</h1>
          </div>

          <div className="booking-container">
            <div className="booking-card">
              {error && (
                <div className="booking-alert booking-alert-error" role="alert">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{error}</span>
                </div>
              )}
              
              {success && (
                <div className="booking-alert booking-alert-success" role="alert">
                  <i className="fas fa-check-circle"></i>
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="booking-form">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="booking-form-group">
                      <label htmlFor="name" className="booking-form-label">
                        <i className="fas fa-user booking-form-icon"></i>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="booking-form-input"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="booking-form-group">
                      <label htmlFor="email" className="booking-form-label">
                        <i className="fas fa-envelope booking-form-icon"></i>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="booking-form-input"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="booking-form-group">
                      <label htmlFor="phone" className="booking-form-label">
                        <i className="fas fa-phone booking-form-icon"></i>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="booking-form-input"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="booking-form-group">
                      <label htmlFor="guests" className="booking-form-label">
                        <i className="fas fa-users booking-form-icon"></i>
                        Number of Guests *
                      </label>
                      <select
                        id="guests"
                        name="guests"
                        className="booking-form-select"
                        value={formData.guests}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="booking-form-group">
                      <label htmlFor="date" className="booking-form-label">
                        <i className="fas fa-calendar booking-form-icon"></i>
                        Date *
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        className="booking-form-input"
                        value={formData.date}
                        onChange={handleDateChange}
                        min={today}
                        max={maxDateStr}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="booking-form-group">
                      <label htmlFor="time" className="booking-form-label">
                        <i className="fas fa-clock booking-form-icon"></i>
                        Time *
                      </label>
                      {dateSelected && availableSlots.length > 0 ? (
                        <select
                          id="time"
                          name="time"
                          className="booking-form-select"
                          value={formData.time}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        >
                          <option value="">Select a time slot</option>
                          {availableSlots.filter(slot => slot.available).map(slot => (
                            <option key={slot.time} value={slot.time}>
                              {slot.time.slice(0, 5)} - {slot.remainingCapacity} seats available
                            </option>
                          ))}
                        </select>
                      ) : dateSelected ? (
                        <div className="booking-no-slots">
                          {loading ? (
                            <p className="text-muted">
                              <i className="fas fa-spinner fa-spin"></i> Loading available times...
                            </p>
                          ) : (
                            <p className="text-warning">
                              <i className="fas fa-info-circle"></i> No available slots for this date
                            </p>
                          )}
                        </div>
                      ) : (
                        <input
                          type="text"
                          className="booking-form-input"
                          placeholder="Select a date first"
                          disabled
                        />
                      )}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="booking-form-group">
                      <label htmlFor="special_requests" className="booking-form-label">
                        <i className="fas fa-comment booking-form-icon"></i>
                        Special Requests
                      </label>
                      <textarea
                        id="special_requests"
                        name="special_requests"
                        className="booking-form-textarea"
                        rows="3"
                        placeholder="Any special requests? (e.g., dietary restrictions, special occasion, seating preference)"
                        value={formData.special_requests}
                        onChange={handleChange}
                        disabled={loading}
                      ></textarea>
                    </div>
                  </div>

                  <div className="col-12">
                    <button 
                      type="submit" 
                      className={`booking-btn ${loading ? 'booking-btn-loading' : ''}`}
                      disabled={loading || !formData.time}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Booking...
                        </>
                      ) : (
                        <>
                          Book a Table <i className="fas fa-arrow-right"></i>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              <div className="booking-info mt-4">
                <div className="booking-info-card">
                  <i className="fas fa-phone-alt"></i>
                  <div>
                    <h6>Need Help?</h6>
                    <p>Call us at +1 234 567 890</p>
                  </div>
                </div>
                <div className="booking-info-card">
                  <i className="fas fa-clock"></i>
                  <div>
                    <h6>Opening Hours</h6>
                    <p>Mon - Sun: 12:00 PM - 10:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Side */}
            <div className="booking-feature">
              <div className="booking-feature-content">
                <h2 className="booking-feature-title">Why Book With Us?</h2>
                <ul className="booking-feature-list">
                  <li className="booking-feature-item">
                    <i className="fas fa-check-circle booking-feature-icon"></i>
                    <span>Instant confirmation</span>
                  </li>
                  <li className="booking-feature-item">
                    <i className="fas fa-gift booking-feature-icon"></i>
                    <span>Earn 5 loyalty points per booking</span>
                  </li>
                  <li className="booking-feature-item">
                    <i className="fas fa-clock booking-feature-icon"></i>
                    <span>Free cancellation up to 2 hours before</span>
                  </li>
                  <li className="booking-feature-item">
                    <i className="fas fa-utensils booking-feature-icon"></i>
                    <span>Preferred seating options</span>
                  </li>
                  <li className="booking-feature-item">
                    <i className="fas fa-star booking-feature-icon"></i>
                    <span>Special occasion arrangements</span>
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

export default BookTable;