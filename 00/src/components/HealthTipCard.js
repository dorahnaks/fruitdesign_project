// src/components/HealthTipCard.js
import React from 'react';
import PropTypes from 'prop-types';

const HealthTipCard = React.memo(({ title, description, icon, color, onClick }) => {
  return (
    <article 
      className="health-tip-card" 
      onClick={onClick}
      tabIndex="0"
      aria-label={`Health tip about ${title}`}
    >
      <div className="tip-icon-container">
        <div className="tip-icon">{icon}</div>
      </div>
      <div className="tip-content">
        <h3>{title}</h3>
        <p>{description}</p>
        <span className="category-tag">{title.toLowerCase().includes('juice') ? 'Juice' : 'Fruit'}</span>
      </div>
    </article>
  );
});

HealthTipCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  onClick: PropTypes.func
};

export default HealthTipCard;