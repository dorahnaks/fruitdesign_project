// src/components/ContactForm.js
import React, { useState } from 'react';
import '../styles/ContactForm.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent!');
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      message: ''
    });
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group rd">
          <label htmlFor="firstName">First name</label>
          <input 
            type="text" 
            id="firstName"
            name="firstName" 
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group rd">
          <label htmlFor="lastName">Last name</label>
          <input 
            type="text" 
            id="lastName"
            name="lastName" 
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group rd">
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
        <div className="form-group rd">
          <label htmlFor="phone">Phone</label>
          <input 
            type="tel" 
            id="phone"
            name="phone" 
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group full-width">
          <label htmlFor="message">Message</label>
          <textarea 
            id="message"
            name="message" 
            value={formData.message}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary">Send Message</button>
    </form>
  );
};

export default ContactForm;