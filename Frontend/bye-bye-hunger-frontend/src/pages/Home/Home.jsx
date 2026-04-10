import React, { useEffect, useState } from 'react';
import Hero from '../../components/Hero/Hero';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';
import { getImageUrl } from '../utils/imageHelper';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Home = () => {
  const [activeTab, setActiveTab] = useState('main-course');
  const [videoSrc, setVideoSrc] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [featuredMenu, setFeaturedMenu] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ years: 15, chefs: 50 });

  // Service data (static - can be updated from API if needed)
  const services = [
    { icon: 'fa-user-tie', title: 'Master Chefs', desc: 'Our expert chefs create culinary masterpieces with passion and precision.' },
    { icon: 'fa-utensils', title: 'Quality Food', desc: 'We use only the freshest, highest quality ingredients in every dish.' },
    { icon: 'fa-cart-plus', title: 'Online Order', desc: 'Order online and get your favorite meals delivered to your doorstep.' },
    { icon: 'fa-headset', title: '24/7 Service', desc: 'We are always here to serve you, any time of day or night.' }
  ];

  // Category tabs for home page
  const categories = [
    { id: 'appetizer', name: 'Appetizer', icon: 'fa-utensil-spoon' },
    { id: 'main-course', name: 'Main Course', icon: 'fa-hamburger' },
    { id: 'dessert', name: 'Dessert', icon: 'fa-ice-cream' },
    { id: 'beverage', name: 'Beverage', icon: 'fa-coffee' }
  ];

  // Fetch menu items on tab change
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/foods?category=${activeTab}&limit=6`);
        if (response.data.success) {
          setMenuItems(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching menu:', err);
      }
    };
    fetchMenuItems();
  }, [activeTab]);

  // Fetch featured menu items (popular items)
  useEffect(() => {
    const fetchFeaturedMenu = async () => {
      try {
        const response = await axios.get(`${API_URL}/foods?limit=8`);
        if (response.data.success) {
          setFeaturedMenu(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching featured menu:', err);
      }
    };
    fetchFeaturedMenu();
  }, []);

  // Fetch testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        // Try to fetch from API, fallback to static data
        const response = await axios.get(`${API_URL}/testimonials?status=approved&limit=4`);
        if (response.data.success && response.data.data.length > 0) {
          setTestimonials(response.data.data);
        } else {
          // Fallback static testimonials
          setTestimonials([
            { id: 1, name: 'John Doe', profession: 'Food Critic', text: 'Amazing food! The flavors are incredible and the service is top-notch. Highly recommend!', image: '/images/testimonial-1.jpg' },
            { id: 2, name: 'Jane Smith', profession: 'Regular Customer', text: 'Best restaurant in town! The atmosphere is perfect for family dinners.', image: '/images/testimonial-2.jpg' },
            { id: 3, name: 'Mike Johnson', profession: 'Food Blogger', text: 'I\'ve tried many restaurants, but this one stands out. The quality is consistent and delicious.', image: '/images/testimonial-3.jpg' }
          ]);
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        // Fallback static testimonials
        setTestimonials([
          { id: 1, name: 'John Doe', profession: 'Food Critic', text: 'Amazing food! The flavors are incredible and the service is top-notch. Highly recommend!', image: '/images/testimonial-1.jpg' },
          { id: 2, name: 'Jane Smith', profession: 'Regular Customer', text: 'Best restaurant in town! The atmosphere is perfect for family dinners.', image: '/images/testimonial-2.jpg' },
          { id: 3, name: 'Mike Johnson', profession: 'Food Blogger', text: 'I\'ve tried many restaurants, but this one stands out. The quality is consistent and delicious.', image: '/images/testimonial-3.jpg' }
        ]);
      }
    };
    fetchTestimonials();
  }, []);

  // Fetch team members
  useEffect(() => {
    // Team data (static for now, can be fetched from API later)
    setTeam([
      { id: 1, name: 'John Doe', designation: 'Master Chef', image: '/images/team-1.jpg', social: { fb: '#', twitter: '#', insta: '#' } },
      { id: 2, name: 'Jane Smith', designation: 'Pastry Chef', image: '/images/team-2.jpg', social: { fb: '#', twitter: '#', insta: '#' } },
      { id: 3, name: 'Mike Johnson', designation: 'Sous Chef', image: '/images/team-3.jpg', social: { fb: '#', twitter: '#', insta: '#' } },
      { id: 4, name: 'Sarah Williams', designation: 'Executive Chef', image: '/images/team-4.jpg', social: { fb: '#', twitter: '#', insta: '#' } }
    ]);
  }, []);

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/stats`);
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        // Keep default stats
      }
    };
    fetchStats();
  }, []);

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

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => observer.disconnect();
  }, []);

  // Video modal functionality
  useEffect(() => {
    const handleVideoModal = () => {
      const playButton = document.querySelector('.btn-play');
      if (playButton) {
        playButton.addEventListener('click', () => {
          setVideoSrc('https://www.youtube.com/embed/L5GQdVFGMBQ?autoplay=1');
        });
      }
      
      const modalClose = document.querySelector('#videoModal .btn-close');
      if (modalClose) {
        modalClose.addEventListener('click', () => {
          setVideoSrc('');
        });
      }
    };
    
    handleVideoModal();
  }, []);

  return (
    <div className="home-page">
      <Hero />

      {/* Service Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-4">
            {services.map((service, index) => (
              <div className="col-lg-3 col-sm-6 wow fadeInUp" key={index}>
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
      {/* Service End */}

      {/* About Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <div className="row g-3">
                <div className="col-6 text-start">
                  <img className="img-fluid rounded w-100 wow zoomIn" src="/images/about-1.jpg" alt="" />
                </div>
                <div className="col-6 text-start">
                  <img className="img-fluid rounded w-75 wow zoomIn" src="/images/about-2.jpg" alt="" style={{marginTop: '25%'}} />
                </div>
                <div className="col-6 text-end">
                  <img className="img-fluid rounded w-75 wow zoomIn" src="/images/about-3.jpg" alt="" />
                </div>
                <div className="col-6 text-end">
                  <img className="img-fluid rounded w-100 wow zoomIn" src="/images/about-4.jpg" alt="" />
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <h5 className="section-title ff-secondary text-start text-primary fw-normal">About Us</h5>
              <h1 className="mb-4">Welcome to <i className="fa fa-utensils fa-1x text-primary me-2"></i>Bye-Bye-Hunger</h1>
              <p className="mb-4">
                At Bye-Bye-Hunger, we believe that great food brings people together. 
                Our passion for culinary excellence drives us to create memorable dining experiences 
                with the finest ingredients and authentic flavors.
              </p>
              <p className="mb-4">
                Whether you're here for a quick bite or a special celebration, our team is dedicated 
                to making every visit exceptional. Join us and discover why we're the preferred choice 
                for food lovers.
              </p>
              <div className="row g-4 mb-4 stats-section">
                <div className="col-sm-6">
                  <div className="d-flex align-items-center border-start border-5 border-primary px-3">
                    <h1 className="shrink-0 display-5 text-primary mb-0" data-counter data-target={stats.years}>0</h1>
                    <div className="ps-4">
                      <p className="mb-0">Years of</p>
                      <h6 className="text-uppercase mb-0">Experience</h6>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-center border-start border-5 border-primary px-3">
                    <h1 className="shrink-0 display-5 text-primary mb-0" data-counter data-target={stats.chefs}>0</h1>
                    <div className="ps-4">
                      <p className="mb-0">Popular</p>
                      <h6 className="text-uppercase mb-0">Master Chefs</h6>
                    </div>
                  </div>
                </div>
              </div>
              <Link className="btn btn-primary py-3 px-5 mt-2" to="/about">Read More</Link>
            </div>
          </div>
        </div>
      </div>
      {/* About End */}

      {/* Menu Start */}
      <div className="container-xxl py-5 home-food-section">
        <div className="container">
          <div className="text-center wow fadeInUp">
            <h5 className="section-title ff-secondary text-center text-primary fw-normal">Food Menu</h5>
            <h1 className="mb-5">Most Popular Items</h1>
          </div>
          <div className="tab-class text-center wow fadeInUp">
            <ul className="nav nav-pills d-inline-flex justify-content-center border-bottom mb-5">
              {categories.map(cat => (
                <li className="nav-item" key={cat.id}>
                  <button 
                    className={`d-flex align-items-center text-start mx-3 ${activeTab === cat.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(cat.id)}
                  >
                    <i className={`fa ${cat.icon} fa-2x text-primary`}></i>
                    <div className="ps-3">
                      <h6 className="mt-n1 mb-0">{cat.name}</h6>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="tab-content">
              <div className="tab-pane fade show active">
                <div className="row g-4">
                  {menuItems.slice(0, 6).map((item) => (
                    <div className="col-lg-6" key={item._id}>
                      <div className="d-flex align-items-center">
                        <img 
  className="shrink-0 img-fluid rounded" 
  src={getImageUrl(item.image)} 
  alt={item.name} 
  style={{width: '80px', height: '80px', objectFit: 'cover'}} 
  onError={(e) => { e.target.src = '/images/default-food.jpg'; }}
/>
                        <div className="w-100 d-flex flex-column text-start ps-4">
                          <h5 className="d-flex justify-content-between border-bottom pb-2">
                            <span>{item.name}</span>
                            <span className="text-primary">${item.price.toFixed(2)}</span>
                          </h5>
                          <small className="fst-italic">{item.description?.substring(0, 80)}...</small>
                          {item.isVegetarian && (
                            <small className="text-success mt-1">
                              <i className="fas fa-leaf"></i> Vegetarian
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-center mt-5">
              <Link to="/menu" className="btn btn-primary py-3 px-5">View Full Menu</Link>
            </div>
          </div>
        </div>
      </div>
      {/* Menu End */}

{/* Reservation Start */}
<div className="container-xxl py-5 px-0 wow fadeInUp">
  <div className="row g-0">
    {/* Left Side - Video Thumbnail */}
    <div className="col-md-6">
      <div className="video">
        <button
          type="button"
          className="btn-play"
          data-bs-toggle="modal"
          data-bs-target="#videoModal"
          onClick={() => setVideoSrc("https://www.youtube.com/embed/L5GQdVFGMBQ?autoplay=1")}
        >
          <span></span>
        </button>
      </div>
    </div>
    
    {/* Right Side - Booking Form */}
    <div className="col-md-6 d-flex align-items-center" style={{ backgroundColor: '#0f172b' }}>
    {/* <div className="col-md-6 bg-dark d-flex align-items-center" style={{ backgroundColor: '#0f172b' }}> */}
      <div className="p-5 wow fadeInUp w-100">
        <h5 className="section-title ff-secondary text-start text-primary fw-normal">Reservation</h5>
        <h1 className="text-white mb-4">Book A Table Online</h1>
        <form>
  <div className="row g-3">
    <div className="col-md-6">
      <div className="form-floating">
        <input 
          type="text" 
          className="form-control" 
          id="name" 
          name="name"
          placeholder=" "  // Space character
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
          required
        >
          <option value="1">People 1</option>
          {/* <option value="2">People 2</option> */}
          <option value="2" selected>People 2</option>
          <option value="3">People 3</option>
          <option value="4">People 4</option>
          <option value="5">People 5</option>
          <option value="6">People 6</option>
        </select>
        {/* <label htmlFor="guests" selected>Number of Guests</label> */}
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
        {/* <label htmlFor="time">Select Time</label> */}
      </div>
    </div>
    <div className="col-12">
      <div className="form-floating">
        <textarea 
          className="form-control" 
          id="request" 
          name="request"
          placeholder=" "
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
      </div>
    </div>
  </div>
</div>


{/* Background Video Section - Full width at bottom */}
<div className="background-video-section">
  <div className="video-wrapper">
    <iframe
      className="youtube-background-video"
      src="https://www.youtube.com/embed/L5GQdVFGMBQ?autoplay=1&mute=1&loop=1&playlist=L5GQdVFGMBQ&controls=0&showinfo=0&rel=0&modestbranding=1"
      title="YouTube Background Video"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    ></iframe>
  </div>
  <div className="video-overlay-content">
    <div className="container">
      <div className="row">
        <div className="col-12 text-center">
          <h5 className="text-primary mb-2">Watch Our Story</h5>
          <h3 className="text-white mb-3">Experience Our Restaurant</h3>
          <p className="text-white-50">Watch the ambiance of Bye-Bye-Hunger</p>
          <button 
            type="button" 
            className="btn btn-primary mt-3"
            data-bs-toggle="modal"
            data-bs-target="#videoModal"
            onClick={() => setVideoSrc("https://www.youtube.com/embed/L5GQdVFGMBQ?autoplay=1")}
          >
            Play Video <i className="fas fa-play ms-2"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

{/* Background Video Section - Full width at bottom
<div className="background-video-section">
  <div className="video-wrapper">
    <video
      autoPlay
      loop
      muted
      playsInline
      className="bottom-background-video"
    >
      <source src="/videos/main-video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>
  <div className="video-overlay-content">
    <div className="container">
      <div className="row">
        <div className="col-12 text-center">
          <h5 className="text-primary mb-2">Watch Our Story</h5>
          <h3 className="text-white mb-3">Experience Our Restaurant</h3>
          <p className="text-white-50">Watch the ambiance of Bye-Bye-Hunger</p>
          <button 
            type="button" 
            className="btn btn-primary mt-3"
            data-bs-toggle="modal"
            data-bs-target="#videoModal"
            onClick={() => setVideoSrc("https://www.youtube.com/embed/L5GQdVFGMBQ?autoplay=1")}
          >
            Play Video <i className="fas fa-play ms-2"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</div> */}

{/* Reservation End */}

      {/* Team Start */}
      <div className="container-xxl pt-5 pb-3">
        <div className="container">
          <div className="text-center wow fadeInUp">
            <h5 className="section-title ff-secondary text-center text-primary fw-normal">Team Members</h5>
            <h1 className="mb-5">Our Master Chefs</h1>
          </div>
          <div className="row g-4">
            {team.map((member) => (
              <div className="col-lg-3 col-md-6 wow fadeInUp" key={member.id}>
                <div className="team-item text-center rounded overflow-hidden">
                  <div className="rounded-circle overflow-hidden m-4">
                    <img className="img-fluid" src={member.image} alt={member.name} />
                  </div>
                  <h5 className="mb-0">{member.name}</h5>
                  <small>{member.designation}</small>
                  <div className="d-flex justify-content-center mt-3">
                    <a className="btn btn-square btn-primary mx-1" href={member.social.fb}><i className="fab fa-facebook-f"></i></a>
                    <a className="btn btn-square btn-primary mx-1" href={member.social.twitter}><i className="fab fa-twitter"></i></a>
                    <a className="btn btn-square btn-primary mx-1" href={member.social.insta}><i className="fab fa-instagram"></i></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Team End */}

      {/* Testimonial Start */}
      <div className="container-xxl py-5 wow fadeInUp">
        <div className="container">
          <div className="text-center">
            <h5 className="section-title ff-secondary text-center text-primary fw-normal">Testimonial</h5>
            <h1 className="mb-5">What Our Clients Say!</h1>
          </div>
          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <div className="testimonial-item bg-transparent border rounded p-4" key={testimonial.id}>
                <i className="fa fa-quote-left fa-2x text-primary mb-3"></i>
                <p>{testimonial.text}</p>
                <div className="d-flex align-items-center">
                  <img 
                    className="shrink-0 rounded-circle" 
                    src={testimonial.image || '/images/default-avatar.jpg'} 
                    style={{width: '50px', height: '50px', objectFit: 'cover'}} 
                    alt={testimonial.name} 
                  />
                  <div className="ps-3">
                    <h5 className="mb-1">{testimonial.name}</h5>
                    <small>{testimonial.profession}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Testimonial End */}
    </div>
  );
};

export default Home;