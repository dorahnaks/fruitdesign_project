// src/pages/Order.js
import React, { useState } from 'react'; // Remove useEffect from here
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Order.css';

// Import your product images
import appleImage from '../images/apple_order_page.jpg';
import bananaImage from '../images/b_order_pg.jpg';
import orangeImage from '../images/oranges_pdt_pg.jpg';
import orangeJuiceImage from '../images/orange_juice_home.png';
import pineappleJuiceImage from '../images/jui_order_pg.jpg';
import beetrootJuiceImage from '../images/beetroot juice_order_pg.jpg';

const Order = () => {
  const { cart, clearCart, addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Sample products data
  const products = [
    {
      id: 1,
      title: "Crisp Apples",
      description: "Perfect for snacking",
      price: 5000,
      category: "Fruits",
      image: appleImage
    },
    {
      id: 2,
      title: "Sweet Bananas",
      description: "Great for juices",
      price: 3000,
      category: "Fruits",
      image: bananaImage
    },
    {
      id: 3,
      title: "Juicy Oranges",
      description: "A healthy treat",
      price: 4500,
      category: "Fruits",
      image: orangeImage
    },
    {
      id: 4,
      title: "Orange Juice",
      description: "Freshly squeezed oranges",
      price: 7000,
      category: "Juices",
      image: orangeJuiceImage
    },
    {
      id: 5,
      title: "Pineapple Juice",
      description: "Made using the best",
      price: 8000,
      category: "Juices",
      image: pineappleJuiceImage
    },
    {
      id: 6,
      title: "Beetroot Juice",
      description: "Great for your health",
      price: 6500,
      category: "Juices",
      image: beetrootJuiceImage
    }
  ];

  const categories = ['All', 'Fruits', 'Juices'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCheckout = () => {
    if (isLoggedIn) {
      // Proceed with order
      alert('Order placed successfully!');
      clearCart();
    } else {
      setShowLoginPrompt(true);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLoginPrompt(false);
  };

  return (
    <div className="order-container">
 

      <h1>Place Your Order</h1>
      
      {showLoginPrompt && (
        <div className="login-prompt">
          <p>Please login to place an order</p>
          <Link to="/login" className="btn-primary" onClick={handleLogin}>Login</Link>
        </div>
      )}

      <div className="order-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="category-filter">
          <label>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="order-products">
        {filteredProducts.map(product => (
          <div key={product.id} className="order-product-card">
            <img src={product.image} alt={product.title} />
            <h3>{product.title}</h3>
            <p>{product.description}</p>
            <p className="price">UGX {product.price.toLocaleString()}</p>
            <button 
              className="add-to-cart-btn"
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </button>
          </div>
          
        ))}
      </div>
           {/* Order Summary moved to the top */}
      {cart.length > 0 && (
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="summary-item">
                <span>{item.title} x {item.quantity}</span>
                <span>UGX {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="total">
            <h3>Total: UGX {cart.reduce((total, item) => total + item.price * item.quantity, 0).toLocaleString()}</h3>
          </div>
          <button className="btn-primary" onClick={handleCheckout}>Place Order</button>
        </div>
      )}
    </div>
  );
};

export default Order;