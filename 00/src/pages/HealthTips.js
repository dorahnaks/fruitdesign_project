import React, { useState, useEffect } from 'react';
import HealthTipCard from '../components/HealthTipCard';
import '../styles/HealthTips.css';

const HealthTips = () => {
  const [healthTips, setHealthTips] = useState([]);
  const [quickTips, setQuickTips] = useState([]);
  const [visibleTips, setVisibleTips] = useState(6);
  const [filteredTips, setFilteredTips] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/health-tips'),
      fetch('http://localhost:5000/api/quick-tips')
    ])
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(([healthTipsData, quickTipsData]) => {
      setHealthTips(healthTipsData);
      setFilteredTips(healthTipsData);
      setQuickTips(quickTipsData);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching health tips:', error);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = healthTips;
    
    if (activeCategory !== 'all') {
      result = result.filter(tip => tip.category === activeCategory);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(tip => 
        tip.title.toLowerCase().includes(term) || 
        tip.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredTips(result);
    setVisibleTips(6);
  }, [activeCategory, searchTerm, healthTips]);

  const handleShowMore = () => {
    setVisibleTips(prev => prev + 6);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="health-tips">
      <div className="health-tips-header">
        <h1>Health & Nutrition Tips</h1>
        <p>Discover the amazing benefits of fruits and juices for your health and wellbeing</p>
      </div>
      
      <div className="filter-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search health tips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="category-filters">
          <button 
            className={`filter-button ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            <span>All</span>
          </button>
          <button 
            className={`filter-button ${activeCategory === 'citrus' ? 'active' : ''}`}
            onClick={() => setActiveCategory('citrus')}
          >
            <span>Citrus</span>
          </button>
          <button 
            className={`filter-button ${activeCategory === 'tropical' ? 'active' : ''}`}
            onClick={() => setActiveCategory('tropical')}
          >
            <span>Tropical</span>
          </button>
          <button 
            className={`filter-button ${activeCategory === 'berries' ? 'active' : ''}`}
            onClick={() => setActiveCategory('berries')}
          >
            <span>Berries</span>
          </button>
          <button 
            className={`filter-button ${activeCategory === 'hydrating' ? 'active' : ''}`}
            onClick={() => setActiveCategory('hydrating')}
          >
            <span>Hydrating</span>
          </button>
        </div>
      </div>
      
      <div className="tips-count">
        Showing {Math.min(visibleTips, filteredTips.length)} of {filteredTips.length} tips
      </div>
      
      <div className="tips-container">
        {filteredTips.slice(0, visibleTips).map((tip) => (
          <HealthTipCard
            key={tip.id}
            title={tip.title}
            description={tip.description}
            icon={tip.icon}
            color={tip.color}
            onClick={() => console.log(`Clicked on ${tip.title}`)}
          />
        ))}
      </div>
      
      {visibleTips < filteredTips.length && (
        <div className="show-more-container">
          <button className="show-more-btn" onClick={handleShowMore}>
            Show More Tips
          </button>
        </div>
      )}
      
      <div className="quick-tips-section">
        <h2>Quick Tips</h2>
        <div className="quick-tips-scroll">
          {quickTips.map((tip) => (
            <div key={tip.id} className="quick-tip">
              <div className="quick-tip-icon-container">
                <div className="quick-tip-icon">{tip.icon}</div>
              </div>
              <div className="quick-tip-content">
                <h3>{tip.title}</h3>
                <p>{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthTips;