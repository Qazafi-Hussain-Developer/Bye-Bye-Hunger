import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./About.css";

const About = () => {
  // Counter animation effect
  useEffect(() => {
    const animateCounter = (element, target) => {
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          element.innerText = target;
          clearInterval(timer);
        } else {
          element.innerText = Math.floor(current);
        }
      }, 20);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counters = entry.target.querySelectorAll('[data-counter]');
          counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            animateCounter(counter, target);
          });
          observer.unobserve(entry.target);
        }
      });
    });

    const statsSection = document.querySelector('.about-stats');
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page">

      {/* Hero Section */}
      <div className="about-hero">
        <div className="about-hero-content">
          <h1>About Us</h1>
          <p>Home / Pages / About</p>
        </div>
      </div>

      {/* About Section */}
      <section className="about-section">
        <div className="about-container">
          
          <div className="about-images">
            <img src="/images/about-1.jpg" alt="Restaurant interior" />
            <img src="/images/about-2.jpg" alt="Delicious food" />
            <img src="/images/about-3.jpg" alt="Chef at work" />
            <img src="/images/about-4.jpg" alt="Dining experience" />
          </div>

          <div className="about-content">
            <h5 className="section-subtitle">About Us</h5>
            <h2>Welcome to Bye-Bye-Hunger</h2>

            <p>
              At Bye-Bye-Hunger, we believe that great food brings people together. 
              Our passion for culinary excellence drives us to create memorable dining experiences 
              with the finest ingredients and authentic flavors.
            </p>

            <p>
              Whether you're here for a quick bite or a special celebration, our team is dedicated 
              to making every visit exceptional. Join us and discover why we're the preferred choice 
              for food lovers in the community.
            </p>

            <div className="about-stats">
              <div>
                <h3 data-counter data-target="15">0</h3>
                <p>Years of Experience</p>
              </div>
              <div>
                <h3 data-counter data-target="50">0</h3>
                <p>Master Chefs</p>
              </div>
              <div>
                <h3 data-counter data-target="100">0</h3>
                <p>Menu Items</p>
              </div>
            </div>

            <Link to="/contact" className="primary-btn">Contact Us</Link>
          </div>

        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <h5 className="section-subtitle">Team Members</h5>
        <h2>Our Master Chefs</h2>

        <div className="team-grid">
          <div className="team-card">
            <img src="/images/team-1.jpg" alt="Chef" />
            <h4>John Doe</h4>
            <p>Executive Chef</p>
            <div className="team-social">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
          <div className="team-card">
            <img src="/images/team-2.jpg" alt="Chef" />
            <h4>Jane Smith</h4>
            <p>Pastry Chef</p>
            <div className="team-social">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
          <div className="team-card">
            <img src="/images/team-3.jpg" alt="Chef" />
            <h4>Mike Johnson</h4>
            <p>Sous Chef</p>
            <div className="team-social">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
          <div className="team-card">
            <img src="/images/team-4.jpg" alt="Chef" />
            <h4>Sarah Williams</h4>
            <p>Nutritionist</p>
            <div className="team-social">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;