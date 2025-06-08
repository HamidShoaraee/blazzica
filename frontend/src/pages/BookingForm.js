import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProvidersByService, getCurrentUser, createBooking, getServiceByTitle } from '../utils/api';

function BookingForm() {
  const { serviceId, providerId } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [service, setService] = useState(null);
  const [actualServiceId, setActualServiceId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [bookingData, setBookingData] = useState({
    selectedDate: '',
    selectedTimeSlot: '',
    notes: ''
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get current user data
        const userData = await getCurrentUser();
        setCurrentUser(userData);

        // Get provider data
        const providers = await getProvidersByService(serviceId);
        const foundProvider = providers.find(p => p.id === providerId);
        
        if (foundProvider) {
          console.log('Found provider:', foundProvider);
          console.log('Provider availability data:', foundProvider.availability);
          console.log('Provider date_availability data:', foundProvider.date_availability);
          setProvider(foundProvider);
          
          // Find the matching service in the provider's services
          // serviceId from URL params is the service name, we need to find the actual database ID
          const matchingService = foundProvider.services?.find(s => 
            s.title.toLowerCase() === serviceId.toLowerCase() || 
            serviceId.toLowerCase().includes(s.title.toLowerCase()) ||
            s.title.toLowerCase().includes(serviceId.toLowerCase())
          );
          
          if (matchingService) {
            console.log('Found matching service:', matchingService);
            setService(matchingService);
            setActualServiceId(matchingService.id);
          } else {
            console.log('No matching service found in provider services:', foundProvider.services);
            // Fallback: try to get service details by title
            try {
              const serviceData = await getServiceByTitle(serviceId);
              setService(serviceData);
              setActualServiceId(serviceData.id);
            } catch (err) {
              console.log('Could not fetch service details by title:', err);
              // Last fallback: use basic service info
              setService({ title: serviceId, price: 50 });
              setError('Could not find service details. You may need to contact the provider directly.');
            }
          }
        } else {
          setError('Provider not found');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId, providerId]);

  // Effect to compute available dates when provider data changes
  useEffect(() => {
    if (provider) {
      const dates = [];
      const availabilityData = provider?.availability || provider?.date_availability;
      
      if (!availabilityData) {
        setAvailableDates([]);
        return;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      Object.keys(availabilityData).forEach((dateString) => {
        const availableDate = new Date(dateString + 'T00:00:00');
        const slots = availabilityData[dateString];
        
        if (availableDate > today && Array.isArray(slots) && slots.length > 0) {
          const hasValidSlots = slots.some(slot => 
            slot && typeof slot === 'object' && slot.start && slot.end
          );
          
          if (hasValidSlots) {
            dates.push({
              date: dateString,
              dayName: availableDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
              displayDate: availableDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
            });
          }
        }
      });
      
      dates.sort((a, b) => new Date(a.date) - new Date(b.date));
      console.log(`Loaded ${dates.length} available booking dates`);
      setAvailableDates(dates);
    }
  }, [provider]);

  // Generate available time slots for a given day
  const generateTimeSlots = (daySlots) => {
    if (!daySlots || !Array.isArray(daySlots)) return [];
    
    const slots = [];
    daySlots.forEach(slot => {
      if (typeof slot === 'object' && slot.start && slot.end) {
        const startTime = parseTime(slot.start);
        const endTime = parseTime(slot.end);
        
        // Generate 1-hour slots within the available range
        let currentTime = startTime;
        while (currentTime + 60 <= endTime) {
          const startHour = Math.floor(currentTime / 60);
          const startMinute = currentTime % 60;
          const endHour = Math.floor((currentTime + 60) / 60);
          const endMinute = (currentTime + 60) % 60;
          
          slots.push({
            start: formatTime(startHour, startMinute),
            end: formatTime(endHour, endMinute),
            value: `${formatTime(startHour, startMinute)}-${formatTime(endHour, endMinute)}`
          });
          
          currentTime += 60; // Move to next hour
        }
      }
    });
    
    return slots;
  };

  // Helper function to parse time string to minutes
  const parseTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  // Helper function to format time
  const formatTime = (hours, minutes) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Get available time slots for selected date
  const getAvailableTimeSlots = () => {
    if (!bookingData.selectedDate) return [];
    
    // Use either availability or date_availability field
    const availabilityData = provider?.availability || provider?.date_availability;
    
    if (!availabilityData) {
      console.log('No availability data for time slots');
      return [];
    }
    
    console.log('Getting time slots for date:', bookingData.selectedDate);
    console.log('Available slots for this date:', availabilityData[bookingData.selectedDate]);
    
    // Get slots for the exact selected date
    const daySlots = availabilityData[bookingData.selectedDate];
    
    if (!daySlots || !Array.isArray(daySlots)) {
      console.log('No slots found for selected date');
      return [];
    }
    
    return generateTimeSlots(daySlots);
  };

  // Handle booking submission
  const handleBooking = async () => {
    if (!bookingData.selectedDate || !bookingData.selectedTimeSlot) {
      setError('Please select both date and time slot');
      return;
    }

    if (!actualServiceId) {
      setError('Service ID not found. Please try again or contact support.');
      return;
    }

    setIsBooking(true);
    setError('');

    try {
      // Create the booking datetime
      const selectedDate = new Date(bookingData.selectedDate);
      const timeSlot = bookingData.selectedTimeSlot.split('-')[0]; // Get start time
      const [hours, minutes] = timeSlot.split(':').map(Number);
      selectedDate.setHours(hours, minutes, 0, 0);

      const bookingPayload = {
        service_id: actualServiceId, // Use the actual UUID service ID
        scheduled_at: selectedDate.toISOString(),
        notes: bookingData.notes || null
      };

      console.log('Creating booking with payload:', bookingPayload);
      
      const result = await createBooking(bookingPayload);
      console.log('Booking created successfully:', result);
      
      // Show success message and redirect to dashboard
      const bookingId = result.id;
      
      setBookingSuccess(true);
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#666', fontSize: '16px' }}>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error && !provider) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        color: '#dc3545',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h3>Error</h3>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/services')}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Back to Services
        </button>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        maxWidth: '600px',
        margin: '40px auto',
        backgroundColor: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '48px', color: '#155724', marginBottom: '20px' }}>✓</div>
        <h2 style={{ color: '#155724', marginBottom: '10px' }}>Booking Confirmed!</h2>
        <p style={{ color: '#155724', fontSize: '16px', marginBottom: '20px' }}>
          Your appointment has been successfully booked for {bookingData.selectedDate} at {bookingData.selectedTimeSlot.split('-')[0]}.
        </p>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Redirecting to your dashboard in a few seconds...
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h1 style={{ 
          margin: '0 0 20px 0', 
          color: '#333',
          fontSize: '28px',
          fontWeight: '600'
        }}>
          Book Your Appointment
        </h1>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Provider Info */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>Provider</h3>
            <p style={{ margin: '0', fontSize: '18px', fontWeight: '500', color: '#007bff' }}>
              {provider?.full_name || 'Provider Name'}
            </p>
            {/* <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
              ⭐ {provider?.ratings_average || 'N/A'} ({provider?.ratings_count || 0} reviews)
            </p> */}
          </div>

          {/* Service Info */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>Service</h3>
            <p style={{ margin: '0', fontSize: '18px', fontWeight: '500', color: '#28a745' }}>
              {service?.title || serviceId}
            </p>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
              💰 ${service?.price || 50}/hour
            </p>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          margin: '0 0 30px 0', 
          color: '#333',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Select Date & Time
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px 16px',
            borderRadius: '6px',
            border: '1px solid #f5c6cb',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Date Selection */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '10px', 
            fontWeight: '500',
            color: '#495057'
          }}>
            Select Date *
          </label>
          
          <select
            value={bookingData.selectedDate}
            onChange={(e) => setBookingData({
              ...bookingData, 
              selectedDate: e.target.value,
              selectedTimeSlot: '' // Reset time slot when date changes
            })}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '16px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="">Choose a date</option>
            {availableDates.map((dateObj) => (
              <option key={dateObj.date} value={dateObj.date}>
                {dateObj.displayDate}
              </option>
            ))}
          </select>
        </div>

        {/* Time Slot Selection */}
        {bookingData.selectedDate && (
          <div style={{ marginBottom: '30px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px', 
              fontWeight: '500',
              color: '#495057'
            }}>
              Select Time Slot (1 hour) *
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '10px'
            }}>
              {getAvailableTimeSlots().length > 0 ? (
                getAvailableTimeSlots().map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setBookingData({
                      ...bookingData,
                      selectedTimeSlot: slot.value
                    })}
                    style={{
                      padding: '12px 8px',
                      border: bookingData.selectedTimeSlot === slot.value 
                        ? '2px solid #007bff' 
                        : '2px solid #e9ecef',
                      borderRadius: '8px',
                      backgroundColor: bookingData.selectedTimeSlot === slot.value 
                        ? '#e3f2fd' 
                        : 'white',
                      color: bookingData.selectedTimeSlot === slot.value 
                        ? '#007bff' 
                        : '#495057',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {slot.start}
                  </button>
                ))
              ) : (
                <p style={{ 
                  color: '#666', 
                  fontStyle: 'italic',
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '20px'
                }}>
                  No available time slots for this date
                </p>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '10px', 
            fontWeight: '500',
            color: '#495057'
          }}>
            Additional Notes (Optional)
          </label>
          <textarea
            value={bookingData.notes}
            onChange={(e) => setBookingData({
              ...bookingData,
              notes: e.target.value
            })}
            placeholder="Any special requests or notes for your appointment..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px 16px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '16px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Booking Summary */}
        {bookingData.selectedDate && bookingData.selectedTimeSlot && (
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            marginBottom: '30px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>Booking Summary</h3>
            <div style={{ marginBottom: '10px' }}>
              <strong>Date:</strong> {new Date(bookingData.selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Time:</strong> {bookingData.selectedTimeSlot.replace('-', ' - ')}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Duration:</strong> 1 hour
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Total Cost:</strong> ${service?.price || 50}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '15px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 30px',
              border: '2px solid #6c757d',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: '#6c757d',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleBooking}
            disabled={!bookingData.selectedDate || !bookingData.selectedTimeSlot || isBooking || !actualServiceId}
            style={{
              padding: '12px 30px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: (!bookingData.selectedDate || !bookingData.selectedTimeSlot || isBooking || !actualServiceId) 
                ? '#ccc' 
                : '#007bff',
              color: 'white',
              cursor: (!bookingData.selectedDate || !bookingData.selectedTimeSlot || isBooking || !actualServiceId) 
                ? 'not-allowed' 
                : 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            {isBooking ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </div>

      {/* Add CSS animation for loading spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default BookingForm; 