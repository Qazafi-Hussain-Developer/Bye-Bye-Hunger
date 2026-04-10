import React, { useState } from 'react';
import axios from 'axios';
import './Contact.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear response when user starts typing
    if (response.message) {
      setResponse({ type: '', message: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      setResponse({ type: 'error', message: 'Please enter your name' });
      return;
    }
    if (!formData.email.trim()) {
      setResponse({ type: 'error', message: 'Please enter your email' });
      return;
    }
    if (!formData.subject.trim()) {
      setResponse({ type: 'error', message: 'Please enter a subject' });
      return;
    }
    if (!formData.message.trim()) {
      setResponse({ type: 'error', message: 'Please enter your message' });
      return;
    }
    
    setLoading(true);
    setResponse({ type: '', message: '' });

    try {
      const { data } = await axios.post(`${API_URL}/contact`, formData);
      
      setResponse({
        type: 'success',
        message: data.message || 'Message sent successfully! We\'ll get back to you soon.'
      });
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

    } catch (error) {
      console.error('Contact form error:', error);
      setResponse({
        type: 'error',
        message: error.response?.data?.message || 'Something went wrong. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="contact-hero-content">
          <h1>Contact Us</h1>
          <p>Home / Pages / Contact</p>
        </div>
      </div>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="contact-container">
          <div className="contact-heading">
            <h5 className="section-subtitle">Contact Us</h5>
            <h2>Contact For Any Query</h2>
          </div>

          {/* Contact Info Cards */}
          <div className="contact-info">
            <div className="contact-info-card">
              <i className="fas fa-phone-alt contact-info-icon"></i>
              <div>
                <h4>Booking</h4>
                <p>book@byebyehunger.com</p>
                <small>+1 234 567 890</small>
              </div>
            </div>
            <div className="contact-info-card">
              <i className="fas fa-envelope contact-info-icon"></i>
              <div>
                <h4>General</h4>
                <p>info@byebyehunger.com</p>
                <small>+1 234 567 891</small>
              </div>
            </div>
            <div className="contact-info-card">
              <i className="fas fa-headset contact-info-icon"></i>
              <div>
                <h4>Technical Support</h4>
                <p>tech@byebyehunger.com</p>
                <small>+1 234 567 892</small>
              </div>
            </div>
          </div>

          {/* Alert Message */}
          {response.message && (
            <div className={`contact-alert contact-alert-${response.type}`}>
              <i className={`fas fa-${response.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
              <span>{response.message}</span>
            </div>
          )}

          <div className="contact-content">
            {/* Map */}
            <div className="contact-map">
              <iframe
                title="Google Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3001156.4288297426!2d-78.01371936852176!3d42.72876761954724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4ccc4bf0f123a5a9%3A0xddcfc6c1de189567!2sNew%20York%2C%20USA!5e0!3m2!1sen!2sbd!4v1603794290143!5m2!1sen!2sbd"
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>

            {/* Contact Form */}
            <div className="contact-form">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <input 
                      type="text" 
                      name="name"
                      placeholder="Your Name *" 
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      type="email" 
                      name="email"
                      placeholder="Your Email *" 
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <input 
                      type="tel" 
                      name="phone"
                      placeholder="Your Phone (Optional)" 
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      type="text" 
                      name="subject"
                      placeholder="Subject *" 
                      value={formData.subject}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <textarea 
                    name="message"
                    placeholder="Your Message *"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="contact-btn"
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
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;