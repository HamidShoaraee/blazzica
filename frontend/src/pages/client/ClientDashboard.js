import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserBookings, cancelBooking } from '../../utils/api';

// Styles for the Client Dashboard page (matching ProviderProfile)
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  headerControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingTop: '0',
  },
  welcomeSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  heading: {
    fontSize: '1.8rem',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#2c3e50',
  },
  subheading: {
    fontSize: '1.2rem',
    fontWeight: '500',
    marginBottom: '10px',
    color: '#34495e',
  },
  button: {
    background: '#3498db',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'inline-block',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid #dee2e6',
    marginBottom: '20px',
  },
  tab: {
    padding: '10px 20px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  activeTab: {
    borderBottom: '2px solid #4361ee',
    color: '#4361ee',
    fontWeight: 'bold',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '500',
    color: 'white',
    marginLeft: '10px',
  },
  profileSection: {
    marginBottom: '30px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  clientInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  infoIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#e1f0fa',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#3498db',
  },
  emptyState: {
    textAlign: 'center',
    padding: '30px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  bookingActions: {
    marginTop: '15px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  logoutButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'inline-block',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
};

function ClientDashboard({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
    
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

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getUserBookings();
      setBookings(data);
    } catch (err) {
      setError('Failed to load bookings. Please try again later.');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        setLoading(true);
        await cancelBooking(bookingId);
        // Refresh bookings after cancellation
        fetchBookings();
      } catch (err) {
        setError('Failed to cancel booking. Please try again.');
        console.error('Error cancelling booking:', err);
        setLoading(false);
      }
    }
  };

  const handleLogout = () => {
    // Show confirmation dialog
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    
    if (confirmLogout) {
      // User confirmed, clear token and redirect to homepage
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  };

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.scheduled_at);
    const today = new Date();
    
    if (activeTab === 'upcoming') {
      return bookingDate >= today && booking.status !== 'cancelled';
    } else if (activeTab === 'past') {
      return bookingDate < today || booking.status === 'completed';
    } else {
      return booking.status === 'cancelled';
    }
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return { ...styles.statusBadge, backgroundColor: '#28a745' };
      case 'pending':
        return { ...styles.statusBadge, backgroundColor: '#ffc107', color: '#212529' };
      case 'cancelled':
        return { ...styles.statusBadge, backgroundColor: '#dc3545' };
      case 'completed':
        return { ...styles.statusBadge, backgroundColor: '#4361ee' };
      default:
        return { ...styles.statusBadge, backgroundColor: '#6c757d' };
    }
  };

  if (loading && !bookings.length) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ display: 'inline-block', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '15px' }}>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerControls}>
        <h1 style={styles.heading}>My Client Dashboard</h1>
        <button 
          onClick={handleLogout}
          style={styles.logoutButton}
        >
          Logout
        </button>
      </div>

      <div style={styles.welcomeSection}>
        <h2 style={styles.subheading}>Welcome, {user?.full_name || user?.email || 'Client'}!</h2>
        <p>View your service bookings and profile information here.</p>
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <Link
            to="/services"
            style={styles.button}
          >
            Browse Services
          </Link>
        </div>
      </div>
      
      {/* Profile Section */}
      <div style={styles.profileSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.subheading}>My Profile</h2>
        </div>
        
        <div style={styles.card}>
          <div style={styles.clientInfo}>
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>👤</div>
              <div>
                <strong>Name:</strong> {user?.full_name || 'Not provided'}
              </div>
            </div>
            
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>✉️</div>
              <div>
                <strong>Email:</strong> {user?.email}
              </div>
            </div>
            
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>📞</div>
              <div>
                <strong>Phone:</strong> {user?.phone_number || 'Not provided'}
              </div>
            </div>
            
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>🏠</div>
              <div>
                <strong>Address:</strong> {
                  user?.address ? (
                    <div style={{ marginTop: '5px' }}>
                      {user.address.street_address && <div>{user.address.street_address}</div>}
                      {(user.address.city || user.address.province) && (
                        <div>
                          {user.address.city}{user.address.city && user.address.province && ', '}{user.address.province}
                        </div>
                      )}
                      {user.address.country && <div>{user.address.country}</div>}
                      {user.address.postal_code && <div>{user.address.postal_code}</div>}
                    </div>
                  ) : 'Not provided'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Section */}
      <div>
        <div style={styles.sectionHeader}>
          <h2 style={styles.subheading}>My Bookings</h2>
        </div>
        
        <div style={styles.tabContainer}>
          <button
            onClick={() => setActiveTab('upcoming')}
            style={{
              ...styles.tab,
              ...(activeTab === 'upcoming' ? styles.activeTab : {})
            }}
          >
            Upcoming
          </button>
          
          <button
            onClick={() => setActiveTab('past')}
            style={{
              ...styles.tab,
              ...(activeTab === 'past' ? styles.activeTab : {})
            }}
          >
            Past
          </button>
          
          <button
            onClick={() => setActiveTab('cancelled')}
            style={{
              ...styles.tab,
              ...(activeTab === 'cancelled' ? styles.activeTab : {})
            }}
          >
            Cancelled
          </button>
        </div>
      </div>
      
      {error && (
        <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}
      
      {filteredBookings.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No bookings found in this category.</p>
          {activeTab === 'upcoming' && (
            <Link 
              to="/services"
              style={styles.button}
            >
              Browse Services
            </Link>
          )}
        </div>
      ) : (
        <div>
          {filteredBookings.map(booking => (
            <div key={booking.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{booking.service_title || 'Service Booking'}</h3>
                    <span style={getStatusBadgeClass(booking.status)}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <p style={{ margin: '10px 0' }}>
                    <strong>Date:</strong> {new Date(booking.scheduled_at).toLocaleString()}
                  </p>
                  
                  {booking.provider_name && (
                    <p style={{ margin: '5px 0' }}><strong>Provider:</strong> {booking.provider_name}</p>
                  )}
                  
                  {booking.notes && (
                    <p style={{ margin: '10px 0' }}><strong>Notes:</strong> {booking.notes}</p>
                  )}
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#2c3e50' }}>
                    ${booking.total_price}
                  </div>
                  
                  {activeTab === 'upcoming' && booking.status !== 'completed' && (
                    <div style={styles.bookingActions}>
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        style={{ 
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClientDashboard; 