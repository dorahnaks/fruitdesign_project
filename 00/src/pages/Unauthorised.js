// src/pages/Unauthorized.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Unauthorized = () => {
  const { currentUser, isAdmin, isSuperAdmin } = useAuth();

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-header">
          <h1>Access Denied</h1>
          <p>You don't have permission to access this page</p>
        </div>
        
        <div className="unauthorized-details">
          <p>
            {currentUser ? (
              <>
                You are logged in as <strong>{currentUser.email}</strong> with the role of <strong>{currentUser.role}</strong>.
                {currentUser.role === 'customer' && (
                  <> This area is restricted to administrators only.</>
                )}
                {currentUser.role === 'admin' && (
                  <> This area is restricted to super administrators only.</>
                )}
              </>
            ) : (
              <>Please log in to access this page.</>
            )}
          </p>
        </div>
        
        <div className="auth-buttons">
          {currentUser ? (
            <Link to="/" className="auth-button">
              <i className="fas fa-home"></i> Go to Home
            </Link>
          ) : (
            <Link to="/login" className="auth-button">
              <i className="fas fa-sign-in-alt"></i> Login
            </Link>
          )}
        </div>
      </div>
      <div className="auth-image">
        <div className="auth-image-content">
          <h2>Access Denied</h2>
          <p>Please contact your administrator if you believe this is an error</p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;