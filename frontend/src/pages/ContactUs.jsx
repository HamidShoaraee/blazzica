import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import blazzicaImage from '../assets/videos/blazzica.jpg';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiry_type: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError('');

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just show success message
      setSubmitMessage('Thank you for your message! We\'ll get back to you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiry_type: 'general'
      });
    } catch (error) {
      setSubmitError('There was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="wrapper">
      <main className="contact-page">
        {/* Hero Section */}
        <section className="contact-hero">
          <div className="contact-hero__image-container">
            <img 
              src={blazzicaImage} 
              alt="Blazzica Contact" 
              className="contact-hero__image"
            />
            <div className="contact-hero__overlay"></div>
          </div>

        </section>

        {/* Contact Content */}
        <section className="contact-content">
          <div className="contact-content__container">
            <div className="contact-grid">
              {/* Contact Information */}
              <motion.div 
                className="contact-info"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.h2 className="contact-info__title" variants={fadeInUp}>
                  Contact Information
                </motion.h2>
                <motion.p className="contact-info__description" variants={fadeInUp}>
                  Ready to book a service or have questions? We're here to help you every step of the way.
                </motion.p>

                <motion.div className="contact-details" variants={fadeInUp}>
                  <div className="contact-detail">
                    <div className="contact-detail__icon">📧</div>
                    <div className="contact-detail__content">
                      <h3>Email</h3>
                      <p>support@blazzica.com</p>
                      <span>We reply within 24 hours</span>
                    </div>
                  </div>

                  <div className="contact-detail">
                    <div className="contact-detail__icon">📞</div>
                    <div className="contact-detail__content">
                      <h3>Phone</h3>
                      <p>+1(236)818-3395</p>
                      <span>Mon-Fri 9AM-6PM EST</span>
                    </div>
                  </div>

                  <div className="contact-detail">
                    <div className="contact-detail__icon">📱</div>
                    <div className="contact-detail__content">
                      <h3>Social Media</h3>
                      <div className="social-links">
                        <a href="https://www.instagram.com/blazzica.official/" target="_blank" rel="noopener noreferrer">
                          Instagram
                        </a>
                      </div>
                      <span>Follow us for updates</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Contact Form */}
              <motion.div 
                className="contact-form-container"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h2 className="contact-form__title">Send us a Message</h2>
                
                {submitMessage && (
                  <div className="form-message form-message--success">
                    {submitMessage}
                  </div>
                )}
                
                {submitError && (
                  <div className="form-message form-message--error">
                    {submitError}
                  </div>
                )}

                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="inquiry_type">Type of Inquiry</label>
                      <select
                        id="inquiry_type"
                        name="inquiry_type"
                        value={formData.inquiry_type}
                        onChange={handleInputChange}
                        className="form-control"
                      >
                        <option value="general">General Question</option>
                        <option value="booking">Booking Support</option>
                        <option value="provider">Become a Provider</option>
                        <option value="technical">Technical Issue</option>
                        <option value="partnership">Partnership</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                      rows="6"
                      placeholder="Please provide details about your inquiry..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner"></span>
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="contact-faq">
          <div className="contact-faq__container">
            <motion.h2 
              className="contact-faq__title"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              Frequently Asked Questions
            </motion.h2>
            
            <motion.div 
              className="faq-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div className="faq-item" variants={fadeInUp}>
                <h3>How do I book a service?</h3>
                <p>Simply browse our service catalog, select a provider, choose your preferred time slot, and confirm your booking. You'll receive confirmation via email.</p>
              </motion.div>

              <motion.div className="faq-item" variants={fadeInUp}>
                <h3>How do I become a service provider?</h3>
                <p>Click on "Sign Up" and select "Service Provider" during registration. You'll need to complete your profile and verification process before offering services.</p>
              </motion.div>

              <motion.div className="faq-item" variants={fadeInUp}>
                <h3>What areas do you serve?</h3>
                <p>We currently serve the Greater Vancouver Area and surrounding regions. We're expanding to new areas regularly.</p>
              </motion.div>

              <motion.div className="faq-item" variants={fadeInUp}>
                <h3>How are payments processed?</h3>
                <p> You can pay with major credit cards, and all transactions are encrypted and secure.</p>
              </motion.div>

              <motion.div className="faq-item" variants={fadeInUp}>
                <h3>What if I need to cancel or reschedule?</h3>
                <p>You can cancel or reschedule bookings through your dashboard. Please note our cancellation policy requires at least 24 hours notice.</p>
              </motion.div>

              <motion.div className="faq-item" variants={fadeInUp}>
                <h3>How do I report an issue?</h3>
                <p>Use the contact form above or email us directly at support@blazzica.com. For urgent issues, please call our support line.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs; 