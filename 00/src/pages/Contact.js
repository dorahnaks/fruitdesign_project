import React, { useState, useEffect } from 'react';
import '../styles/Contact.css';
import ContactForm from '../components/ContactForm';
import contactAPI from '../api/ContactAPI';
import feedbackAPI from '../api/FeedbackAPI';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiResponse, setApiResponse] = useState(null); // For debugging
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    const fetchContactInfo = async () => {
      try {
        setLoading(true);
        const response = await contactAPI.getContactInfo();
        console.log('Contact component received response:', response); // Debug log
        setApiResponse(response); // Store raw response for debugging
        setContactInfo(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching contact info:', err);
        setError('Failed to load contact information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContactInfo();
  }, []);

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      await feedbackAPI.submitFeedback(feedbackData);
      setFeedbackSubmitted(true);
      setTimeout(() => setFeedbackSubmitted(false), 3000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback');
    }
  };

  const renderContactInfo = () => {
    console.log('Rendering contact info. State:', { contactInfo, loading, error, apiResponse }); // Debug log
    
    if (loading) {
      return <div className="loading">Loading contact information...</div>;
    }
    if (error) {
      return <div className="error">{error}</div>;
    }
    if (!contactInfo) {
      return <div className="no-data">No contact information available</div>;
    }
    
    return (
      <div className="contact-info">
        <h2>Contact Information</h2>
        
        <div className="info-item">
          <div className="icon phone-icon" />
          <div>
            <strong>Phone</strong>
            <p>{contactInfo.phone || 'Not available'}</p>
          </div>
        </div>
        
        <div className="info-item">
          <div className="icon email-icon" />
          <div>
            <strong>Email</strong>
            <p>{contactInfo.email || 'Not available'}</p>
          </div>
        </div>
        
        <div className="info-item">
          <div className="icon location-icon" />
          <div>
            <strong>Address</strong>
            <p>{contactInfo.location || 'Not available'}</p>
          </div>
        </div>
        
        {/* Location Map Section */}
        <div className="info-item">
          <div className="icon map-icon" />
          <div>
            <strong>Location</strong>
            {contactInfo.map_link ? (
              <div className="map-container">
                <a 
                  href={contactInfo.map_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="map-link"
                >
                  View on Map
                </a>
                <div className="map-preview">
                  <iframe 
                    title="Location Map"
                    src={contactInfo.map_link.replace('/maps.google.com/', '/www.google.com/maps/embed?pb=').replace('/?q=', '?q=')}
                    width="100%" 
                    height="200" 
                    style={{ border: 0, borderRadius: '8px' }}
                    allowFullScreen="" 
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade">
                  </iframe>
                </div>
              </div>
            ) : (
              <p>Map not available</p>
            )}
          </div>
        </div>
        
        {/* Social Media Links Section */}
        {contactInfo.social_media_links && (
          <div className="info-item">
            <div className="icon social-icon" />
            <div>
              <strong>Social Media</strong>
              <div className="social-links">
                {contactInfo.social_media_links.facebook && (
                  <a href={contactInfo.social_media_links.facebook} target="_blank" rel="noopener noreferrer" className="social-link">
                    Facebook
                  </a>
                )}
                {contactInfo.social_media_links.twitter && (
                  <a href={contactInfo.social_media_links.twitter} target="_blank" rel="noopener noreferrer" className="social-link">
                    Twitter
                  </a>
                )}
                {contactInfo.social_media_links.instagram && (
                  <a href={contactInfo.social_media_links.instagram} target="_blank" rel="noopener noreferrer" className="social-link">
                    Instagram
                  </a>
                )}
                {contactInfo.social_media_links.linkedin && (
                  <a href={contactInfo.social_media_links.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Debug Information - Remove in production */}
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
          <h4>Debug Information</h4>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="contact">
        <h1 className="contact-heading">
          <span className="gradient-text">Get in Touch</span>
        </h1>
        <div className="contact-content">
          {renderContactInfo()}
          <div className="contact-form-container">
            <h2 className='Sm'>Send us Feedback</h2>
            {feedbackSubmitted && (
              <div className="success-message">
                Thank you for your feedback! We appreciate your input.
              </div>
            )}
            {isAuthenticated ? (
              <ContactForm onSubmitFeedback={handleFeedbackSubmit} />
            ) : (
              <div className="login-prompt">
                <p>Please <a href="/login">log in</a> to submit feedback.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;