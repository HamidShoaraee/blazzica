import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getCurrentUser } from './utils/api';
import theme from './styles/theme';
import './styles/components.css';

// Components
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ServicesList from './pages/ServicesList';
import ServiceDetail from './pages/ServiceDetail';
import ServiceCatalog from './pages/ServiceCatalog';
import ProviderDetail from './pages/ProviderDetail';
import BookingForm from './pages/BookingForm';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import ResetPassword from './pages/ResetPassword';

import Dashboard from './pages/Dashboard';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ManageServices from './pages/provider/ManageServices';
import ProviderProfile from './pages/provider/ProviderProfile';
import ProviderAvailability from './pages/provider/ProviderAvailability';
import CreateService from './pages/provider/CreateService';
import BookingRequests from './pages/provider/BookingRequests';
import BookingHistory from './pages/provider/BookingHistory';
import ClientDashboard from './pages/client/ClientDashboard';

// Layout component that conditionally shows Navbar
const Layout = ({ user, onLogout, children }) => {
  const location = useLocation();
  const showNavbar = location.pathname === '/';
  
  return (
    <div className="app">
      {showNavbar && <Navbar user={user} onLogout={onLogout} />}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      setLoading(true);
      getCurrentUser()
        .then(userData => {
          console.log('App.js: Setting user with role:', userData.role);
          
          // Normalize role to lowercase for consistency across the app
          if (userData && userData.role !== undefined) {
            userData.role = String(userData.role).toLowerCase();
          }
          
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Helper function to check if user is a provider
  const isProvider = () => {
    if (!user) {
      return false;
    }
    
    // Get the raw role value
    const rawRole = user.role;
    
    // Log provider check for debugging
    console.log('IS_PROVIDER CHECK:', {
      rawRole,
      userId: user.id
    });
    
    // Handle case variations of provider roles
    if (typeof rawRole === 'string') {
      const role = rawRole.toLowerCase();
      const isProviderRole = role === 'provider' || role === 'pending_provider';
      
      console.log('Provider role check result:', {
        normalizedRole: role,
        isProviderRole
      });
      
      return isProviderRole;
    }
    
    return false;
  };

  // Helper function for dashboard redirection based on user role
  const getDashboardPath = () => {
    if (!user) {
      return '/login';
    }
    
    return '/dashboard'; // Uses our Dashboard component for routing
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to={getDashboardPath()} replace />} />
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to={getDashboardPath()} replace />} />
            <Route path="/reset-password" element={!user ? <ResetPassword /> : <Navigate to={getDashboardPath()} replace />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/services" element={<ServicesList />} />
            <Route path="/service-catalog" element={<ServiceCatalog />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/services/details/:serviceName" element={<ServiceDetail />} />
            <Route path="/providers/:id" element={<ProviderDetail />} />
            <Route 
              path="/booking/:serviceId/:providerId" 
              element={<BookingForm />} 
            />
            
            {/* Dashboard router - use our improved Dashboard component */}
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />} 
            />
            
            {/* Client Dashboard */}
            <Route 
              path="/client/dashboard/:userId" 
              element={
                user ? (
                  isProvider() ? (
                    <Navigate to={`/provider/dashboard/${user.id}`} replace />
                  ) : (
                    <ClientDashboard user={user} />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            
            {/* Provider routes */}
            <Route 
              path="/provider/dashboard/:userId" 
              element={
                user ? (
                  isProvider() ? (
                    <ProviderDashboard user={user} />
                  ) : (
                    <Navigate to={`/client/dashboard/${user.id}`} replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route 
              path="/provider/services" 
              element={isProvider() ? <ManageServices user={user} /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/provider/services/:serviceId" 
              element={isProvider() ? <ManageServices user={user} /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/provider/services/create" 
              element={isProvider() ? <CreateService user={user} /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/provider/requests" 
              element={isProvider() ? <BookingRequests user={user} /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/provider/history" 
              element={isProvider() ? <BookingHistory user={user} /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/provider/profile/:providerId" 
              element={isProvider() ? <ProviderProfile user={user} /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/provider/availability" 
              element={isProvider() ? <ProviderAvailability user={user} /> : <Navigate to="/login" replace />} 
            />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App; 