import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__container">
          <div className="footer__row">
            <div className="footer__column footer__column--about">
              <Link to="/" className="footer__logo logo">BLAZZICA</Link>
              <p className="footer__description">
                Connecting beauty professionals with clients for convenient at-home beauty services. Our platform makes it easy to book appointments with verified professionals.
              </p>
              <div className="footer__social">
                <a href="https://www.instagram.com/blazzica.official/" target="_blank" rel="noopener noreferrer" className="footer__social-link">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
            
            <div className="footer__column">
              <h4 className="footer__title">Quick Links</h4>
              <ul className="footer__links">
                <li><Link to="/" className="footer__link">Home</Link></li>
                <li><Link to="/services" className="footer__link">Services</Link></li>
                {/* Find Professionals link temporarily removed */}
                {/* <li><Link to="/professionals" className="footer__link">Find Professionals</Link></li> */}
                <li><Link to="/about" className="footer__link">About Us</Link></li>
                <li><Link to="/contact" className="footer__link">Contact</Link></li>
              </ul>
            </div>
            
            {/* Services section temporarily commented out */}
            {/* <div className="footer__column">
              <h4 className="footer__title">Services</h4>
              <ul className="footer__links">
                <li><Link to="/services/hair-styling" className="footer__link">Hair Styling</Link></li>
                <li><Link to="/services/makeup" className="footer__link">Makeup</Link></li>
                <li><Link to="/services/nail-care" className="footer__link">Nail Care</Link></li>
                <li><Link to="/services/skin-care" className="footer__link">Skin Care</Link></li>
                <li><Link to="/services/massage" className="footer__link">Massage</Link></li>
              </ul>
            </div> */}

          </div>
        </div>
      </div>
      
      <div className="footer__bottom">
        <div className="footer__container">
          <div className="footer__bottom-content">
            <div className="footer__copyright">
              Copyright © {new Date().getFullYear()} Blazzica – All Rights Reserved
            </div>
            <div className="footer__legal">
              <Link to="/privacy-policy" className="footer__legal-link">Privacy Policy</Link>
              <Link to="/terms" className="footer__legal-link">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 