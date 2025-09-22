// src/components/Header.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom'; // Import NavLink and useNavigate
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';
import logo from '../images/logo.jpg';

const Header = () => {
  const { cart, isCartOpen, setIsCartOpen } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate(); // Use navigate instead of window.location
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  
  // Add separate state for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const cartDropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  
  // Calculate total cart value
  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Redirect to login page with checkout as return path
      navigate('/login?checkout=true');
    } else {
      // User is authenticated, proceed to checkout
      navigate('/checkout');
    }
  };
  
  const handleProfileClick = () => {
    if (!isAuthenticated) {
      // Redirect to login page
      navigate('/login');
    } else {
      // Toggle user menu
      setIsUserMenuOpen(!isUserMenuOpen);
    }
  };
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Cart dropdown
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target) && 
          !event.target.closest('.cart-icon')) {
        setIsCartOpen(false);
      }
      
      // User menu dropdown
      if (userMenuRef.current && !userMenuRef.current.contains(event.target) && 
          !event.target.closest('.profile-icon')) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsCartOpen]);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);
  
  // Safely get user's display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    
    // Try to get name from user object
    if (user.name) {
      return user.name.split(' ')[0]; // Get first name
    }
    
    // Fallback to email if name is not available
    if (user.email) {
      return user.email.split('@')[0]; // Get part before @
    }
    
    return 'User'; // Final fallback
  };
  
  return (
    <header className="header">
      <div className="logo-container">
        <img src={logo} alt="Fruit Logo" />
        <span className="brand-name">FruitDesign</span>
      </div>
      
      {/* Navigation menu */}
      <nav className={isMobileMenuOpen ? 'mobile-menu active' : ''}>
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Home
        </NavLink>
        <NavLink 
          to="/about" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          About Us
        </NavLink>
        <NavLink 
          to="/products" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Products
        </NavLink>
        <NavLink 
          to="/contact" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Contact Us
        </NavLink>
      </nav>
      
      <div className="header-actions">
        {/* Cart section */}
        <div className="cart-section">
          <div className="cart-icon" onClick={() => setIsCartOpen(!isCartOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartItemCount > 0 && (
              <span className="cart-count">{cartItemCount}</span>
            )}
          </div>
          
          {/* Cart Dropdown */}
          <div ref={cartDropdownRef} className={`cart-dropdown ${isCartOpen ? 'active' : ''}`}>
            <div className="cart-dropdown-header">
              <h3>Your Cart</h3>
              <button className="close-cart" onClick={() => setIsCartOpen(false)}>×</button>
            </div>
            
            {cartItemCount === 0 ? (
              <div className="empty-cart-message">
                <p>Your cart is empty</p>
                <Link to="/products" className="checkout-dropdown-btn" onClick={() => setIsCartOpen(false)}>
                  Shop Now
                </Link>
              </div>
            ) : (
              <>
                <div className="cart-dropdown-items">
                  {cart.slice(0, 3).map(item => (
                    <div key={item.id} className="cart-dropdown-item">
                      <img src={item.image} alt={item.title} />
                      <div className="cart-item-info">
                        <h4>{item.title}</h4>
                        <p>Qty: {item.quantity}</p>
                      </div>
                      <div className="cart-item-price">
                        UGX {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {cartItemCount > 3 && (
                    <div className="cart-dropdown-item">
                      <div className="cart-item-info">
                        <h4>+{cartItemCount - 3} more items</h4>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="cart-dropdown-footer">
                  <div className="cart-total">
                    <span>Total:</span>
                    <span>UGX {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="cart-dropdown-actions">
                    <Link to="/cart" className="view-cart-btn" onClick={() => setIsCartOpen(false)}>
                      View Cart
                    </Link>
                    <button className="checkout-dropdown-btn" onClick={handleCheckout}>
                      Checkout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {cartItemCount > 0 && (
            <div className="checkout-button-container">
              <button 
                className="checkout-btn" 
                onClick={handleCheckout}
              >
                Checkout
              </button>
            </div>
          )}
        </div>
        
        {/* User section */}
        <div className="user-section">
          {isAuthenticated ? (
            <div className="user-profile" ref={userMenuRef}>
              <div className="profile-icon" onClick={handleProfileClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className={`user-menu ${isUserMenuOpen ? 'active' : ''}`}>
                <span>Welcome, {getUserDisplayName()}</span>
                <Link to="/account" className="account-link" onClick={() => setIsUserMenuOpen(false)}>
                  My Account
                </Link>
                {/* Add admin dashboard link for admin users */}
                {(user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'super_admin') && (
                  <Link to="/admin/dashboard" className="account-link" onClick={() => setIsUserMenuOpen(false)}>
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={() => { logout(); setIsUserMenuOpen(false); }} className="logout-btn">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-icon" onClick={handleProfileClick}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          )}
        </div>
        
        {/* Mobile menu button */}
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
};

export default Header;