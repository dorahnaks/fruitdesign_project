import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import ProductCard from '../components/ProductCard';
import { FaLeaf, FaHeartbeat, FaBolt } from 'react-icons/fa';

const Home = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/home/best-sellers')
      .then(response => response.json())
      .then(data => {
        setBestSellers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching best sellers:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <h1>Taste the Freshness</h1>
        <p>Discover a wide selection of fresh fruits and delicious juices, crafted with care and bursting with flavour</p>
        <Link to="/products" className="order-btn">Order now</Link>
      </section>
      
      {/* Best Sellers */}
      <section className="best-sellers">
        <h2>Best Sellers</h2>
        <div className="products-grid">
          {bestSellers.map(seller => (
            <ProductCard 
              key={seller.id}
              image={seller.product.image_url}
              title={seller.product.name} 
              description={seller.product.description} 
              price={seller.product.price}
            />
          ))}
        </div>
      </section>
      
      {/* Health Benefits */}
      <section className="health-benefits">
        <h2>Why Choose Fruit Design?</h2>
        <p>Our commitment to quality ensures that you receive fresh and nutritious products straight from the farm to your table.</p>
        <div className="benefits-grid">
          <div className="benefit-card">
            <FaHeartbeat className="benefit-icon" />
            <div className="benefit-text">
              <h3>Boost Your Immunity</h3>
              <p>Our fruits and juices are packed with vitamins and antioxidants to support your immune system.</p>
            </div>
          </div>
          <div className="benefit-card">
            <FaLeaf className="benefit-icon" />
            <div className="benefit-text">
              <h3>Natural Goodness</h3>
              <p>Enjoy natural flavours and nutrients without any artificial additives or preservatives.</p>
            </div>
          </div>
          <div className="benefit-card">
            <FaBolt className="benefit-icon" />
            <div className="benefit-text">
              <h3>Energy Boost</h3>
              <p>Get a natural energy boost with our refreshing fruits and juices, perfect for any time of the day.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Explore Offerings */}
      <section className="explore-offerings">
        <h2>Explore Our Offerings</h2>
        <p>Discover a wide range of fruits and juices we offer, each with its unique taste and health benefit.</p>
        <Link to="/health-tips" className="learn-more-btn">Learn More</Link>
      </section>
    </div>
  );
};

export default Home;