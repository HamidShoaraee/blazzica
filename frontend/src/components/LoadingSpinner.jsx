import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ size, color }) => {
  const spinnerStyle = {
    width: size,
    height: size,
    borderColor: `rgba(0, 0, 0, 0.1)`,
    borderTopColor: color,
  };

  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner" style={spinnerStyle}></div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.string,
  color: PropTypes.string,
};

LoadingSpinner.defaultProps = {
  size: '50px',
  color: '#7209b7', // primary color
};

export default LoadingSpinner; 