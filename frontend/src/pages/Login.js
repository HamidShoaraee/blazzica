import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, resetPassword } from '../utils/api';
import backgroundImage from '../assets/videos/blazzika_6.jpg';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await login(email, password);
      
      if (!response.user || !response.user.id) {
        throw new Error('Invalid user data received from server');
      }
      
      // Get user data
      const userId = response.user.id;
      const userRole = response.user.role;
      
      // Log login data
      console.log('LOGIN DATA:', {
        userId,
        role: userRole
      });
      
      // Store user in state
      setUser(response.user);
      
      // DIRECT APPROACH: Explicitly check if the role contains "provider" or "pending"
      const roleString = String(userRole).toLowerCase();
      const isAnyProviderType = roleString.includes('provider') || roleString.includes('pending');
      
      console.log('DIRECT ROLE CHECK:', {
        roleString,
        isAnyProviderType
      });
      
      // Force redirection based on role
      if (isAnyProviderType) {
        console.log(`REDIRECTING TO PROVIDER DASHBOARD: /provider/dashboard/${userId}`);
        // Direct navigation with replace to avoid history issues
        window.location.href = `/provider/dashboard/${userId}`;
      } else {
        console.log(`REDIRECTING TO CLIENT DASHBOARD: /client/dashboard/${userId}`);
        // Direct navigation with replace to avoid history issues
        window.location.href = `/client/dashboard/${userId}`;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsResetLoading(true);
    setResetMessage('');

    try {
      const response = await resetPassword(resetEmail);
      setResetMessage('If the email exists in our system, a password reset link has been sent. Please check your email.');
      setResetEmail('');
    } catch (err) {
      console.error('Reset password error:', err);
      setResetMessage('An error occurred. Please try again later.');
    } finally {
      setIsResetLoading(false);
    }
  };

  const openForgotPasswordModal = () => {
    setShowForgotPassword(true);
    setResetEmail(email); // Pre-fill with login email if available
    setResetMessage('');
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setResetEmail('');
    setResetMessage('');
  };

  return (
    <div className="login-page" style={{
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
        backdropFilter: 'blur(5px)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h1>
        
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={isLoading} style={{ width: '100%' }}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <button 
            type="button" 
            onClick={openForgotPasswordModal}
            style={{
              background: 'none',
              border: 'none',
              color: '#6366f1',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Forgot Password?
          </button>
        </div>
        
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
              Reset Password
            </h2>
            
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666', fontSize: '14px' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            {resetMessage && (
              <div style={{
                padding: '10px',
                marginBottom: '15px',
                backgroundColor: resetMessage.includes('error') ? '#fee' : '#efe',
                border: `1px solid ${resetMessage.includes('error') ? '#fcc' : '#cfc'}`,
                borderRadius: '5px',
                fontSize: '14px',
                color: resetMessage.includes('error') ? '#c00' : '#060'
              }}>
                {resetMessage}
              </div>
            )}
            
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label htmlFor="resetEmail">Email Address</label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  style={{ width: '100%', marginBottom: '15px' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={closeForgotPasswordModal}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #ddd',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isResetLoading}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: isResetLoading ? 'not-allowed' : 'pointer',
                    opacity: isResetLoading ? 0.7 : 1
                  }}
                >
                  {isResetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login; 