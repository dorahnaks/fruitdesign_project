// src/pages/OrderConfirmation.js
import React from 'react';
import { useCart } from '../context/CartContext';
import '../styles/OrderConfirmation.css';

const OrderConfirmation = () => {
  const { cart, clearCart } = useCart();
  
  // Calculate order details
  const orderNumber = Math.floor(100000 + Math.random() * 900000);
  const orderDate = new Date().toLocaleDateString();
  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="order-confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <h1>Order Confirmed! 🎉</h1>
          <p>Thank you for your purchase.</p>
        </div>
        
        <div className="order-details">
          <div className="order-info">
            <h2>Order Information</h2>
            <p><strong>Order Number:</strong> #{orderNumber}</p>
            <p><strong>Order Date:</strong> {orderDate}</p>
            <p><strong>Total Amount:</strong> UGX {totalAmount.toLocaleString()}</p>
          </div>
          
          <div className="delivery-info">
            <h2>Delivery Information</h2>
            <p>We'll send your order to the address you provided during checkout.</p>
            <p>Estimated delivery time: 2-3 business days.</p>
          </div>
        </div>
        
        <div className="order-items">
          <h2>Order Items</h2>
          {cart.map(item => (
            <div key={item.id} className="order-item">
              <div className="item-info">
                <h3>{item.title}</h3>
                <p>UGX {item.price.toLocaleString()} x {item.quantity}</p>
              </div>
              <div className="item-total">
                UGX {(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        
        <div className="action-buttons">
          <button className="btn-primary" onClick={() => window.location.href = '/products'}>
            Continue Shopping
          </button>
          <button className="btn-outline" onClick={() => window.location.href = '/account'}>
            View Order History
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;