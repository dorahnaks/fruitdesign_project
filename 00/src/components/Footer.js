// src/components/Footer.js
import React, { useState, useEffect } from 'react';
import '../styles/Footer.css';
import facebookIcon from '../images/fb_icon.png';
import twitterIcon from '../images/twitter.png';
import instagramIcon from '../images/insta_icon.png';
import contactAPI from '../api/ContactAPI';

const Footer = () => {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        setLoading(true);
        const response = await contactAPI.getContactInfo();
        setContactInfo(response);
      } catch (err) {
        console.error('Error fetching contact info for footer:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  const renderContactInfo = () => {
    if (loading) {
      return null; // Don't show anything while loading
    }

    if (!contactInfo) {
      return (
        <>
          <li><a href="tel:+256760457639">+256 760457639</a></li>
          <li><a href="mailto:info@fruitdesign.com">info@fruitdesign.com</a></li>
        </>
      );
    }

    return (
      <>
        {contactInfo.phone && (
          <li><a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a></li>
        )}
        {contactInfo.email && (
          <li><a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a></li>
        )}
      </>
    );
  };

  const renderSocialLinks = () => {
    if (loading || !contactInfo || !contactInfo.social_media_links) {
      // Default social links if none are set in the database
      return (
        <>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-icon-container">
            <img src={instagramIcon} alt="Instagram" className="social-icon instagram-icon" />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-icon-container">
            <img src={facebookIcon} alt="Facebook" className="social-icon facebook-icon" />
          </a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X" className="social-icon-container">
            <img src={twitterIcon} alt="X" className="social-icon x-icon" />
          </a>
        </>
      );
    }

    const socialLinks = contactInfo.social_media_links;
    return (
      <>
        {socialLinks.instagram && (
          <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-icon-container">
            <img src={instagramIcon} alt="Instagram" className="social-icon instagram-icon" />
          </a>
        )}
        {socialLinks.facebook && (
          <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-icon-container">
            <img src={facebookIcon} alt="Facebook" className="social-icon facebook-icon" />
          </a>
        )}
        {socialLinks.twitter && (
          <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="X" className="social-icon-container">
            <img src={twitterIcon} alt="X" className="social-icon x-icon" />
          </a>
        )}
      </>
    );
  };

  return (
    <footer className="footer">
      <div className="footer-columns">
        <div className="footer-column">
          <h4>Our Categories</h4>
          <ul>
            <li><a href="/fruits">Fresh Fruits</a></li>
            <li><a href="/juices">Natural Juices</a></li>
            <li><a href="/dried-fruits">Dried Fruits</a></li>
            <li><a href="/detox-packages">Detox Juice Packages</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Legal</h4>
          <ul>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Contact</h4>
          <ul>
            {renderContactInfo()}
          </ul>
        </div>
        <div className="footer-column">
          <h4>Location</h4>
          <ul>
            {contactInfo && contactInfo.location ? (
              <>
                <li>{contactInfo.location}</li>
                {contactInfo.map_link && (
                  <li><a href={contactInfo.map_link} target="_blank" rel="noopener noreferrer">Get Directions</a></li>
                )}
              </>
            ) : (
              <>
                <li>Kisugu Namuwongo</li>
                <li>Muwuliriza Road</li>
                <li>Kampala, Uganda</li>
                <li><a href="/directions">Get Directions</a></li>
              </>
            )}
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-social">
          {renderSocialLinks()}
        </div>
        <p>© 2025 Fruit Design. All rights reserved</p>
      </div>
    </footer>
  );
};

export default Footer;