import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import './Home.css';
import backgroundVideo from '../assets/videos/video_1.mp4';
import aboutImage from '../assets/videos/blazzika_5.jpg';

// Component imports
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';
import TestimonialCard from '../components/TestimonialCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  // State management
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroData, setHeroData] = useState({
    caption: "Professional Services At Your Doorstep",
    title: "Quality Services Delivered To Your Home",
    description: "Experience professional services in the comfort of your own home. Our skilled service providers deliver quality treatments and care directly to you, whether it's beauty, wellness, or pet care services."
  });

  // Backend data fetching
  useEffect(() => {
    // Set static services data immediately so something displays
    setServices([
      {
        id: 1,
        title: "Hair Styling & Treatment",
        description: "Professional cuts, coloring, styling, and specialized treatments provided by expert hairdressers in the comfort of your home.",
        image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      {
        id: 2,
        title: "Makeup Services",
        description: "From natural everyday looks to glamorous event makeup, our artists create the perfect style for any occasion using premium products.",
        image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      // {
      //   id: 3,
      //   title: "Nail Care & Art",
      //   description: "Luxurious manicures, pedicures, and creative nail art by skilled technicians using high-quality products and sterilized tools.",
      //   image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      // },
      {
        id: 4,
        title: "Skin Care Treatments",
        description: "Rejuvenating facials, specialized skin treatments, and personalized skincare routines to help you achieve a healthy, glowing complexion.",
        image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      {
        id: 6,
        title: "Pet Grooming",
        description: "Professional pet grooming services including bathing, brushing, nail trimming, and styling for your beloved pets at home.",
        image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      }
    ]);
    
    // Set loading to false immediately
    setIsLoading(false);

    const fetchData = async () => {
      try {
        // API calls commented out temporarily
        /* 
        setIsLoading(true);
        
        // Parallel API requests
        const [servicesResponse, heroResponse] = await Promise.all([
          axios.get('/api/services'),
          axios.get('/api/hero')
        ]);

        setServices(servicesResponse.data);
        
        // Update hero section if available from backend
        if (heroResponse.data) {
          setHeroData(heroResponse.data);
        }
        
        setIsLoading(false);
        */
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setIsLoading(false);
      }
    };

    // Uncomment to re-enable API fetch
    // fetchData();
  }, []);
  // Callback for booking form interaction
  const handleBookNow = () => {
    // Redirect to booking page or open modal
    window.location.href = '/booking';
  };

  // Animation variants for motion components
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="wrapper">
      {/* Navigation */}
      <Navbar />
      
      <main className="page">
        {/* Hero Section */}
        <section className="page__main main">
          <div className="main__video-container">
            <video className="main__video" autoPlay muted loop playsInline poster="/assets/poster-image.jpg">
              <source src={backgroundVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="main__overlay"></div>
          </div>
          <div className="main__container">
            <motion.h3 
              className="main__caption"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              {heroData.caption}
            </motion.h3>
            <motion.h1 
              className="main__title"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              {heroData.title}
            </motion.h1>
            <motion.div 
              className="main__text"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
            >
              {heroData.description}
            </motion.div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.6 }}
            >
              <Link to="/login" className="main__button">Get Started Today</Link>
            </motion.div>
          </div>
        </section>
        
        {/* About Section */}
        <section className="page__about about">
          <div className="about__container">
            <motion.div 
              className="about__image"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img src={aboutImage} alt="Beauty professional providing service" />
            </motion.div>
            <div className="about__content">
              <motion.h2 
                className="about__title title"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Why Choose Our Beauty Service
              </motion.h2>
              <motion.div 
                className="about__text"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <p>
                  We bring together the best beauty professionals in your area, offering a wide range of services delivered right to your doorstep. We carefully vet all our service providers to ensure you receive top-quality treatments.
                </p>
                <p>
                  With our easy-to-use platform, you can book appointments that fit your schedule, choose from verified professionals, and enjoy premium beauty services without the hassle of traveling to a salon.
                </p>
              </motion.div>
              {/* Learn More About Us link temporarily removed */}
              {/* <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Link to="/about" className="about__button button">Learn More About Us</Link>
              </motion.div> */}
            </div>
          </div>
        </section>
        
        {/* Services Section */}
        <section className="page__services services">
          <div className="services__container">
            <motion.h2 
              className="services__title title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Our Beauty Services
            </motion.h2>
            
            {isLoading ? (
              <div className="services__loading">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="services__error">{error}</div>
            ) : (
              <div className="services__row">
                {services.map((service, index) => (
                  <motion.div 
                    className="services__column" 
                    key={service.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ServiceCard 
                      image={service.image}
                      title={service.title}
                      description={service.description}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="page__how-it-works how-it-works">
          <div className="how-it-works__container">
            <motion.h2 
              className="how-it-works__title title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              How It Works
            </motion.h2>
            <div className="how-it-works__steps">
              <motion.div 
                className="how-it-works__step"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="step__number">1</div>
                <h3 className="step__title">Browse Services</h3>
                <p className="step__text">Explore our range of beauty services available in your area.</p>
              </motion.div>
              <motion.div 
                className="how-it-works__step"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="step__number">2</div>
                <h3 className="step__title">Book an Appointment</h3>
                <p className="step__text">Choose a time that works for you and book with your preferred provider.</p>
              </motion.div>
              <motion.div 
                className="how-it-works__step"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="step__number">3</div>
                <h3 className="step__title">Enjoy the Service</h3>
                <p className="step__text">Relax as your beauty professional comes to your home and provides the service.</p>
              </motion.div>
            </div>
          </div>
        </section>
        

        
        {/* CTA Section */}
        <section className="page__outro outro">
          <div className="outro__container">
            <motion.h2 
              className="outro__title title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Ready to Get Started?
            </motion.h2>
            <motion.div 
              className="outro__text"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Join our platform today and discover the convenience of at-home beauty services with our network of skilled professionals.
            </motion.div>
            <motion.div 
              className="outro__buttons"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link to="/signup?role=client" className="outro__button button">Sign Up as Client</Link>
              <Link to="/signup?role=provider" className="outro__button button button--outline">Join as Service Provider</Link>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home; 