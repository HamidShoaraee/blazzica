import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const ServiceCard = ({ image, title, description, id }) => {
  // Ensure we always have an ID value
  const serviceId = id || 'details';
  
  return (
    <motion.div 
      className="services__item item-services"
      whileHover={{ 
        y: -10,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="item-services__top">
        <div className="item-services__image">
          <img 
            src={image || 'https://via.placeholder.com/400x250?text=Service+Image'} 
            alt={title || 'Beauty Service'} 
          />
        </div>
        <h3 className="item-services__title">{title || 'Beauty Service'}</h3>
      </div>
      <div className="item-services__text">
        {description || 'Detailed description of this beauty service and what clients can expect.'}
      </div>
      {/* Learn More button removed - functionality deactivated */}
    </motion.div>
  );
};

ServiceCard.propTypes = {
  image: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default ServiceCard; 