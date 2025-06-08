import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../utils/api';
import backgroundImage from '../assets/videos/blazzika_4.jpg';

// Canadian provinces and territories
const CANADIAN_PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'YT', name: 'Yukon' }
];

function Signup() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone_number: '',
    street_address: '',
    city: '',
    province: '',
    country: 'Canada',
    postal_code: '',
    role: 'client' // Default role is client
  });
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear password error when either password field changes
    if (name === 'password' || name === 'confirm_password') {
      setPasswordError('');
    }
  };

  const validatePasswords = () => {
    if (formData.password !== formData.confirm_password) {
      setPasswordError('Passwords do not match');
      return false;
    }
    return true;
  };

  // Validate Canadian postal code
  const validatePostalCode = (postalCode) => {
    const canadianPostalCodeRegex = /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/;
    return canadianPostalCodeRegex.test(postalCode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (!validatePasswords()) {
      return;
    }

    // Validate postal code if provided
    if (formData.postal_code && !validatePostalCode(formData.postal_code)) {
      setError('Please enter a valid Canadian postal code (e.g., K1A 0A6)');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create a copy of formData without confirm_password and structure address
      const { confirm_password, street_address, city, province, country, postal_code, ...baseData } = formData;
      
      const signupData = {
        ...baseData,
        address: {
          street_address,
          city,
          province,
          country,
          postal_code
        }
      };
      
      await signup(signupData);
      setSuccess('Account created successfully! You can now login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      // Handle different error formats
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        
        // Check if detail is an object or array (validation error)
        if (typeof detail === 'object') {
          if (Array.isArray(detail)) {
            // Handle array of validation errors
            errorMessage = detail.map(item => 
              typeof item === 'object' ? item.msg || JSON.stringify(item) : item
            ).join(', ');
          } else {
            // Handle object validation error
            errorMessage = detail.msg || JSON.stringify(detail);
          }
        } else {
          // Simple string error
          errorMessage = detail.toString();
        }
      }
      
      setError(errorMessage);
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 0'
    }}>
      <div className="form-container" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',  // Semi-transparent white
        backdropFilter: 'blur(5px)',  // Add blur effect behind the form
        maxWidth: '600px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Sign Up</h1>
        
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}
        
        {success && (
          <div className="alert alert-success">{success}</div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm_password">Confirm Password</label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
            {passwordError && (
              <div className="error-message" style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                {passwordError}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone_number">Phone Number</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="e.g., (416) 555-0123"
            />
          </div>
          
          {/* Address Section */}
          <fieldset style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
            <legend style={{ fontWeight: 'bold', color: '#333' }}>Address Information</legend>
            
            <div className="form-group">
              <label htmlFor="street_address">Street Address</label>
              <input
                type="text"
                id="street_address"
                name="street_address"
                value={formData.street_address}
                onChange={handleChange}
                placeholder="e.g., 123 Main Street, Apt 4B"
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g., Toronto"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="province">Province/Territory</label>
                <select
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                >
                  <option value="">Select Province</option>
                  {CANADIAN_PROVINCES.map(province => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="postal_code">Postal Code</label>
                <input
                  type="text"
                  id="postal_code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  placeholder="e.g., K1A 0A6"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>
          </fieldset>
          
          <div className="form-group">
            <label>Account Type</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'normal' }}>
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={formData.role === 'client'}
                  onChange={handleChange}
                  style={{ width: 'auto', marginRight: '5px' }}
                />
                Client
              </label>
              <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'normal' }}>
                <input
                  type="radio"
                  name="role"
                  value="provider"
                  checked={formData.role === 'provider'}
                  onChange={handleChange}
                  style={{ width: 'auto', marginRight: '5px' }}
                />
                Service Provider
              </label>
            </div>
          </div>
          
          <button type="submit" disabled={isLoading} style={{ width: '100%' }}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}

export default Signup; 