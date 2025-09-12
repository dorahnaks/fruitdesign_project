import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import '../styles/CustomerProfile.css';

const CustomerProfile = () => {
  const { user, updateUser, refreshUserData, notification, isLoading } = useAuth();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [componentLoading, setComponentLoading] = useState(true);
  const [userError, setUserError] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Helper function to validate form data
  const validateForm = () => {
    const errors = {};
    
    // Validate name
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    // Validate phone
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else {
      // Clean phone number and check length
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        errors.phone = 'Phone number must have at least 10 digits';
      }
    }
    
    // Validate email if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper function to safely get user's display name
  const getDisplayName = () => {
    try {
      if (!user) return 'User';
      if (user.name) return user.name;
      if (user?.email) return user.email.split('@')[0];
      return 'User';
    } catch (error) {
      console.error('Error in getDisplayName:', error);
      return 'User';
    }
  };

  // Helper function to safely get user's initials
  const getInitials = () => {
    try {
      if (!user) return 'U';
      if (user.name) {
        const nameParts = user.name.split(' ');
        return nameParts.map(part => part.charAt(0)).join('').toUpperCase();
      }
      if (user?.email) return user.email.charAt(0).toUpperCase();
      return 'U';
    } catch (error) {
      console.error('Error in getInitials:', error);
      return 'U';
    }
  };

  // Function to refresh user data from backend
  const handleRefreshUserData = async () => {
    try {
      setRefreshing(true);
      setMessage({ text: 'Refreshing profile data...', type: 'info' });
      await refreshUserData();
      setMessage({ text: 'Profile data refreshed successfully!', type: 'success' });
    } catch (error) {
      console.error('Error refreshing user data:', error);
      setMessage({ 
        text: 'Failed to refresh profile data. Your profile information may not be up to date.', 
        type: 'warning' 
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log('CustomerProfile useEffect triggered, user:', user);
    try {
      if (user) {
        setFormData({
          name: user.name || '',
          phone: user.phone || '',
          email: user.email || '',
          address: user.address || ''
        });
        setComponentLoading(false);
        setUserError(false);
      } else if (!isLoading) {
        setFormData({
          name: '',
          phone: '',
          email: '',
          address: ''
        });
        setComponentLoading(false);
        setUserError(true);
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
      setComponentLoading(false);
      setUserError(true);
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (notification && notification.show) {
      setMessage({ text: notification.message, type: 'success' });
    }
  }, [notification]);

  useEffect(() => {
    if (location.state && location.state.message) {
      setMessage({ text: location.state.message, type: 'success' });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ text: 'Please fix the errors in the form.', type: 'error' });
      return;
    }
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      // Create updated user object with exactly the fields the backend expects
      const updatedUserData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        address: formData.address.trim() || null
      };
      
      console.log('=== PROFILE UPDATE DEBUG ===');
      console.log('Raw form data:', formData);
      console.log('Processed update data:', updatedUserData);
      console.log('Data types:', {
        name: typeof updatedUserData.name,
        phone: typeof updatedUserData.phone,
        email: typeof updatedUserData.email,
        address: typeof updatedUserData.address
      });
      console.log('=== END DEBUG ===');
      
      const updatedUser = await updateUser(updatedUserData);
      console.log('User updated successfully:', updatedUser);
      
      setIsEditing(false);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error('=== PROFILE UPDATE ERROR ===');
      console.error('Error updating profile:', error);
      
      let errorMessage = 'An error occurred while updating your profile.';
      
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        
        if (error.response.status === 400) {
          errorMessage = error.response.data.error || 'Invalid data provided.';
        } else if (error.response.status === 422) {
          errorMessage = error.response.data.error || 'Validation error. Please check your input.';
          console.log('Validation error details:', error.response.data);
        } else if (error.response.status === 401) {
          errorMessage = 'You are not authorized to perform this action.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      console.error('=== END ERROR DEBUG ===');
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    try {
      if (user) {
        setFormData({
          name: user.name || '',
          phone: user.phone || '',
          email: user.email || '',
          address: user.address || ''
        });
      } else {
        setFormData({
          name: '',
          phone: '',
          email: '',
          address: ''
        });
      }
      setIsEditing(false);
      setMessage({ text: '', type: '' });
      setFormErrors({});
    } catch (error) {
      console.error('Error in handleCancel:', error);
      setIsEditing(false);
      setMessage({ text: '', type: '' });
      setFormErrors({});
    }
  };

  if (componentLoading || isLoading) {
    return (
      <div className="customer-profile">
        <div className="profile-container">
          <h1>My Account</h1>
          <div className="loading">Loading profile information...</div>
        </div>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="customer-profile">
        <div className="profile-container">
          <h1>My Account</h1>
          <div className="error-message">
            <p>Unable to load your profile information. Please try logging in again.</p>
            <button 
              className="retry-button" 
              onClick={() => window.location.href = '/login'}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-profile">
      <div className="profile-container">
        <h1>My Account</h1>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              {getInitials()}
            </div>
          </div>
          <div className="profile-info">
            <h2>{getDisplayName()}</h2>
            <p>{user?.email || 'No email provided'}</p>
          </div>
          <div className="profile-actions">
            <button 
              className="refresh-btn" 
              onClick={handleRefreshUserData}
              disabled={refreshing}
              title="Refresh profile data"
            >
              {refreshing ? <span className="loading-spinner"></span> : <i className="fas fa-sync-alt"></i>}
            </button>
            <button 
              className="edit-profile-btn" 
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
        
        {isEditing ? (
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={formErrors.name ? 'error' : ''}
                placeholder="Enter your full name"
              />
              {formErrors.name && <div className="error-text">{formErrors.name}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={formErrors.email ? 'error' : ''}
                placeholder="Enter your email address"
              />
              {formErrors.email && <div className="error-text">{formErrors.email}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className={formErrors.phone ? 'error' : ''}
                placeholder="e.g., (123) 456-7890"
              />
              {formErrors.phone && <div className="error-text">{formErrors.phone}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                placeholder="Enter your full address"
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="save-btn" 
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="detail-group">
              <h3>Personal Information</h3>
              <div className="detail-item">
                <span className="detail-label">Full Name:</span>
                <span className="detail-value">
                  {getDisplayName() !== 'User' ? getDisplayName() : 'Not provided'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{user?.email || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{user?.phone || 'Not provided'}</span>
              </div>
            </div>
            
            <div className="detail-group">
              <h3>Address</h3>
              <div className="detail-item">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{user?.address || 'Not provided'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;