import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getProviderProfile,
  updateProviderProfile,
  createProviderProfile
} from '../../utils/api';

// Styles
const styles = {
  headerControls: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingTop: '0',
  },
  backButton: {
    background: '#3498db',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  backButtonIcon: {
    marginRight: '6px',
    fontSize: '16px',
  },
  availabilityContainer: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '1rem',
  },
  calendarContainer: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    borderBottom: '1px solid #eaeaea',
    paddingBottom: '0.5rem',
  },
  monthYearSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  arrowButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#3498db',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
  },
  dayName: {
    textAlign: 'center',
    padding: '0.5rem',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  dayCell: {
    padding: '0.5rem',
    border: '1px solid #eaeaea',
    minHeight: '5rem',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  dayNumber: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    color: '#333',
  },
  unavailableDay: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  selectedDay: {
    backgroundColor: '#e3f2fd',
    border: '2px solid #2196f3',
  },
  availableDay: {
    backgroundColor: '#e8f5e9',
    position: 'relative',
  },
  availabilityDot: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#4caf50',
  },
  outsideMonthDay: {
    opacity: 0.3,
    pointerEvents: 'none',
  },
  timeSlotContainer: {
    marginTop: '0.5rem',
  },
  timeSlot: {
    backgroundColor: '#e1f5fe',
    borderRadius: '4px',
    padding: '0.3rem 0.5rem',
    fontSize: '0.85rem',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayEditorContainer: {
    marginTop: '2rem',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  dayEditorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  timeSlotRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  timeInputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  availabilityActions: {
    marginTop: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
  },
  dateDisplay: {
    fontSize: '1.2rem',
    fontWeight: '600',
  }
};

// Default time values
const DEFAULT_TIME_SLOT = { start: '09:00', end: '17:00' };

// Day names
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Month names
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function ProviderAvailability({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Availability data structure: { "2023-06-15": [{ start: "09:00", end: "17:00" }] }
  const [dateAvailability, setDateAvailability] = useState({});
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, [user.id]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const data = await getProviderProfile(user.id);
      
      setProfileData(data);
      
      console.log('Received profile data:', data);
      
      // Initialize availability from profile data or with empty structure
      if (data && data.availability) {
        console.log('Found availability data:', data.availability);
        setDateAvailability(data.availability);
      } else {
        console.log('No availability data found, using empty object');
        setDateAvailability({});
      }
    } catch (err) {
      console.error('Error loading profile data:', err);
      
      // If profile doesn't exist (404), we'll create it when saving
      if (err.response && err.response.status === 404) {
        console.log('Provider profile not found, will create when saving availability');
        setProfileData(null);
        setDateAvailability({});
      } else {
        setError('Failed to load availability data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Generate calendar days for current month view
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    // Previous month days to fill the first week
    const prevMonthDays = [];
    if (firstDayOfMonth > 0) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
      
      for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        prevMonthDays.push({
          date: new Date(prevYear, prevMonth, day),
          isCurrentMonth: false
        });
      }
    }
    
    // Current month days
    const currentMonthDays = [];
    for (let day = 1; day <= daysInMonth; day++) {
      currentMonthDays.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }
    
    // Next month days to fill the last week
    const nextMonthDays = [];
    const totalDaysDisplayed = prevMonthDays.length + currentMonthDays.length;
    const remainingCells = 42 - totalDaysDisplayed; // 6 rows x 7 days to fill grid
    
    if (remainingCells > 0) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      
      for (let day = 1; day <= remainingCells; day++) {
        nextMonthDays.push({
          date: new Date(nextYear, nextMonth, day),
          isCurrentMonth: false
        });
      }
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Format date to YYYY-MM-DD for using as object keys
  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Check if a date has any availability slots
  const hasAvailability = (date) => {
    const dateKey = formatDateKey(date);
    const hasSlots = dateAvailability[dateKey] && dateAvailability[dateKey].length > 0;
    
    // Log available slots for debugging
    if (hasSlots) {
      console.log(`Date ${dateKey} has ${dateAvailability[dateKey].length} slots`);
    }
    
    return hasSlots;
  };

  // Add a time slot to the selected date
  const addTimeSlot = () => {
    if (!selectedDate) return;
    
    const dateKey = formatDateKey(selectedDate);
    setDateAvailability(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), { ...DEFAULT_TIME_SLOT }]
    }));
  };

  // Remove a time slot from the selected date
  const removeTimeSlot = (index) => {
    if (!selectedDate) return;
    
    const dateKey = formatDateKey(selectedDate);
    setDateAvailability(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter((_, i) => i !== index)
    }));
  };

  // Update a time slot for the selected date
  const updateTimeSlot = (index, field, value) => {
    if (!selectedDate) return;
    
    const dateKey = formatDateKey(selectedDate);
    setDateAvailability(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  // Format time for display
  const formatTime = (time) => {
    if (!time) return '';
    
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch (err) {
      return time;
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Handle day selection in calendar
  const handleDayClick = (day) => {
    const dateKey = formatDateKey(day.date);
    console.log(`Selected date: ${dateKey}`);
    
    if (dateAvailability[dateKey]) {
      console.log(`This date has ${dateAvailability[dateKey].length} time slots`);
    }
    
    setSelectedDate(day.date);
  };

  // Save availability settings
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      setSaving(true);
      
      // Validate time slots
      for (const dateKey in dateAvailability) {
        for (const slot of dateAvailability[dateKey]) {
          if (slot.start >= slot.end) {
            setError(`Invalid time slot for ${dateKey}: End time must be after start time.`);
            setSaving(false);
            return;
          }
        }
      }
      
      console.log('Saving availability data:', dateAvailability);
      
      try {
        // Try to update the existing profile first
        const updatedProfile = {
          ...profileData,
          availability: dateAvailability
        };
        
        const result = await updateProviderProfile(updatedProfile);
        console.log('Update result:', result);
        
        if (result.availability) {
          console.log('Received updated availability data:', result.availability);
          setDateAvailability(result.availability);
        }
        
        setProfileData(result);
        setSuccess('Your availability has been updated successfully!');
        
      } catch (updateError) {
        console.error('Error updating profile:', updateError);
        
        // If the profile doesn't exist (404), create it
        if (updateError.response && updateError.response.status === 404) {
          console.log('Profile not found, creating new profile...');
          
          try {
            // Create a new profile with availability
            const initialProfile = {
              bio: null,
              years_of_experience: null,
              location: null,
              specialties: [],
              availability: null
            };
            
            const newProfileData = {
              ...initialProfile,
              availability: dateAvailability
            };
            
            const createdProfile = await createProviderProfile(newProfileData);
            console.log('Created profile result:', createdProfile);
            
            if (createdProfile.availability) {
              setDateAvailability(createdProfile.availability);
            }
            
            setProfileData(createdProfile);
            setSuccess('Your provider profile has been created and availability saved successfully!');
            
          } catch (createError) {
            console.error('Error creating profile:', createError);
            throw createError;
          }
        } else {
          // Re-throw the error if it's not a 404
          throw updateError;
        }
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      console.error('Error saving availability:', err);
      setError('Failed to save availability. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading availability settings...</div>;
  }

  const calendarDays = generateCalendarDays();

  return (
    <div className="provider-availability-container">
      <div style={styles.headerControls}>
        <button 
          onClick={() => navigate(`/provider/dashboard/${user.id}`)}
          style={styles.backButton}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#2980b9';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#3498db';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
        >
          <span style={styles.backButtonIcon}>←</span>
          Return to Dashboard
        </button>
      </div>

      <div style={styles.availabilityContainer}>
        <h2>Set Your Availability Calendar</h2>
        <p className="text-muted">Select specific dates to set your available hours. Clients can book appointments during these times.</p>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.calendarContainer}>
            <div style={styles.calendarHeader}>
              <div style={styles.monthYearSelector}>
                <button 
                  type="button"
                  style={styles.arrowButton}
                  onClick={goToPreviousMonth}
                >
                  &#10094;
                </button>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <button 
                  type="button"
                  style={styles.arrowButton}
                  onClick={goToNextMonth}
                >
                  &#10095;
                </button>
              </div>
            </div>
            
            <div style={styles.calendarGrid}>
              {/* Day names header */}
              {DAY_NAMES.map(day => (
                <div key={day} style={styles.dayName}>
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((day, index) => {
                const dateKey = formatDateKey(day.date);
                const isSelected = selectedDate && formatDateKey(selectedDate) === dateKey;
                const hasSlots = hasAvailability(day.date);
                
                return (
                  <div 
                    key={index} 
                    style={{
                      ...styles.dayCell,
                      ...(isSelected ? styles.selectedDay : {}),
                      ...(hasSlots ? styles.availableDay : {}),
                      ...(day.isCurrentMonth ? {} : styles.outsideMonthDay)
                    }}
                    onClick={() => handleDayClick(day)}
                  >
                    <div style={styles.dayNumber}>{day.date.getDate()}</div>
                    {hasSlots && <div style={styles.availabilityDot}></div>}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Day editor */}
          {selectedDate && (
            <div style={styles.dayEditorContainer}>
              <div style={styles.dayEditorHeader}>
                <div style={styles.dateDisplay}>{formatDate(selectedDate)}</div>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-primary"
                  onClick={addTimeSlot}
                >
                  + Add Time Slot
                </button>
              </div>
              
              {dateAvailability[formatDateKey(selectedDate)] && dateAvailability[formatDateKey(selectedDate)].length > 0 ? (
                <div>
                  {dateAvailability[formatDateKey(selectedDate)].map((slot, index) => (
                    <div key={index} style={styles.timeSlotRow}>
                      <div style={styles.timeInputGroup}>
                        <label htmlFor={`time-slot-${index}-start`}>From</label>
                        <input
                          type="time"
                          id={`time-slot-${index}-start`}
                          value={slot.start}
                          onChange={(e) => updateTimeSlot(index, 'start', e.target.value)}
                          className="form-control"
                        />
                      </div>
                      
                      <div style={styles.timeInputGroup}>
                        <label htmlFor={`time-slot-${index}-end`}>To</label>
                        <input
                          type="time"
                          id={`time-slot-${index}-end`}
                          value={slot.end}
                          onChange={(e) => updateTimeSlot(index, 'end', e.target.value)}
                          className="form-control"
                        />
                      </div>
                      
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeTimeSlot(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted">
                  No time slots added for this date. Click "Add Time Slot" to make yourself available.
                </div>
              )}
            </div>
          )}
          
          <div style={styles.availabilityActions}>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate(`/provider/dashboard/${user.id}`)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Availability'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProviderAvailability; 