// src/pages/Signup.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTermsChange = (e) => {
    setTermsAccepted(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Split name into firstName and lastName for better backend compatibility
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Prepare registration data with both formats
      const registrationData = {
        ...formData,
        firstName,
        lastName,
        first_name: firstName, // snake_case version
        last_name: lastName   // snake_case version
      };
      
      console.log('Registration data:', registrationData);
      
      // Pass the registration data to register
      await register(registrationData);
      
      // After successful registration, redirect to profile with success message
      navigate('/profile', { 
        state: { 
          message: 'Account created successfully! Welcome to our platform.' 
        } 
      });
      
    } catch (err) {
      console.error('Signup error:', err);
      
      // Try to get more specific error message
      let errorMessage = 'Failed to sign up. Please try again.';
      
      if (err.response) {
        // Server responded with error status
        const { data, status } = err.response;
        
        if (data && data.error) {
          errorMessage = data.error;
        } else if (data && data.message) {
          errorMessage = data.message;
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = `Error ${status}: ${data?.message || 'Unknown error'}`;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Network error. Please check your connection.';
      } else {
        // Something happened in setting up the request
        errorMessage = err.message || 'An unexpected error occurred.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join us today and start your healthy journey</p>
        </div>
        
        {error && (
          <div className="auth-error">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-with-icon">
              <i className="fas fa-user"></i>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your Full Name"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-with-icon">
              <i className="fas fa-phone"></i>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+1234567890"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Delivery Address</label>
            <div className="input-with-icon textarea-icon">
              <i className="fas fa-home"></i>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Your delivery address"
              ></textarea>
            </div>
          </div>
          
          <div className="form-options">
            <div className="remember-me">
              <input 
                type="checkbox" 
                id="terms" 
                checked={termsAccepted}
                onChange={handleTermsChange}
              />
              <label htmlFor="terms">
                I agree to the Terms and Conditions
              </label>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading || !termsAccepted}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Creating account...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i> Sign Up
              </>
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Log In</Link></p>
        </div>
      </div>
      
      <div className="auth-image">
        <div className="auth-image-content">
          <h2>Fresh Fruits & Juices</h2>
          <p>Join our community of health-conscious individuals</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;