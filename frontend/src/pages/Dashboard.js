import React from 'react';
import { Navigate } from 'react-router-dom';

function Dashboard({ user }) {
  // Simple router component that renders the appropriate dashboard based on user role
  if (!user) {
    return <div>Loading user data...</div>;
  }

  // Check if user is a provider
  const isProviderUser = user.role && 
    (user.role.toLowerCase() === 'provider' || 
    user.role.toLowerCase() === 'pending_provider');

  // Redirect to the appropriate dashboard with userId in URL
  if (isProviderUser) {
    return <Navigate to={`/provider/dashboard/${user.id}`} replace />;
  }
  
  // Default to client dashboard for any other role
  return <Navigate to={`/client/dashboard/${user.id}`} replace />;
}

export default Dashboard; 