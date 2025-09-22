// src/components/Cart.js
import React from 'react';
import { useCart } from '../context/CartContext';
import '../styles/Cart.css';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { 
    cart, 
    clearCart, 
    removeFromCart, 
    updateCartItem, 
    stockError, 
    clearStockError 
  } = useCart();
  
  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <h2>Your Shopping Cart</h2>
        <div className="empty-cart-message">
          <p>Your cart is empty. Add some products to get started!</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }
  
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const handleQuantityChange = (productId, newQuantity, stockQuantity) => {
    if (newQuantity >= 1 && newQuantity <= stockQuantity) {
      updateCartItem(productId, newQuantity, stockQuantity);
    }
  };
  
  const handleCheckout = () => {
    // Navigate to checkout page
    window.location.href = '/checkout';
  };
  
  return (
    <div className="cart-container">
      <h2>Your Shopping Cart</h2>
      
      {/* Display stock error if any */}
      {stockError && (
        <div className="cart-stock-error">
          <p>{stockError.message}</p>
          <button onClick={clearStockError} className="close-error-btn">×</button>
        </div>
      )}
      
      <div className="cart-items">
        {cart.map(item => {
          // Determine stock status
          let stockClass = '';
          let stockText = '';
          
          if (item.stock_quantity === 0) {
            stockClass = 'out-of-stock';
            stockText = 'Out of stock';
          } else if (item.stock_quantity <= 5) {
            stockClass = 'low-stock';
            stockText = `Only ${item.stock_quantity} left in stock`;
          } else {
            stockText = `${item.stock_quantity} available in stock`;
          }
          
          return (
            <div key={item.id} className="cart-item">
              {/* Add product image */}
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="item-image"
                />
              )}
              <div className="item-info">
                <h3>{item.title}</h3>
                <p>UGX {item.price.toLocaleString()} each</p>
                <div className={`stock-info ${stockClass}`}>
                  {stockText}
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
              <div className="item-total">
                UGX {(item.price * item.quantity).toLocaleString()}
              </div>
              <button 
                className="remove-btn"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>
      
      <div className="cart-summary">
        <h3>Total: UGX {total.toLocaleString()}</h3>
        <div className="cart-actions">
          <button className="clear-btn" onClick={clearCart}>Clear Cart</button>
          <button className="checkout-btn" onClick={handleCheckout}>Proceed to Checkout</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;