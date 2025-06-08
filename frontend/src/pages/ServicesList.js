import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ServicesList = () => {
  // Redirect to the new service catalog page
  return <Navigate to="/service-catalog" replace />;
};

export default ServicesList; 