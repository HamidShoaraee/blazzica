import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import aboutHeroImage from '../assets/videos/blazzica_about_us_3.jpg';
import beautyImage from '../assets/videos/blazzica_about_us_4.jpg';
import petImage from '../assets/videos/happy_dog.jpg';
import './AboutUs.css';

const AboutUs = () => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="wrapper">
      <main className="about-page">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-hero__image-container">
            <img 
              src={aboutHeroImage} 
              alt="Blazzica About Us" 
              className="about-hero__image"
            />
            <div className="about-hero__overlay"></div>
          </div>
          <div className="about-hero__container">
            <motion.div 
              className="about-hero__content"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.h1 
                className="about-hero__title"
                variants={fadeInUp}
              >
                About Us
              </motion.h1>
              <motion.p 
                className="about-hero__subtitle"
                variants={fadeInUp}
              >
                Exceptional Beauty, Wellness, and Pet Care Services — Delivered to You
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Main About Section */}
        <section className="about-main">
          <div className="about-main__container">
            <motion.div 
              className="about-main__content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <p className="about-main__text">
                At Blazzica, we believe premium care should be convenient, personalized, and available wherever you are. We connect skilled professionals with clients who value quality, flexibility, and a tailored experience. Our mission is to transform the way you access beauty, wellness, and pet care — making it simple, seamless, and customized to your lifestyle. Whether at home or on the go, Blazzica is dedicated to helping you — and those you care about — look and feel your best.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Beauty and Wellness Section */}
        <section className="about-beauty">
          <div className="about-beauty__container">
            <div className="about-beauty__content">
              <motion.div 
                className="about-beauty__text"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInLeft}
              >
                <h2 className="about-beauty__title">Beauty and Wellness Services</h2>
                <h3 className="about-beauty__subtitle">Personalized Care to Help You Look and Feel Your Best</h3>
                <p className="about-beauty__description">
                  Blazzica offers a complete range of beauty and wellness services, thoughtfully designed to meet the diverse needs of all individuals. Whether you're seeking expert grooming, stylish haircuts, professional makeup, relaxing spa treatments, or advanced skincare, our experienced providers deliver high-quality, personalized care. Enjoy luxury beauty and wellness services, all in the comfort and privacy of your home — because you deserve to feel confident and refreshed, wherever life takes you.
                </p>
              </motion.div>
              <motion.div 
                className="about-beauty__image"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInRight}
              >
                <img src={beautyImage} alt="Beauty and Wellness Services" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pet Services Section */}
        <section className="about-pets">
          <div className="about-pets__container">
            <div className="about-pets__content">
              <motion.div 
                className="about-pets__image"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInLeft}
              >
                <img src={petImage} alt="Pet Care Services" />
              </motion.div>
              <motion.div 
                className="about-pets__text"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInRight}
              >
                <h2 className="about-pets__title">Pet Services</h2>
                <h3 className="about-pets__subtitle">Expert Care for Your Beloved Companions</h3>
                <p className="about-pets__description">
                  Pets are family, and they deserve the best care. Blazzica's pet services are designed to keep your furry friends happy, healthy, and well-groomed. From professional grooming and dental care to reliable pet sitting, our skilled specialists provide attentive, compassionate service tailored to each pet's needs. With Blazzica, your pets enjoy top-notch care in the familiar and comforting surroundings of home.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default AboutUs; 