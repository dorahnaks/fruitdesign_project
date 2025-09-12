import React, { useState } from 'react';
import '../styles/About.css';
import { FaLeaf, FaHeartbeat, FaAward, FaUsers, FaHandshake } from 'react-icons/fa';

// Import local images
import farmImage from '../images/apple_order_page.jpg';
import juiceBarImage from '../images/bottle_jui.jpg';
import teamMember1 from '../images/nutri.jpg';
import teamMember2 from '../images/nutttt.jpg';
import teamMember3 from '../images/manager.jpg';


const About = () => {
  // Static company information
  const [companyInfo] = useState({
    story: 'Founded in 2019, our journey began with a simple mission: to bring the freshest, most nutritious fruits and juices to our community. What started as a small local stand has grown into a beloved brand that sources directly from sustainable farms and delivers nature\'s goodness with passion.',
    mission: 'To nourish our community with the highest quality, sustainably sourced fruits and juices while supporting local farmers and promoting healthy lifestyles.',
    values: 'Sustainability, Health, Quality, Community, Integrity'
  });

  // Static team members data
  const [teamMembers] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      bio: 'With a background in nutrition and sustainable agriculture, Sarah founded our company to bridge the gap between local farms and health-conscious consumers.',
      image_url: teamMember1,
      linkedin_url: 'https://linkedin.com/in/sarahjohnson',
      twitter_url: 'https://twitter.com/sarahjohnson'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Head of Operations',
      bio: 'Michael ensures our supply chain runs smoothly, maintaining our commitment to freshness from farm to table.',
      image_url: teamMember2,
      linkedin_url: 'https://linkedin.com/in/michaelchen',
      twitter_url: null
    },
    {
      id: 3,
      name: 'Aisha Williams',
      role: 'Product Development',
      bio: 'Aisha creates our innovative juice blends and fruit products, always focusing on nutrition and taste.',
      image_url: teamMember3,
      linkedin_url: null,
      twitter_url: 'https://twitter.com/aishawilliams'
    }
  ]);

  // Static statistics data
  const [stats] = useState([
    { id: 1, value: '50+', label: 'Local Farms' },
    { id: 2, value: '100K+', label: 'Happy Customers' },
    { id: 3, value: '25+', label: 'Juice Varieties' },
    { id: 4, value: '5', label: 'Years of Excellence' }
  ]);

  return (
    <div className="about-container">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="hero-overlay">
          <h1>Our Fresh Journey Since 2019</h1>
          <p>Nature's goodness, delivered with passion</p>
        </div>
      </div>
      
      <div className="about-content">
        <div className="about-text">
          <div className="section-badge">Our Story</div>
          <h2>From Seed to Sip</h2>
          <p>{companyInfo.story}</p>
          
          <div className="section-badge">Our Mission</div>
          <h2>Nourishing Communities</h2>
          <p>{companyInfo.mission}</p>
          
          <div className="section-badge">Our Values</div>
          <h2>What We Stand For</h2>
          <div className="values-grid">
            {companyInfo.values.split(', ').map((value, index) => (
              <div key={index} className="value-item">
                {index === 0 && <FaLeaf className="value-icon" />}
                {index === 1 && <FaHeartbeat className="value-icon" />}
                {index === 2 && <FaAward className="value-icon" />}
                {index === 3 && <FaUsers className="value-icon" />}
                {index === 4 && <FaHandshake className="value-icon" />}
                <div>
                  <h3>{value}</h3>
                  <p>Description for {value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="about-images">
          <div className="image-card">
            <img 
              src={farmImage} 
              alt="Our fruit farm" 
              className="about-image"
            />
            <div className="image-caption">
              <h3>Local Partner Farms</h3>
              <p>Working directly with sustainable growers</p>
            </div>
          </div>
          
          <div className="image-card">
            <img 
              src={juiceBarImage} 
              alt="Our juice bar" 
              className="about-image"
            />
            <div className="image-caption">
              <h3>Our Flagship Juice Bar</h3>
              <p>Where freshness meets community</p>
            </div>
          </div>
          
          <div className="stats-card">
            {stats.map(stat => (
              <div key={stat.id} className="stat-item">
                <div className="stat-number">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="team-section">
        <div className="section-badge">Our Team</div>
        <h2>Meet the Fruit Lovers</h2>
        <p className="team-intro">Passionate individuals dedicated to bringing you nature's best</p>
        
        <div className="team-grid">
          {teamMembers.map(member => (
            <div key={member.id} className="team-member">
              <div className="member-photo-container">
                <img 
                  src={member.image_url} 
                  alt={member.name} 
                  className="team-photo"
                />
                <div className="member-social">
                  {member.linkedin_url && (
                    <a href={member.linkedin_url} className="social-link" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  )}
                  {member.twitter_url && (
                    <a href={member.twitter_url} className="social-link" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-twitter"></i>
                    </a>
                  )}
                </div>
              </div>
              <h3>{member.name}</h3>
              <p className="member-role">{member.role}</p>
              <p className="member-bio">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="cta-section">
        <div className="cta-content">
          <h2>Experience the Fresh Difference</h2>
          <p>Join thousands of satisfied customers who have made our juices and fruits part of their healthy lifestyle since 2019.</p>
          <a href="/products" className="cta-button">Shop Our Products</a>
        </div>
      </div>
    </div>
  );
};

export default About;