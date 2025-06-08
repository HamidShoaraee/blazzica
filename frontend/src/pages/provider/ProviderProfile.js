import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  getProviderProfile,
  createProviderProfile,
  updateProviderProfile
} from '../../utils/api';

// Styles for the Provider Profile page
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
  profileForm: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
  },
  formColumn: {
    flex: 1,
  },
  tagInput: {
    marginBottom: '0.5rem',
  },
  tagContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  tag: {
    background: '#e1f0fa',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
  },
  tagRemove: {
    marginLeft: '0.5rem',
    cursor: 'pointer',
    fontSize: '1rem',
  }
};

function ProviderProfile({ user }) {
  const navigate = useNavigate();
  const { providerId } = useParams();
  const [profileData, setProfileData] = useState({
    bio: '',
    years_of_experience: '',
    location: '',
    specialties: [],
    availability: {}
  });
  const [specialty, setSpecialty] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    // Ensure user can only access their own profile
    if (user && user.id && providerId && user.id === providerId) {
      fetchProfileData();
    } else if (user && user.id && providerId && user.id !== providerId) {
      setProfileError('You do not have permission to view this profile.');
      setProfileLoading(false);
    } else {
      setProfileError('Unable to load profile data.');
      setProfileLoading(false);
    }
  }, [user, providerId]);

  const fetchProfileData = async () => {
    try {
      setProfileLoading(true);
      const data = await getProviderProfile(providerId);
      if (data) {
        setProfileData({
          bio: data.bio || '',
          years_of_experience: data.years_of_experience || '',
          location: data.location || '',
          specialties: data.specialties || [],
          availability: data.availability || {}
        });
      }
    } catch (err) {
      console.error('Error loading profile data:', err);
      // If the profile doesn't exist yet, we'll just leave the form empty
      if (err.response && err.response.status !== 404) {
        setProfileError('Failed to load profile data. Please try again later.');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    
    // Parse numeric values
    if (name === 'years_of_experience') {
      setProfileData(prev => ({ ...prev, [name]: value === '' ? '' : parseInt(value, 10) }));
    } else {
      setProfileData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSpecialty = () => {
    if (specialty.trim() !== '' && !profileData.specialties.includes(specialty.trim())) {
      setProfileData({
        ...profileData,
        specialties: [...profileData.specialties, specialty.trim()]
      });
      setSpecialty('');
    }
  };

  const handleRemoveSpecialty = (index) => {
    const updatedSpecialties = [...profileData.specialties];
    updatedSpecialties.splice(index, 1);
    setProfileData({
      ...profileData,
      specialties: updatedSpecialties
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    
    try {
      setProfileLoading(true);
      
      const dataToSend = {
        ...profileData,
        years_of_experience: profileData.years_of_experience === '' ? null : parseInt(profileData.years_of_experience, 10)
      };
      
      // Create a new profile (POST) instead of trying to update first
      console.log('Creating/updating provider profile with data:', dataToSend);
      
      try {
        await createProviderProfile(dataToSend);
        console.log('Provider profile created successfully');
      } catch (createErr) {
        console.error('Error creating profile:', createErr);
        
        // If create fails for a reason other than profile already exists, try update
        if (createErr.response && createErr.response.status === 400 && 
            createErr.response.data && createErr.response.data.detail === 'Provider profile already exists') {
          console.log('Profile exists, updating instead');
          await updateProviderProfile(dataToSend);
          console.log('Provider profile updated successfully');
        } else {
          throw createErr; // Re-throw if it's another type of error
        }
      }
      
      setProfileSuccess('Profile successfully saved!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setProfileSuccess('');
      }, 3000);
      
    } catch (err) {
      console.error('Error details:', err);
      setProfileError('Failed to save profile. Please try again later.');
    } finally {
      setProfileLoading(false);
    }
  };

  if (profileLoading) {
    return <div className="loading">Loading profile data...</div>;
  }

  return (
    <div className="provider-profile-container">
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

      <div className="profile-settings" style={styles.profileForm}>
        <h2>Provider Profile Settings</h2>
        {profileError && <div className="alert alert-danger">{profileError}</div>}
        {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}
        
        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={profileData.bio}
              onChange={handleProfileInputChange}
              rows="4"
              placeholder="Tell your clients about yourself, your experience, and what sets you apart..."
              className="form-control"
            ></textarea>
          </div>
          
          <div style={styles.formRow}>
            <div style={styles.formColumn}>
              <div className="form-group">
                <label htmlFor="years_of_experience">Years of Experience</label>
                <input
                  type="number"
                  id="years_of_experience"
                  name="years_of_experience"
                  value={profileData.years_of_experience}
                  onChange={handleProfileInputChange}
                  min="0"
                  className="form-control"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={profileData.location}
              onChange={handleProfileInputChange}
              placeholder="e.g., Downtown, West Side, etc."
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="specialties">Specialties</label>
            <div style={styles.tagInput}>
              <div className="input-group">
                <input
                  type="text"
                  id="specialties"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="Add a specialty and press Enter"
                  className="form-control"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSpecialty();
                    }
                  }}
                />
                <div className="input-group-append">
                  <button 
                    type="button" 
                    onClick={handleAddSpecialty}
                    className="btn btn-outline-secondary"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            
            <div style={styles.tagContainer}>
              {profileData.specialties.map((spec, index) => (
                <div key={index} style={styles.tag}>
                  {spec}
                  <span 
                    style={styles.tagRemove} 
                    onClick={() => handleRemoveSpecialty(index)}
                  >
                    ×
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group" style={{ marginTop: '2rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={profileLoading}
            >
              {profileLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProviderProfile; 