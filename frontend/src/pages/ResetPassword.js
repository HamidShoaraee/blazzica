import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { updatePassword } from '../utils/api';
import backgroundImage from '../assets/videos/blazzika_6.jpg';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse URL parameters to get access token
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const token = hashParams.get('access_token');
    const errorParam = hashParams.get('error');
    
    if (errorParam) {
      setError('The password reset link is invalid or has expired. Please request a new one.');
    } else if (token) {
      setAccessToken(token);
    } else {
      setError('Invalid password reset link. Please request a new one.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!accessToken) {
      setError('Invalid reset token. Please request a new password reset.');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(accessToken, password);
      setSuccess('Password updated successfully! Redirecting to login...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Password update error:', err);
      setError(err.response?.data?.detail || 'Failed to update password. The reset link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestNewReset = () => {
    navigate('/login');
  };

  return (
    <div className="reset-password-page" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div className="form-container" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(5px)',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        width: '90%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Reset Password</h1>
        
        {error && (
          <div className="alert alert-danger" style={{
            padding: '10px',
            marginBottom: '15px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '5px',
            color: '#c00',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{
            padding: '10px',
            marginBottom: '15px',
            backgroundColor: '#efe',
            border: '1px solid #cfc',
            borderRadius: '5px',
            color: '#060',
            fontSize: '14px'
          }}>
            {success}
          </div>
        )}

        {!error.includes('invalid') && !error.includes('expired') && !success ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="6"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
                placeholder="Confirm new password"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              style={{ 
                width: '100%',
                padding: '12px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        ) : !success && (
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={handleRequestNewReset}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Back to Login
            </button>
          </div>
        )}
        
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          Remember your password? <a href="/login" style={{ color: '#6366f1' }}>Sign in</a>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword; 