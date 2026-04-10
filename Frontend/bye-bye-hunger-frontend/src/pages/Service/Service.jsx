import React from 'react';
import { Link } from 'react-router-dom';
import './Service.css';

const Service = () => {
  const services = [
    { icon: 'fa-user-tie', title: 'Master Chefs', desc: 'Our expert chefs bring years of culinary experience to create unforgettable dining experiences.' },
    { icon: 'fa-utensils', title: 'Quality Food', desc: 'We source only the freshest, highest quality ingredients for every dish we serve.' },
    { icon: 'fa-cart-plus', title: 'Online Order', desc: 'Order your favorite meals online and get them delivered right to your doorstep.' },
    { icon: 'fa-headset', title: '24/7 Service', desc: 'We are always here to serve you, any time of day or night, 365 days a year.' },
    { icon: 'fa-clock', title: 'Fast Delivery', desc: 'Quick and reliable delivery service to ensure your food arrives hot and fresh.' },
    { icon: 'fa-heart', title: 'Special Events', desc: 'Perfect venue for birthdays, anniversaries, and corporate gatherings.' },
    { icon: 'fa-wine-glass-alt', title: 'Fine Dining', desc: 'Elegant ambiance with premium service for a sophisticated dining experience.' },
    { icon: 'fa-leaf', title: 'Healthy Options', desc: 'Wide selection of healthy and dietary-conscious menu items.' }
  ];

  return (
    <>
      {/* Hero Header */}
      <div className="service-hero-header">
        <div className="container">
          <div className="service-hero-content">
            <h1 className="service-hero-title">Our Services</h1>
            <nav className="service-breadcrumb">
              <ol className="service-breadcrumb-list">
                <li className="service-breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="service-breadcrumb-item">
                  <Link to="/pages">Pages</Link>
                </li>
                <li className="service-breadcrumb-item active" aria-current="page">
                  Services
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Service Section */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="text-center wow fadeInUp">
            <h5 className="section-title ff-secondary text-center text-primary fw-normal">Our Services</h5>
            <h1 className="mb-5">What We Offer</h1>
          </div>
          <div className="row g-4" style={{ rowGap: '30px' }}>
            {services.map((service, index) => (
              <div className="col-lg-3 col-sm-6 wow fadeInUp" key={index} data-wow-delay={`${index * 0.1}s`}>
                <div className="service-item rounded pt-3">
                  <div className="p-4">
                    <i className={`fa fa-3x ${service.icon} text-primary mb-4`}></i>
                    <h5>{service.title}</h5>
                    <p>{service.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Service;