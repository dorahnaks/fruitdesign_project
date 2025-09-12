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
    updateCartItem, // Use the correct function name from context
    stockError, 
    clearStockError 
  } = useCart();
  
  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <h2>Your Cart</h2>
        <p>Your cart is empty. Add some products to get started!</p>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }
  
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const handleQuantityChange = (productId, newQuantity, stockQuantity) => {
    // Use the correct function name from context
    updateCartItem(productId, newQuantity, stockQuantity);
  };
  
  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      
      {/* Display stock error if any */}
      {stockError && (
        <div className="cart-stock-error">
          <p>{stockError.message}</p>
          <button onClick={clearStockError} className="close-error-btn">×</button>
        </div>
      )}
      
      <div className="cart-items">
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <div className="item-info">
              <h3>{item.title}</h3>
              <p>UGX {item.price.toLocaleString()} each</p>
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
        ))}
      </div>
      
      <div className="cart-summary">
        <h3>Total: UGX {total.toLocaleString()}</h3>
        <div className="cart-actions">
          <button className="clear-btn" onClick={clearCart}>Clear Cart</button>
          <button className="checkout-btn">Proceed to Checkout</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;