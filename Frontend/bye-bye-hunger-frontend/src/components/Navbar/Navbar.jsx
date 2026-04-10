import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/pages/context/AuthContext.jsx";
import { useCart } from "../../pages/context/CartContext.jsx";
import "./Navbar.css";

const Navbar = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [scrolled, setScrolled] = useState(false);  // ← ADD THIS
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isPagesDropdownOpen, setIsPagesDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isAuthenticated, isAdmin, isUser } = useAuth();
  const { cartCount } = useCart();

useEffect(() => {
  const handleScroll = () => {
    setIsSticky(window.scrollY > 45);
    setScrolled(window.scrollY > 50);  // ← ADD THIS
  };
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  // Close menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
    setIsPagesDropdownOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
    setIsPagesDropdownOpen(false);
  };

  // Helper to check if a link is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`navbar ${isSticky ? "navbar-sticky" : ""} ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Brand/Logo */}
        <Link className="navbar-brand" to="/" onClick={closeMobileMenu}>
          <i className="fa fa-utensils"></i>
          <h1>Bye-Bye-Hunger</h1>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>

        {/* Navbar Links */}
        <div className={`navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav">
            {/* Home */}
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/') ? 'active' : ''}`} 
                to="/"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
            </li>
            
            {/* About */}
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/about') ? 'active' : ''}`} 
                to="/about"
                onClick={closeMobileMenu}
              >
                About
              </Link>
            </li>
            
            {/* Service */}
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/service') ? 'active' : ''}`} 
                to="/service"
                onClick={closeMobileMenu}
              >
                Service
              </Link>
            </li>
            
            {/* Menu */}
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/menu') ? 'active' : ''}`} 
                to="/menu"
                onClick={closeMobileMenu}
              >
                Menu
              </Link>
            </li>

            {/* Pages Dropdown */}
            <li 
              className="nav-item dropdown"
              onMouseEnter={() => window.innerWidth >= 992 && setIsPagesDropdownOpen(true)}
              onMouseLeave={() => window.innerWidth >= 992 && setIsPagesDropdownOpen(false)}
            >
              <button 
                className={`nav-link dropdown-toggle ${isPagesDropdownOpen ? 'show' : ''} ${isActive('/booking') || isActive('/team') || isActive('/testimonial') ? 'active' : ''}`}
                onClick={() => window.innerWidth < 992 && setIsPagesDropdownOpen(!isPagesDropdownOpen)}
              >
                Pages
              </button>
              <div className={`dropdown-menu ${isPagesDropdownOpen ? 'show' : ''}`}>
                <Link 
                  className="dropdown-item" 
                  to="/booking"
                  onClick={closeMobileMenu}
                >
                  Booking
                </Link>
                <Link 
                  className="dropdown-item" 
                  to="/team"
                  onClick={closeMobileMenu}
                >
                  Our Team
                </Link>
                <Link 
                  className="dropdown-item" 
                  to="/testimonial"
                  onClick={closeMobileMenu}
                >
                  Testimonial
                </Link>
              </div>
            </li>

            {/* Contact */}
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/contact') ? 'active' : ''}`} 
                to="/contact"
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
            </li>

            {/* Conditional rendering based on user authentication */}
            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/signin') ? 'active' : ''}`} 
                    to="/signin"
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${isActive('/signup') ? 'active' : ''}`} 
                    to="/signup"
                    onClick={closeMobileMenu}
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            ) : (
              <>
                {/* User Dropdown for authenticated users */}
                <li 
                  className="nav-item dropdown"
                  onMouseEnter={() => window.innerWidth >= 992 && setIsUserDropdownOpen(true)}
                  onMouseLeave={() => window.innerWidth >= 992 && setIsUserDropdownOpen(false)}
                >
                  <button 
                    className={`nav-link dropdown-toggle ${isUserDropdownOpen ? 'show' : ''}`}
                    onClick={() => window.innerWidth < 992 && setIsUserDropdownOpen(!isUserDropdownOpen)}
                  >
                    <i className="fas fa-user-circle"></i>
                    {user?.name?.split(' ')[0] || 'Account'}
                  </button>
                  <div className={`dropdown-menu dropdown-menu-end ${isUserDropdownOpen ? 'show' : ''}`}>
                    {isUser && (
                      <>
                        <Link 
                          className="dropdown-item" 
                          to="/dashboard"
                          onClick={closeMobileMenu}
                        >
                          <i className="fas fa-tachometer-alt"></i> Dashboard
                        </Link>
                        <Link 
                          className="dropdown-item" 
                          to="/my-orders"
                          onClick={closeMobileMenu}
                        >
                          <i className="fas fa-shopping-bag"></i> My Orders
                        </Link>
                        <Link 
                          className="dropdown-item" 
                          to="/profile"
                          onClick={closeMobileMenu}
                        >
                          <i className="fas fa-id-card"></i> Profile
                        </Link>
                        <Link 
                          className="dropdown-item cart-item" 
                          to="/cart"
                          onClick={closeMobileMenu}
                        >
                          <i className="fas fa-shopping-cart"></i> Cart
                          {cartCount > 0 && (
                            <span className="badge">{cartCount}</span>
                          )}
                        </Link>
                        {user?.loyaltyPoints > 0 && (
                          <div className="dropdown-item disabled">
                            <i className="fas fa-star"></i> {user.loyaltyPoints} Points
                          </div>
                        )}
                        <div className="dropdown-divider"></div>
                      </>
                    )}

                    {isAdmin && (
                      <>
                        <Link 
                          className="dropdown-item" 
                          to="/admin/dashboard"
                          onClick={closeMobileMenu}
                        >
                          <i className="fas fa-crown"></i> Admin Panel
                        </Link>
                        <div className="dropdown-divider"></div>
                      </>
                    )}

                    <button onClick={handleLogout} className="dropdown-item logout">
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </div>
                </li>
              </>
            )}

            {/* Book A Table Button */}
            <li className="nav-item book-table-btn">
              <Link 
                to="/booking" 
                className="btn-primary"
                onClick={closeMobileMenu}
              >
                <i className="fas fa-calendar-alt"></i> Book A Table
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;