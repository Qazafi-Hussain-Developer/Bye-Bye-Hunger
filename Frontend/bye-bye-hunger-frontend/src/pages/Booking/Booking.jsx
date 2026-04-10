import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Booking.css';

const Booking = () => {
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      guests: '2',
      date: '',
      time: '',
      request: ''
  });

  const [modalVideoSrc, setModalVideoSrc] = useState('');
  const backgroundVideoRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Booking form submitted:', formData);
    // Here you would send data to backend
  };

  // Auto-play background video silently when component mounts
  useEffect(() => {
    if (backgroundVideoRef.current) {
      backgroundVideoRef.current.play().catch(error => {
        console.log('Auto-play failed:', error);
      });
    }
  }, []);

  return (
    <>
      {/* Hero Header */}
      <div className="booking-hero-header">
        <div className="container">
          <div className="booking-hero-content">
            <h1 className="booking-hero-title">Booking</h1>
            <nav className="booking-breadcrumb">
              <ol className="booking-breadcrumb-list">
                <li className="booking-breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="booking-breadcrumb-item">
                  <Link to="/pages">Pages</Link>
                </li>
                <li className="booking-breadcrumb-item active" aria-current="page">
                  Booking
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Reservation Section */}
      <div className="container-xxl py-5 px-0 wow fadeInUp">
        <div className="row g-0">
          {/* Left Side - Video Thumbnail with Play Button */}
          <div className="col-md-6">
            <div className="video">
              <button 
                type="button" 
                className="btn-play"
                onClick={() => {
                  const modal = document.getElementById('videoModal');
                  if (modal) {
                    modal.style.display = 'flex';
                    setModalVideoSrc('/videos/main-video.mp4');
                  }
                }}
              >
                <span></span>
              </button>
            </div>
          </div>
          
          {/* Right Side - Booking Form */}
          <div className="col-md-6 d-flex align-items-center" style={{ backgroundColor: '#0f172b' }}>
          {/* <div className="col-md-6 bg-dark d-flex align-items-center"> */}
            <div className="p-5 wow fadeInUp w-100">
              <h5 className="section-title ff-secondary text-start text-primary fw-normal">Reservation</h5>
              <h1 className="text-white mb-4">Book A Table Online</h1>
<form onSubmit={handleSubmit}>
  <div className="row g-3">
    <div className="col-md-6">
      <div className="form-floating">
        <input 
          type="text" 
          className="form-control" 
          id="name" 
          name="name"
          placeholder=" "
          value={formData.name}
          onChange={handleChange}
          required
        />
        <label htmlFor="name">Your Name</label>
      </div>
    </div>
    
    <div className="col-md-6">
      <div className="form-floating">
        <input 
          type="email" 
          className="form-control" 
          id="email" 
          name="email"
          placeholder=" "
          value={formData.email}
          onChange={handleChange}
          required
        />
        <label htmlFor="email">Your Email</label>
      </div>
    </div>
    
    <div className="col-md-6">
      <div className="form-floating">
        <input 
          type="tel" 
          className="form-control" 
          id="phone" 
          name="phone"
          placeholder=" "
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <label htmlFor="phone">Phone Number</label>
      </div>
    </div>
    
    <div className="col-md-6">
      <div className="form-floating">
        <select 
          className="form-select" 
          id="guests" 
          name="guests"
          value={formData.guests}
          onChange={handleChange}
          required
        >
          <option value="1">1 Person</option>
          <option value="2">2 People</option>
          <option value="3">3 People</option>
          <option value="4">4 People</option>
          <option value="5">5 People</option>
          <option value="6">6 People</option>
        </select>
        <label htmlFor="guests">Number of Guests</label>
      </div>
    </div>
    
    <div className="col-md-6">
      <div className="form-floating">
        <input 
          type="date" 
          className="form-control" 
          id="date" 
          name="date"
          placeholder=" "
          value={formData.date}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          required
        />
        <label htmlFor="date">Select Date</label>
      </div>
    </div>
    
    <div className="col-md-6">
      <div className="form-floating">
        <select 
          className="form-select" 
          id="time" 
          name="time"
          value={formData.time}
          onChange={handleChange}
          required
        >
          <option value="">Select Time</option>
          <option value="12:00">12:00 PM</option>
          <option value="12:30">12:30 PM</option>
          <option value="13:00">01:00 PM</option>
          <option value="13:30">01:30 PM</option>
          <option value="14:00">02:00 PM</option>
          <option value="18:00">06:00 PM</option>
          <option value="18:30">06:30 PM</option>
          <option value="19:00">07:00 PM</option>
          <option value="19:30">07:30 PM</option>
          <option value="20:00">08:00 PM</option>
          <option value="20:30">08:30 PM</option>
          <option value="21:00">09:00 PM</option>
        </select>
        <label htmlFor="time">Select Time</label>
      </div>
    </div>
    
    <div className="col-12">
      <div className="form-floating">
        <textarea 
          className="form-control" 
          id="request" 
          name="request"
          placeholder=" "
          value={formData.request}
          onChange={handleChange}
          style={{height: '100px'}}
        ></textarea>
        <label htmlFor="request">Special Request (Optional)</label>
      </div>
    </div>
    
    <div className="col-12">
      <button className="btn btn-primary w-100 py-3" type="submit">
        BOOK NOW
      </button>
    </div>
  </div>
