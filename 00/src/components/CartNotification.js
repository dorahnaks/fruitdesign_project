// src/components/CartNotification.js
import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/CartNotification.css';

const CartNotification = () => {
  const { lastAddedItem } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (lastAddedItem) {
      setMessage(`${lastAddedItem.title} added to cart!`);
      setIsVisible(true);
      
      // Hide notification after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [lastAddedItem]);

  if (!isVisible) return null;

  return (
    <div className={`cart-notification ${isVisible ? 'show' : ''}`}>
      <div className="notification-content">
        <span className="notification-icon">✓</span>
        <span className="notification-message">{message}</span>
      </div>
    </div>
  );
};

export default CartNotification;