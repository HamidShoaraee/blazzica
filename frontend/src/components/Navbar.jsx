import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const isAuthenticated = !!user;

  // Check scroll position to change navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set user data when user prop changes
  useEffect(() => {
    if (user) {
      setUserData({
        ...user,
        menuOpen: false
      });
    } else {
      setUserData(null);
    }
  }, [user]);
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    
    // Prevent scrolling when menu is open
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    
    // Close mobile menu if open
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  };
  
  // Helper function to check if user is a provider
  const isProvider = () => {
    if (!userData || !userData.role) {
      return false;
    }
    
    // Normalize role for case-insensitive comparison
    const role = typeof userData.role === 'string' ? userData.role.toLowerCase() : userData.role;
    
    // Check for provider or pending_provider roles
    return role === 'provider' || role === 'pending_provider';
  };
  
  return (
    <>
      <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
        <div className="header__container">
          <Link to="/" className="header__logo logo">BLAZZICA</Link>
          
          {/* Desktop Navigation */}
          <div className="header__navigation">
            <nav className="header__menu menu">
              <ul className="menu__list">
                <li className="menu__item">
                  <Link to="/" className="menu__link">Home</Link>
                </li>
                <li className="menu__item">
                  <Link to="/services" className="menu__link">Services</Link>
                </li>
                <li className="menu__item">
                  <Link to="/professionals" className="menu__link">Professionals</Link>
                </li>
                <li className="menu__item">
                  <Link to="/about" className="menu__link">About</Link>
                </li>
                <li className="menu__item">
                  <Link to="/contact" className="menu__link">Contact</Link>
                </li>
              </ul>
            </nav>
            
            <div className="header__actions actions-header">
              {isAuthenticated ? (
                <div className="user-menu">
                  <div className="user-menu__trigger" onClick={() => setUserData(prev => ({ ...prev, menuOpen: !prev?.menuOpen }))}>
                    <div className="user-menu__avatar">
                      <img src={userData?.avatar || 'https://via.placeholder.com/50'} alt={userData?.name || 'User'} />
                    </div>
                    <span className="user-menu__name">{userData?.name || userData?.email || 'User'}</span>
                  </div>
                  
                  {userData?.menuOpen && (
                    <div className="user-menu__dropdown">
                      <Link to="/profile" className="user-menu__item">My Profile</Link>
                      <Link to="/bookings" className="user-menu__item">My Bookings</Link>
                      <Link to={isProvider() 
                        ? `/provider/dashboard/${userData?.id}` 
                        : `/client/dashboard/${userData?.id}`} 
                        className="user-menu__item">
                        {isProvider() 
                          ? "Provider Dashboard" 
                          : "My Dashboard"}
                      </Link>
                      <button onClick={handleLogout} className="user-menu__item user-menu__item--logout">
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="actions-header__link">Login</Link>
                  <Link to="/signup" className="actions-header__button">Sign Up</Link>
                </>
              )}
              
              <button 
                type="button" 
                className={`menu__icon ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={toggleMobileMenu}
                aria-label="Menu"
              >
                <span></span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              className="menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
            />
            
            <motion.div 
              className="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <button 
                className="mobile-menu__close"
                onClick={toggleMobileMenu}
                aria-label="Close menu"
              >
                &times;
              </button>
              
              <div className="mobile-menu__content">
                {isAuthenticated && userData && (
                  <div className="mobile-menu__user">
                    <div className="mobile-menu__avatar">
                      <img src={userData.avatar || 'https://via.placeholder.com/50'} alt={userData.name || 'User'} />
                    </div>
                    <div className="mobile-menu__user-info">
                      <div className="mobile-menu__name">{userData.name || userData.email || 'User'}</div>
                      <div className="mobile-menu__role">
                        {isProvider() ? 'Service Provider' : 'Client'}
                      </div>
                    </div>
                  </div>
                )}
                
                <nav className="mobile-menu__nav">
                  <ul className="mobile-menu__list">
                    <li className="mobile-menu__item">
                      <Link to="/" className="mobile-menu__link" onClick={toggleMobileMenu}>Home</Link>
                    </li>
                    <li className="mobile-menu__item">
                      <Link to="/services" className="mobile-menu__link" onClick={toggleMobileMenu}>Services</Link>
                    </li>
                    <li className="mobile-menu__item">
                      <Link to="/professionals" className="mobile-menu__link" onClick={toggleMobileMenu}>Professionals</Link>
                    </li>
                    <li className="mobile-menu__item">
                      <Link to="/about" className="mobile-menu__link" onClick={toggleMobileMenu}>About</Link>
                    </li>
                    <li className="mobile-menu__item">
                      <Link to="/contact" className="mobile-menu__link" onClick={toggleMobileMenu}>Contact</Link>
                    </li>
                  </ul>
                </nav>
                
                <div className="mobile-menu__actions">
                  {isAuthenticated ? (
                    <>
                      <Link to="/profile" className="mobile-menu__action-btn" onClick={toggleMobileMenu}>My Profile</Link>
                      <Link to="/bookings" className="mobile-menu__action-btn" onClick={toggleMobileMenu}>My Bookings</Link>
                      <Link to={isProvider() 
                        ? `/provider/dashboard/${userData?.id}` 
                        : `/client/dashboard/${userData?.id}`} 
                        className="mobile-menu__action-btn" onClick={toggleMobileMenu}>
                        {isProvider() 
                          ? "Provider Dashboard" 
                          : "My Dashboard"}
                      </Link>
                      <button onClick={handleLogout} className="mobile-menu__action-btn mobile-menu__action-btn--logout">
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="mobile-menu__action-btn" onClick={toggleMobileMenu}>Login</Link>
                      <Link to="/signup" className="mobile-menu__action-btn mobile-menu__action-btn--primary" onClick={toggleMobileMenu}>Sign Up</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar; 