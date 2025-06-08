import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProviderBookings, updateBookingStatus } from '../../utils/api';
import useToast from '../../hooks/useToast';
import ToastContainer from '../../components/ToastContainer';

function BookingHistory({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('confirmed');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, price-desc, price-asc
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProviderBookings();
      
      // Filter bookings where user is the provider and status is not pending
      const relevantBookings = data.filter(booking => 
        booking.provider_id === user.id && 
        booking.status !== 'pending'
      );

      // Manually enrich each booking with client and service details
      const enrichedBookings = await Promise.all(
        relevantBookings.map(async (booking) => {
          const enrichedBooking = { ...booking };
          
          try {
            // Get service details
            if (booking.service_id) {
              const serviceResponse = await fetch(`http://localhost:8000/api/services/${booking.service_id}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              if (serviceResponse.ok) {
                const serviceData = await serviceResponse.json();
                enrichedBooking.service_title = serviceData.title;
                enrichedBooking.service_category = serviceData.category;
                enrichedBooking.service_description = serviceData.description;
              }
            }
            
            // Get client details
            if (booking.client_id) {
              const clientResponse = await fetch(`http://localhost:8000/api/auth/user/${booking.client_id}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              if (clientResponse.ok) {
                const clientData = await clientResponse.json();
                enrichedBooking.client_name = clientData.full_name;
                enrichedBooking.client_email = clientData.email;
                enrichedBooking.client_phone = clientData.phone_number;
                enrichedBooking.client_address = clientData.address;
              }
            }
          } catch (error) {
            console.error(`Error enriching booking ${booking.id}:`, error);
          }
          
          return enrichedBooking;
        })
      );

      setBookings(enrichedBookings);
    } catch (err) {
      showError('Failed to load booking history. Please try again later.');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [user.id, showError]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleComplete = async (bookingId) => {
    if (window.confirm('Are you sure you want to mark this booking as completed?')) {
      try {
        const booking = bookings.find(b => b.id === bookingId);
        await updateBookingStatus(bookingId, 'completed');
        
        // Update local state
        setBookings(bookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'completed' } 
            : booking
        ));
        
        showSuccess(`✅ Booking for ${booking?.client_name || 'client'} has been marked as completed!`);
        
        // Automatically switch to completed tab to show the result after a short delay
        setTimeout(() => {
          setActiveTab('completed');
        }, 500);
        
      } catch (err) {
        showError('Failed to complete booking. Please try again.');
        console.error('Error completing booking:', err);
      }
    }
  };

  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    };

    switch (status) {
      case 'confirmed':
        return { ...baseStyle, backgroundColor: '#e8f5e8', color: '#2e7d32' };
      case 'completed':
        return { ...baseStyle, backgroundColor: '#e3f2fd', color: '#1976d2' };
      case 'cancelled':
        return { ...baseStyle, backgroundColor: '#ffebee', color: '#d32f2f' };
      default:
        return { ...baseStyle, backgroundColor: '#f5f5f5', color: '#757575' };
    }
  };

  const getTabCounts = () => {
    return {
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };
  };

  // Filter and sort bookings
  const getFilteredAndSortedBookings = () => {
    let filtered = bookings.filter(booking => {
      // Filter by tab
      const statusMatch = activeTab === 'confirmed' ? booking.status === 'confirmed' :
                         activeTab === 'completed' ? booking.status === 'completed' :
                         booking.status === 'cancelled';
      
      // Filter by search term
      const searchMatch = !searchTerm || 
        booking.service_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service_category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return statusMatch && searchMatch;
    });

    // Sort bookings
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.scheduled_at) - new Date(a.scheduled_at);
        case 'date-asc':
          return new Date(a.scheduled_at) - new Date(b.scheduled_at);
        case 'price-desc':
          return b.total_price - a.total_price;
        case 'price-asc':
          return a.total_price - b.total_price;
        default:
          return new Date(b.scheduled_at) - new Date(a.scheduled_at);
      }
    });

    return filtered;
  };

  const filteredBookings = getFilteredAndSortedBookings();
  const tabCounts = getTabCounts();

  if (loading && bookings.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #4361ee',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666', fontSize: '16px' }}>Loading booking history...</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div style={{ 
        padding: '20px', 
        maxWidth: '1400px', 
        margin: '0 auto',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div>
            <h1 style={{ 
              margin: '0 0 8px 0', 
              color: '#2c3e50', 
              fontSize: '28px',
              fontWeight: '700'
            }}>
              📚 Booking History
            </h1>
            <p style={{ 
              margin: 0, 
              color: '#6c757d', 
              fontSize: '16px'
            }}>
              Manage and track your completed appointments
            </p>
          </div>
          <button
            onClick={() => navigate(`/provider/dashboard/${user.id}`)}
            style={{
              backgroundColor: '#4361ee',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(67, 97, 238, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#3652d3';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(67, 97, 238, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#4361ee';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(67, 97, 238, 0.3)';
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Filters and Search */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            alignItems: 'end'
          }}>
            {/* Search */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: '#374151'
              }}>
                🔍 Search bookings
              </label>
              <input
                type="text"
                placeholder="Search by service, client, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'border-color 0.2s ease',
                  backgroundColor: '#fff'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4361ee'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Sort */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: '#374151'
              }}>
                📊 Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="date-desc">📅 Date (Newest first)</option>
                <option value="date-asc">📅 Date (Oldest first)</option>
                <option value="price-desc">💰 Price (Highest first)</option>
                <option value="price-asc">💰 Price (Lowest first)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '8px',
          marginBottom: '20px',
          display: 'flex',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          {[
            { key: 'confirmed', label: 'Confirmed', icon: '✅', count: tabCounts.confirmed },
            { key: 'completed', label: 'Completed', icon: '🎉', count: tabCounts.completed },
            { key: 'cancelled', label: 'Cancelled', icon: '❌', count: tabCounts.cancelled }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '16px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                backgroundColor: activeTab === tab.key ? '#4361ee' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#6c757d'
              }}
              onMouseOver={(e) => {
                if (activeTab !== tab.key) {
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.color = '#4361ee';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== tab.key) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#6c757d';
                }
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span style={{
                backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : '#e9ecef',
                color: activeTab === tab.key ? 'white' : '#6c757d',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.5 }}>
              {searchTerm ? '🔍' : 
               activeTab === 'confirmed' ? '✅' :
               activeTab === 'completed' ? '🎉' : '❌'}
            </div>
            <h3 style={{ color: '#6c757d', marginBottom: '10px', fontSize: '20px' }}>
              {searchTerm ? 'No matching bookings found' : `No ${activeTab} bookings`}
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '16px', maxWidth: '400px', margin: '0 auto' }}>
              {searchTerm ? 
                'Try adjusting your search terms or selecting a different category.' :
                `You don't have any ${activeTab} bookings at the moment.`
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  marginTop: '20px',
                  backgroundColor: '#4361ee',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gap: '16px',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))'
          }}>
            {filteredBookings.map(booking => (
              <div 
                key={booking.id} 
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e9ecef',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* Card Header */}
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '16px 20px',
                  borderBottom: '1px solid #e9ecef',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 4px 0', 
                      color: '#2c3e50', 
                      fontSize: '18px',
                      fontWeight: '600'
                    }}>
                      {booking.service_title || 'Service Booking'}
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      color: '#6c757d', 
                      fontSize: '14px' 
                    }}>
                      {booking.service_category || 'General Service'}
                    </p>
                  </div>
                  <span style={getStatusBadgeStyle(booking.status)}>
                    {booking.status}
                  </span>
                </div>

                {/* Card Content */}
                <div style={{ padding: '20px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    marginBottom: '16px'
                  }}>
                    {/* Client Information */}
                    <div>
                      <h4 style={{ 
                        margin: '0 0 12px 0', 
                        color: '#495057',
                        fontSize: '16px',
                        fontWeight: '600',
                        borderBottom: '2px solid #e9ecef',
                        paddingBottom: '6px'
                      }}>
                        👤 Client Information
                      </h4>
                      <div style={{ marginBottom: '10px' }}>
                        <strong style={{ color: '#374151', fontSize: '14px' }}>Full Name:</strong>
                        <p style={{ 
                          margin: '4px 0 0 0', 
                          color: '#2c3e50', 
                          fontSize: '15px',
                          fontWeight: '500'
                        }}>
                          {booking.client_name || 'Anonymous'}
                        </p>
                      </div>
                      {booking.client_email && (
                        <div style={{ marginBottom: '10px' }}>
                          <strong style={{ color: '#374151', fontSize: '14px' }}>📧 Email:</strong>
                          <p style={{ 
                            margin: '4px 0 0 0', 
                            color: '#6c757d', 
                            fontSize: '14px'
                          }}>
                            {booking.client_email}
                          </p>
                        </div>
                      )}
                      {booking.client_phone && (
                        <div style={{ marginBottom: '10px' }}>
                          <strong style={{ color: '#374151', fontSize: '14px' }}>📞 Phone:</strong>
                          <p style={{ 
                            margin: '4px 0 0 0', 
                            color: '#6c757d', 
                            fontSize: '14px'
                          }}>
                            {booking.client_phone}
                          </p>
                        </div>
                      )}
                      {booking.client_address && (
                        <div style={{ marginBottom: '10px' }}>
                          <strong style={{ color: '#374151', fontSize: '14px' }}>📍 Address:</strong>
                          <div style={{ 
                            margin: '4px 0 0 0', 
                            color: '#6c757d', 
                            fontSize: '14px'
                          }}>
                            {typeof booking.client_address === 'string' ? (
                              booking.client_address
                            ) : (
                              <div>
                                {booking.client_address.street_address && <div>{booking.client_address.street_address}</div>}
                                {(booking.client_address.city || booking.client_address.province) && (
                                  <div>
                                    {booking.client_address.city}{booking.client_address.city && booking.client_address.province && ', '}{booking.client_address.province}
                                  </div>
                                )}
                                {booking.client_address.country && <div>{booking.client_address.country}</div>}
                                {booking.client_address.postal_code && <div>{booking.client_address.postal_code}</div>}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Booking Details */}
                    <div>
                      <h4 style={{ 
                        margin: '0 0 12px 0', 
                        color: '#495057',
                        fontSize: '16px',
                        fontWeight: '600',
                        borderBottom: '2px solid #e9ecef',
                        paddingBottom: '6px'
                      }}>
                        📅 Booking Details
                      </h4>
                      <div style={{ marginBottom: '12px' }}>
                        <strong style={{ color: '#374151', fontSize: '14px' }}>Date & Time:</strong>
                        <p style={{ 
                          margin: '4px 0 0 0', 
                          color: '#2c3e50', 
                          fontSize: '15px',
                          fontWeight: '500'
                        }}>
                          {new Date(booking.scheduled_at).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        <p style={{ 
                          margin: '2px 0 0 0', 
                          color: '#6c757d', 
                          fontSize: '14px'
                        }}>
                          {new Date(booking.scheduled_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <strong style={{ color: '#374151', fontSize: '14px' }}>💰 Payment:</strong>
                        <p style={{ 
                          margin: '4px 0 0 0', 
                          color: '#28a745', 
                          fontSize: '18px',
                          fontWeight: '600'
                        }}>
                          ${booking.total_price}
                        </p>
                      </div>

                      {booking.service_description && (
                        <div style={{ marginBottom: '12px' }}>
                          <strong style={{ color: '#374151', fontSize: '14px' }}>📝 Service Description:</strong>
                          <p style={{ 
                            margin: '4px 0 0 0', 
                            color: '#6c757d', 
                            fontSize: '14px',
                            lineHeight: '1.4'
                          }}>
                            {booking.service_description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {booking.notes && (
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      border: '1px solid #e9ecef'
                    }}>
                      <strong style={{ 
                        color: '#374151', 
                        fontSize: '14px',
                        display: 'block',
                        marginBottom: '6px'
                      }}>
                        💬 Client Notes:
                      </strong>
                      <p style={{ 
                        margin: 0, 
                        color: '#6c757d', 
                        fontSize: '14px',
                        fontStyle: 'italic',
                        lineHeight: '1.4'
                      }}>
                        "{booking.notes}"
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {booking.status === 'confirmed' && (
                    <div style={{
                      paddingTop: '16px',
                      borderTop: '1px solid #e9ecef',
                      display: 'flex',
                      justifyContent: 'flex-end'
                    }}>
                      <button 
                        onClick={() => handleComplete(booking.id)} 
                        style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '10px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                      >
                        ✅ Mark as Completed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {bookings.length > 0 && (
          <div style={{
            marginTop: '30px',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: '#2c3e50', 
              fontSize: '18px',
              fontWeight: '600'
            }}>
              📊 Summary Statistics
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#4361ee',
                  marginBottom: '4px'
                }}>
                  {bookings.length}
                </div>
                <div style={{ color: '#6c757d', fontSize: '14px' }}>Total Bookings</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#28a745',
                  marginBottom: '4px'
                }}>
                  ${bookings.filter(booking => booking.status === 'completed').reduce((sum, booking) => sum + booking.total_price, 0).toFixed(2)}
                </div>
                <div style={{ color: '#6c757d', fontSize: '14px' }}>Total Earnings</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#1976d2',
                  marginBottom: '4px'
                }}>
                  {tabCounts.completed}
                </div>
                <div style={{ color: '#6c757d', fontSize: '14px' }}>Completed Services</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#ff9800',
                  marginBottom: '4px'
                }}>
                  {((tabCounts.completed / (bookings.length || 1)) * 100).toFixed(1)}%
                </div>
                <div style={{ color: '#6c757d', fontSize: '14px' }}>Completion Rate</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
}

export default BookingHistory; 