import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const TestimonialCard = ({ name, role, stars, text, image }) => {
  // Function to generate star rating
  const renderStars = (rating) => {
    const filledStars = '★'.repeat(Math.floor(rating));
    const halfStar = rating % 1 !== 0 ? '½' : '';
    const emptyStars = '☆'.repeat(Math.floor(5 - rating));
    return (
      <div className="item-testimonial__stars" aria-label={`${rating} out of 5 stars`}>
        <span className="stars-filled">{filledStars}</span>
        {halfStar && <span className="stars-half">{halfStar}</span>}
        <span className="stars-empty">{emptyStars}</span>
      </div>
    );
  };

  return (
    <motion.div 
      className="testimonial__item item-testimonial"
      whileHover={{ 
        y: -5,
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {image && (
        <div className="item-testimonial__image">
          <img src={image} alt={name} />
        </div>
      )}
      <h4 className="item-testimonial__title">{name}</h4>
      {role && <div className="item-testimonial__caption">{role}</div>}
      {stars && renderStars(stars)}
      {text && <p className="item-testimonial__text">"{text}"</p>}
    </motion.div>
  );
};

TestimonialCard.propTypes = {
  name: PropTypes.string.isRequired,
  role: PropTypes.string,
  stars: PropTypes.number,
  text: PropTypes.string.isRequired,
  image: PropTypes.string
};

TestimonialCard.defaultProps = {
  stars: 5,
  role: 'Client'
};

export default TestimonialCard; 