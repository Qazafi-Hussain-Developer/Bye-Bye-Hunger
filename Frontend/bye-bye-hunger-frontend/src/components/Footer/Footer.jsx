import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Footer.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Back to top button
    const handleScroll = () => {
      const backToTop = document.querySelector('.back-to-top');
      if (backToTop) {
        if (window.scrollY > 300) {
          backToTop.classList.add('show');
        } else {
          backToTop.classList.remove('show');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Smooth scroll to top
    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!newsletterEmail.trim()) {
      setNewsletterStatus({ type: "error", message: "Please enter your email address" });
      setTimeout(() => setNewsletterStatus({ type: "", message: "" }), 3000);
      return;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(newsletterEmail)) {
      setNewsletterStatus({ type: "error", message: "Please enter a valid email address" });
      setTimeout(() => setNewsletterStatus({ type: "", message: "" }), 3000);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/newsletter/subscribe`, { email: newsletterEmail });
      if (response.data.success) {
        setNewsletterStatus({ type: "success", message: "Subscribed successfully! Check your email." });
        setNewsletterEmail("");
      }
    } catch (error) {
      setNewsletterStatus({ 
        type: "error", 
        message: error.response?.data?.message || "Failed to subscribe. Please try again." 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setNewsletterStatus({ type: "", message: "" }), 3000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
    {/* // <footer className="footer pt-5 mt-5 wow fadeIn"> */}
    {/* <footer className="footer bg-dark text-light pt-5 mt-5 wow fadeIn"> */}
      <div className="container py-5">
        <div className="row g-5">
          {/* Company Links */}
          <div className="col-lg-3 col-md-6">
            <h4 className="section-title ff-secondary text-start text-primary fw-normal mb-4">Company</h4>
            <Link className="btn btn-link" to="/about">About Us</Link>
            <Link className="btn btn-link" to="/contact">Contact Us</Link>
            <Link className="btn btn-link" to="/booking">Reservation</Link>
            <Link className="btn btn-link" to="/privacy">Privacy Policy</Link>
            <Link className="btn btn-link" to="/terms">Terms & Condition</Link>
          </div>

          {/* Contact Info */}
          <div className="col-lg-3 col-md-6">
            <h4 className="section-title ff-secondary text-start text-primary fw-normal mb-4">Contact</h4>
            <p className="mb-2">
              <i className="fa fa-map-marker-alt me-3"></i>
              123 Street, New York, USA
            </p>
            <p className="mb-2">
              <i className="fa fa-phone-alt me-3"></i>
              +012 345 67890
            </p>
            <p className="mb-2">
              <i className="fa fa-envelope me-3"></i>
              info@byebyhunger.com
            </p>
            <div className="d-flex pt-2">
              <a className="btn btn-outline-light btn-social" href="#" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a className="btn btn-outline-light btn-social" href="#" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a className="btn btn-outline-light btn-social" href="#" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
              <a className="btn btn-outline-light btn-social" href="#" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="col-lg-3 col-md-6">
            <h4 className="section-title ff-secondary text-start text-primary fw-normal mb-4">Opening</h4>
            <h5 className="text-dark fw-normal mb-2">Monday - Saturday</h5>
            <p className="mb-4">09AM - 09PM</p>
            <h5 className="text-dark fw-normal mb-2">Sunday</h5>
            <p>10AM - 08PM</p>
          </div>

          {/* Newsletter */}
          <div className="col-lg-3 col-md-6">
            <h4 className="section-title ff-secondary text-start text-primary fw-normal mb-4">Newsletter</h4>
            <p className="mb-4">Subscribe to get special offers and updates!</p>
            
            {newsletterStatus.message && (
              <div className={`newsletter-alert newsletter-alert-${newsletterStatus.type}`}>
                <i className={`fas fa-${newsletterStatus.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                <span>{newsletterStatus.message}</span>
              </div>
            )}
            
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form position-relative mx-auto" style={{maxWidth: '400px'}}>
              <input 
                className="form-control border-primary w-100 py-3 ps-4 pe-5" 
                type="email" 
                placeholder="Your email" 
                aria-label="Email for newsletter"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={loading}
              />
              <button 
                type="submit" 
                className="btn btn-primary py-2 position-absolute top-0 end-0 mt-2 me-2"
                aria-label="Sign up for newsletter"
                disabled={loading}
              >
                {loading ? <i className="fas fa-spinner fa-spin"></i> : "SignUp"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="container">
        <div className="copyright">
          <div className="row">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              &copy; {currentYear} <Link className="border-bottom" to="/">Bye-Bye-Hunger</Link>, All Right Reserved.
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="footer-menu">
                <Link to="/">Home</Link>
                <Link to="/cookies">Cookies</Link>
                <Link to="/help">Help</Link>
                <Link to="/faqs">FQAs</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <a href="#" className="btn btn-lg btn-primary btn-lg-square back-to-top" aria-label="Back to top">
        <i className="fa fa-arrow-up"></i>
        {/* <i className="bi bi-arrow-up"></i> */}
      </a>
    </footer>
  );
};

export default Footer;