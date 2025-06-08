import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProviderBookings, updateBookingStatus } from '../../utils/api';
import useToast from '../../hooks/useToast';
import ToastContainer from '../../components/ToastContainer';

function BookingRequests({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProviderBookings();
      
      // Filter bookings where user is the provider and status is pending
      const pendingBookings = data.filter(booking => 
        booking.provider_id === user.id && booking.status === 'pending'
      );
      
      // Manually enrich each booking with client and service details
      const enrichedBookings = await Promise.all(
        pendingBookings.map(async (booking) => {
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
              } else {
                console.error('Failed to fetch client data:', clientResponse.status, clientResponse.statusText);
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
      showError('Failed to load booking requests. Please try again later.');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [user.id, showError]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleApprove = async (bookingId) => {
    try {
      // Find the booking details for the success message
      const booking = bookings.find(b => b.id === bookingId);
      const clientName = booking?.client_name || 'the client';
      
      await updateBookingStatus(bookingId, 'confirmed');
      
      // Update local state - remove from pending requests
      setBookings(bookings.filter(booking => booking.id !== bookingId));
      
      // Show success toast
      showSuccess(`✅ Booking request accepted! ${clientName} has been notified and the appointment is now confirmed.`);
      
    } catch (err) {
      showError('Failed to approve booking. Please try again.');
      console.error('Error approving booking:', err);
    }
  };

  const handleDecline = async (bookingId) => {
    if (window.confirm('Are you sure you want to decline this booking request?')) {
      try {
        // Find the booking details for the success message
        const booking = bookings.find(b => b.id === bookingId);
        const clientName = booking?.client_name || 'the client';
        
        await updateBookingStatus(bookingId, 'cancelled');
        
        // Update local state - remove from pending requests
        setBookings(bookings.filter(booking => booking.id !== bookingId));
        
        // Show success toast
        showSuccess(`❌ Booking request declined. ${clientName} has been notified about the cancellation.`);
        
      } catch (err) {
        showError('Failed to decline booking. Please try again.');
        console.error('Error declining booking:', err);
      }
    }
  };

  if (loading && bookings.length === 0) {
    return <div className="loading">Loading booking requests...</div>;
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="booking-requests" style={{ 
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
              📋 Booking Requests
            </h1>
            <p style={{ 
              margin: 0, 
              color: '#6c757d', 
              fontSize: '16px'
            }}>
              Review and manage incoming booking requests
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
        
        {bookings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }}>📅</div>
            <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>No Pending Requests</h3>
            <p style={{ color: '#6c757d' }}>You don't have any pending booking requests at the moment.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {bookings.map(booking => {
              return (
              <div key={booking.id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e9ecef',
                overflow: 'hidden'
              }}>
                {/* Header */}
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '20px',
                  borderBottom: '1px solid #e9ecef',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '20px' }}>
                      New Booking Request
                    </h3>
                    <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
                      Received on {new Date(booking.created_at || booking.scheduled_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span style={{
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    Pending
                  </span>
                </div>
                
                {/* Content */}
                <div style={{ padding: '20px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '30px',
                    marginBottom: '25px'
                  }}>
                    {/* Service Details */}
                    <div>
                      <h4 style={{ 
                        margin: '0 0 15px 0', 
                        color: '#495057',
                        fontSize: '16px',
                        fontWeight: '600',
                        borderBottom: '2px solid #e9ecef',
                        paddingBottom: '8px'
                      }}>
                        🎯 Service Details
                      </h4>
                      <div style={{ marginBottom: '10px' }}>
                        <strong style={{ color: '#2c3e50' }}>Service:</strong>
                        <p style={{ margin: '5px 0', color: '#28a745', fontWeight: '500', fontSize: '16px' }}>
                          {booking.service_title || 'Unknown Service'}
                        </p>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong style={{ color: '#2c3e50' }}>Category:</strong>
                        <p style={{ margin: '5px 0', color: '#6c757d' }}>
                          {booking.service_category || 'Unknown Category'}
                        </p>
                      </div>
                      {booking.service_description && (
                        <div style={{ marginBottom: '10px' }}>
                          <strong style={{ color: '#2c3e50' }}>Description:</strong>
                          <p style={{ margin: '5px 0', color: '#6c757d', fontSize: '14px' }}>
                            {booking.service_description}
                          </p>
                        </div>
                      )}
                      <div>
                        <strong style={{ color: '#2c3e50' }}>Price:</strong>
                        <p style={{ margin: '5px 0', color: '#007bff', fontWeight: '600', fontSize: '18px' }}>
                          ${booking.total_price}
                        </p>
                      </div>
                    </div>

                    {/* Client Details */}
                    <div>
                      <h4 style={{ 
                        margin: '0 0 15px 0', 
                        color: '#495057',
                        fontSize: '16px',
                        fontWeight: '600',
                        borderBottom: '2px solid #e9ecef',
                        paddingBottom: '8px'
                      }}>
                        👤 Client Information
                      </h4>
                      <div style={{ marginBottom: '10px' }}>
                        <strong style={{ color: '#2c3e50' }}>Full Name:</strong>
                        <p style={{ margin: '5px 0', color: '#2c3e50', fontWeight: '500', fontSize: '16px' }}>
                          {booking.client_name || 'Anonymous'}
                        </p>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong style={{ color: '#2c3e50' }}>Email:</strong>
                        <p style={{ margin: '5px 0', color: '#6c757d' }}>
                          {booking.client_email || 'N/A'}
                        </p>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong style={{ color: '#2c3e50' }}>Phone:</strong>
                        <p style={{ margin: '5px 0', color: '#6c757d' }}>
                          {booking.client_phone || 'N/A'}
                        </p>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong style={{ color: '#2c3e50' }}>Address:</strong>
                        <div style={{ margin: '5px 0', color: '#6c757d' }}>
                          {(() => {
                            if (!booking.client_address) {
                              return 'N/A';
                            }
                            
                            if (typeof booking.client_address === 'string') {
                              return <p style={{ margin: 0 }}>{booking.client_address}</p>;
                            }
                            
                            if (typeof booking.client_address === 'object') {
                              const hasAddressData = booking.client_address.street_address || 
                                                   booking.client_address.city || 
                                                   booking.client_address.province || 
                                                   booking.client_address.postal_code;
                              
                              if (!hasAddressData) {
                                return 'No address provided';
                              }
                              
                              return (
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
                              );
                            }
                            
                            return 'Invalid address format';
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                  }}>
                    <h4 style={{ 
                      margin: '0 0 10px 0', 
                      color: '#495057',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      📅 Appointment Details
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                      <div>
                        <strong style={{ color: '#2c3e50' }}>Date & Time:</strong>
                        <p style={{ margin: '5px 0', color: '#dc3545', fontWeight: '600' }}>
                          {new Date(booking.scheduled_at).toLocaleString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Client Notes */}
                  {booking.notes && (
                    <div style={{
                      backgroundColor: '#e7f3ff',
                      border: '1px solid #b3d7ff',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '20px'
                    }}>
                      <h4 style={{ 
                        margin: '0 0 10px 0', 
                        color: '#495057',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}>
                        💬 Client Notes
                      </h4>
                      <p style={{ 
                        margin: 0, 
                        color: '#2c3e50',
                        fontStyle: 'italic',
                        lineHeight: '1.5'
                      }}>
                        "{booking.notes}"
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'flex-end',
                    paddingTop: '15px',
                    borderTop: '1px solid #e9ecef'
                  }}>
                    <button 
                      onClick={() => handleDecline(booking.id)} 
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                    >
                      Decline Request
                    </button>
                    <button 
                      onClick={() => handleApprove(booking.id)} 
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                    >
                      Accept Request
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </>
  );
}

export default BookingRequests; 