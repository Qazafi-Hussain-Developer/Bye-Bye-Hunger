import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Testimonial.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Testimonial = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef(null);
  
  // Static fallback testimonials
  const fallbackTestimonials = [
    { id: 1, name: 'John Doe', profession: 'Food Critic', text: 'Amazing food! The flavors are incredible and the service is top-notch. Highly recommend this restaurant!', image: '/images/testimonial-1.jpg' },
    { id: 2, name: 'Jane Smith', profession: 'Regular Customer', text: 'Best restaurant in town! The atmosphere is perfect for family dinners and the food is always fresh.', image: '/images/testimonial-2.jpg' },
    { id: 3, name: 'Mike Johnson', profession: 'Food Blogger', text: 'I\'ve tried many restaurants, but this one stands out. The quality is consistent and delicious every time.', image: '/images/testimonial-3.jpg' },
    { id: 4, name: 'Sarah Williams', profession: 'Chef', text: 'Impressive menu variety and excellent presentation. A true culinary experience!', image: '/images/testimonial-4.jpg' }
  ];

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get(`${API_URL}/testimonials?status=approved&limit=6`);
        if (response.data.success && response.data.data.length > 0) {
          setTestimonials(response.data.data);
        } else {
          setTestimonials(fallbackTestimonials);
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setTestimonials(fallbackTestimonials);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length <= 1) return;
    
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [testimonials.length]);

  const goToSlide = (index) => {
    setActiveIndex(index);
    // Reset timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
    }
  };

  if (loading) {
    return (
      <div className="testimonial-loading">
        <div className="spinner"></div>
        <p>Loading testimonials...</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero Header */}
      <div className="testimonial-hero-header">
        <div className="container">
          <div className="testimonial-hero-content">
            <h1 className="testimonial-hero-title">Testimonials</h1>
            <nav className="testimonial-breadcrumb">
              <ol className="testimonial-breadcrumb-list">
                <li className="testimonial-breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="testimonial-breadcrumb-item">
                  <Link to="/pages">Pages</Link>
                </li>
                <li className="testimonial-breadcrumb-item active" aria-current="page">
                  Testimonials
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="container-xxl py-5 wow fadeInUp">
        <div className="container">
          <div className="text-center">
            <h5 className="section-title ff-secondary text-center text-primary fw-normal">Testimonials</h5>
            <h1 className="mb-5">What Our Clients Say</h1>
          </div>
          
          <div className="testimonial-carousel-wrapper">
            <div className="testimonial-carousel">
              {testimonials.map((testimonial, index) => (
                <div 
                  className={`testimonial-item ${index === activeIndex ? 'active' : ''}`} 
                  key={testimonial.id || index}
                >
                  <i className="fa fa-quote-left fa-2x text-primary mb-3"></i>
                  <p>{testimonial.text}</p>
                  <div className="testimonial-author">
                    <img 
                      className="author-image" 
                      src={testimonial.image || '/images/default-avatar.jpg'} 
                      alt={testimonial.name} 
                    />
                    <div className="author-info">
                      <h5>{testimonial.name}</h5>
                      <small>{testimonial.profession}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Dots Navigation */}
            {testimonials.length > 1 && (
              <div className="testimonial-dots">
                {testimonials.map((_, index) => (
                  <button 
                    key={index} 
                    className={`dot ${index === activeIndex ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                  ></button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Testimonial;