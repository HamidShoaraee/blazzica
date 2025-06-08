import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProviderServices, getProviderBookings, getProviderProfile } from '../../utils/api';
import './ProviderDashboard.css';

function ProviderDashboard({ user, onLogout }) {
  const [services, setServices] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState(null);
  const { userId } = useParams();

  useEffect(() => {
    // Function to handle browser back button
    const handleBackButton = (event) => {
      // Show confirmation dialog
      const confirmLogout = window.confirm("Are you sure you want to logout?");
      
      if (confirmLogout) {
        // User confirmed, clear token and redirect to homepage
        localStorage.removeItem('token');
        window.location.href = '/';
      } else {
        // User cancelled, stay on dashboard
        // Push a new entry to prevent the back action
        window.history.pushState(null, null, window.location.pathname);
      }
    };

    // Listen for popstate (back/forward button)
    window.addEventListener('popstate', handleBackButton);
    
    // Push a state entry when first mounted
    window.history.pushState(null, null, window.location.pathname);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, []);

  useEffect(() => {
    // Debug logging for user and userId 
    console.log('Provider Dashboard - user:', user);
    console.log('Provider Dashboard - userId from URL:', userId);
    console.log('Provider Dashboard - user role:', user?.role);
    
    if (user && user.role) {
      const isPendingProvider = user.role.toLowerCase() === 'pending_provider';
      const isProvider = user.role.toLowerCase() === 'provider';
      console.log('Provider Dashboard - isPendingProvider:', isPendingProvider);
      console.log('Provider Dashboard - isProvider:', isProvider);
    }
    
    // Ensure we only fetch data for the current user
    if (user && user.id && userId && user.id === userId) {
      console.log('Provider Dashboard - User ID matches URL ID, fetching data');
      fetchData();
    } else if (user && user.id && userId && user.id !== userId) {
      console.log('Provider Dashboard - User ID does not match URL ID, showing error');
      setError('You do not have permission to view this dashboard.');
      setLoading(false);
    } else {
      console.log('Provider Dashboard - Missing user ID or URL ID');
      setError('Unable to load dashboard data.');
      setLoading(false);
    }
  }, [user, userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch services and pending bookings in parallel
      const [servicesData, bookingsData] = await Promise.all([
        getProviderServices(userId),
        getProviderBookings('pending')
      ]);
      
      setServices(servicesData);
      
      // Fetch profile data separately to handle errors better
      try {
        const profileData = await getProviderProfile(userId);
        setProfileData(profileData);
      } catch (profileErr) {
        console.log('No provider profile found or error:', profileErr);
        // This is expected for new providers, so we don't show an error message
        setProfileData(null);
      }
      
      // Filter bookings where the current user is the provider
      const providerBookings = bookingsData.filter(
        booking => booking.provider_id === userId && booking.status === 'pending'
      );
      setPendingBookings(providerBookings);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again later.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Show confirmation dialog
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    
    // Only proceed with logout if user confirms
    if (confirmLogout) {
      console.log("Logging out and redirecting to homepage");
      
      // Clear the token from local storage directly
      localStorage.removeItem('token');
      
      // Force page refresh to clear any user state
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="provider-dashboard-container">
      {error && (
        <div className="error-banner">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
        </div>
      )}
      
      <div className="dashboard-layout">
        {/* Left sidebar with navigation */}
        <aside className="dashboard-sidebar">
          <div className="quick-stats">
            <div className="stat-card">
              <span className="stat-number">{services.length}</span>
              <span className="stat-label">Services</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{pendingBookings.length}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          
          <nav className="dashboard-nav">
            <h3>Management</h3>
            <Link to="/provider/services" className="nav-item">
              <span className="nav-icon">📋</span>
              <span>Manage Services</span>
            </Link>
            <Link to="/provider/availability" className="nav-item">
              <span className="nav-icon">🗓️</span>
              <span>Set Availability</span>
            </Link>
            <Link to="/provider/requests" className="nav-item">
              <span className="nav-icon">🔔</span>
              <span>Booking Requests</span>
              {pendingBookings.length > 0 && (
                <span className="badge">{pendingBookings.length}</span>
              )}
            </Link>
            <Link to="/provider/history" className="nav-item">
              <span className="nav-icon">📚</span>
              <span>Booking History</span>
            </Link>
            <button onClick={handleLogout} className="nav-item logout-button">
              <span className="nav-icon">🚪</span>
              <span>Logout</span>
            </button>
          </nav>
        </aside>
        
        {/* Main content area */}
        <div className="dashboard-content">
          <header className="dashboard-header">
            <div className="header-content">
              <p className="welcome-message">Welcome back, <span className="provider-name">{user?.full_name ? user.full_name.split(' ')[0] : 'Provider'}</span></p>
            </div>
          </header>
          
          <main className="dashboard-main">
            {/* Provider Profile section */}
            <section className="dashboard-section">
              <div className="section-header">
              </div>
              
              <div className="profile-summary">
                {!profileData ? (
                  <div className="empty-state">
                    <div className="empty-icon">👤</div>
                    <h3>Complete Your Profile</h3>
                    <p>Set up your provider profile to help clients learn more about you</p>
                    <Link to={`/provider/profile/${user?.id}`} className="btn-primary">
                      Create Your Profile
                    </Link>
                  </div>
                ) : (
                  <div className="profile-card">
                    <div className="profile-header">
                      <h3>{user?.full_name || 'Provider'}</h3>
                      {profileData.years_of_experience && (
                        <div className="experience-badge">
                          {profileData.years_of_experience} {profileData.years_of_experience === 1 ? 'Year' : 'Years'} Experience
                        </div>
                      )}
                    </div>
                    
                    <div className="profile-details">
                      {profileData.location && (
                        <div className="profile-detail">
                          <span className="detail-icon">📍</span>
                          <span>{profileData.location}</span>
                        </div>
                      )}
                    </div>
                    
                    {profileData.bio && (
                      <div className="profile-bio">
                        <p>{profileData.bio.length > 150 ? `${profileData.bio.substring(0, 150)}...` : profileData.bio}</p>
                      </div>
                    )}
                    
                    {profileData.specialties && profileData.specialties.length > 0 && (
                      <div className="profile-specialties">
                        <h4>Specialties</h4>
                        <div className="specialty-tags">
                          {profileData.specialties.map((specialty, index) => (
                            <span key={index} className="specialty-tag">{specialty}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
            
            {/* Services section */}
            <section className="dashboard-section">
              <div className="section-header">
                <h2>Your Services</h2>
                <Link to="/provider/services" className="action-link">
                  <span>Manage All</span>
                  <span className="action-icon">→</span>
                </Link>
              </div>
              
              <div className="services-grid">
                {services.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🏠</div>
                    <h3>No Services Yet</h3>
                    <p>Start by adding services that you provide to clients</p>
                    <Link to="/provider/services/create" className="btn-primary">
                      Add Your First Service
                    </Link>
                  </div>
                ) : (
                  services.slice(0, 3).map(service => (
                    <div key={service.id} className="service-card">
                      <div className="service-status">
                        <span className={`status-indicator ${service.is_active ? 'active' : 'inactive'}`}></span>
                        <span className="status-text">{service.is_active ? 'Active' : 'Inactive'}</span>
                      </div>
                      <h3 className="service-title">{service.title}</h3>
                      <div className="service-category">{service.category}</div>
                      <div className="service-price">${service.price}</div>
                      <Link to={`/provider/services/${service.id}`} className="service-action">
                        Edit Service
                      </Link>
                    </div>
                  ))
                )}
                {services.length > 0 && (
                  <Link to="/provider/services/create" className="add-service-card">
                    <div className="plus-icon">+</div>
                    <span>Add New Service</span>
                  </Link>
                )}
              </div>
            </section>
            
            {/* Recent booking requests section */}
            <section className="dashboard-section">
              <div className="section-header">
                <h2>Recent Booking Requests</h2>
                <Link to="/provider/requests" className="action-link">
                  <span>View All</span>
                  <span className="action-icon">→</span>
                </Link>
              </div>
              
              <div className="bookings-list">
                {pendingBookings.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <h3>No Pending Requests</h3>
                    <p>When clients book your services, requests will appear here</p>
                  </div>
                ) : (
                  pendingBookings.slice(0, 3).map(booking => (
                    <div key={booking.id} className="booking-request-card">
                      <div className="booking-header">
                        <div className="booking-service">{booking.service_title || 'Unknown Service'}</div>
                        <div className="booking-price">${booking.total_price}</div>
                      </div>
                      <div className="booking-time">
                        <span className="time-icon">🕒</span>
                        <span>{new Date(booking.scheduled_at).toLocaleString()}</span>
                      </div>
                      <div className="booking-client">
                        <span className="client-icon">👤</span>
                        <span>{booking.client_name || 'Anonymous Client'}</span>
                      </div>
                      <div className="booking-actions">
                        <Link to={`/provider/requests/${booking.id}`} className="btn-primary">
                          Review
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ProviderDashboard; 