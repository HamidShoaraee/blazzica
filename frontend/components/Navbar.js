import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">Blazzica</Link>
            <div className="ml-10 hidden md:flex space-x-4">
              <Link to="/" className="hover:text-blue-200">Home</Link>
              <Link to="/services" className="hover:text-blue-200">Services</Link>
            </div>
          </div>
          
          <div className="flex space-x-4 items-center">
            {user ? (
              <>
                <span>Hi, {user.full_name || user.email}</span>
                <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
                <button 
                  onClick={handleLogout}
                  className="hover:text-blue-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200">Login</Link>
                <Link 
                  to="/signup"
                  className="bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 