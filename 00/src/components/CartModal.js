// src/components/CartModal.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/CartModal.css';

const CartModal = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart, stockError, clearStockError } = useCart();
  
  if (!isOpen) return null;
  
  const handleQuantityChange = (productId, newQuantity, stockQuantity) => {
    updateQuantity(productId, newQuantity, stockQuantity);
  };

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/products" className="btn-primary" onClick={onClose}>Shop Now</Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.title} />
                  <div className="cart-item-details">
                    <h3>{item.title}</h3>
                    <p>UGX {item.price.toLocaleString()}</p>
                    <div className="stock-info">
                      Stock: {item.stock_quantity} available
                    </div>
                    <div className="quantity-controls">
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.stock_quantity)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.stock_quantity)}
                        disabled={item.quantity >= item.stock_quantity}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button 
                    className="remove-btn" 
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            
            {/* Display stock error if any */}
            {stockError && (
              <div className="cart-stock-error">
                <p>{stockError.message}</p>
                <button onClick={clearStockError} className="close-error-btn">×</button>
              </div>
            )}
            
            <div className="cart-footer">
              <div className="cart-total">
                <h3>Total: UGX {cartTotal.toLocaleString()}</h3>
              </div>
              <div className="cart-actions">
                <button className="btn-secondary" onClick={clearCart}>Clear Cart</button>
                <Link to="/order" className="btn-primary" onClick={onClose}>Proceed to Checkout</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;