</form>
<p className="text-white-50 mt-3 text-center">
          <i className="fas fa-phone-alt me-2"></i> Call us: +1 234 567 890
        </p>
              {/* <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input 
                        type="text" 
                        className="form-control" 
                        id="name" 
                        name="name"
                        placeholder="Your Name" 
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="name">Your Name</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input 
                        type="email" 
                        className="form-control" 
                        id="email" 
                        name="email"
                        placeholder="Your Email" 
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="email">Your Email</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input 
                        type="datetime-local" 
                        className="form-control" 
                        id="datetime" 
                        name="datetime"
                        placeholder="Date & Time" 
                        value={formData.datetime}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="datetime">Date & Time</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <select 
                        className="form-select" 
                        id="people" 
                        name="people"
                        value={formData.people}
                        onChange={handleChange}
                        required
                      >
                        <option value="1">People 1</option>
                        <option value="2">People 2</option>
                        <option value="3">People 3</option>
                        <option value="4">People 4</option>
                        <option value="5">People 5</option>
                        <option value="6">People 6</option>
                      </select>
                      {/* <label htmlFor="people">No Of People</label> 
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-floating">
                      <textarea 
                        className="form-control" 
                        placeholder="Special Request" 
                        id="request" 
                        name="request"
                        style={{height: '100px'}}
                        value={formData.request}
                        onChange={handleChange}
                      ></textarea>
                      <label htmlFor="request">Special Request</label>
                    </div>
                  </div>
                  <div className="col-12">
                    <button className="btn btn-primary w-100 py-3" type="submit">
                      BOOK NOW
                    </button>
                  </div>
                </div>
              </form>
               */}
            </div>
          </div>
        </div>
      </div>

      {/* Background Video Section - Plays silently at bottom */}
      <div className="background-video-section">
        <video
          ref={backgroundVideoRef}
          className="bottom-background-video"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/videos/main-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-overlay-content">
          <div className="container">
            <div className="row">
              <div className="col-12 text-center">
                <h3 className="text-white">Experience Our Restaurant</h3>
                <p className="text-white-50">Watch the ambiance of Bye-Bye-Hunger</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal - Plays main-video.mp4 with sound */}
      <div className="video-modal" id="videoModal" style={{ display: 'none' }}>
        <div className="video-modal-content">
          <button 
            className="video-close"
            onClick={() => {
              const modal = document.getElementById('videoModal');
              if (modal) {
                modal.style.display = 'none';
                setModalVideoSrc('');
              }
            }}
          >
            ×
          </button>
          <div className="ratio ratio-16x9">
            {modalVideoSrc && (
              <video 
                controls 
                autoPlay 
                style={{ width: '100%', height: '100%', borderRadius: '8px' }}
              >
                <source src={modalVideoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Booking;