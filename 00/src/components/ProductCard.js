// src/components/ProductCard.js
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/ProductForm.css';

const ProductCard = ({ id, title, description, price, category, image, stock_quantity }) => {
  const { addToCart, stockError, clearStockError } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showStockError, setShowStockError] = useState(false);
  
  // Handle undefined price with a default value
  const displayPrice = price || 0;
  
  // Debug function to log when buttons are clicked
  const debugLog = (message) => {
    console.log(`ProductCard [${title}]: ${message}`);
  };
  
  // Clear stock error when component unmounts
  useEffect(() => {
    return () => {
      if (stockError && stockError.productId === id) {
        clearStockError();
      }
    };
  }, [id, stockError, clearStockError]);
  
  // Check if there's a stock error for this product
  useEffect(() => {
    if (stockError && stockError.productId === id) {
      setShowStockError(true);
    } else if (showStockError) {
      setShowStockError(false);
    }
  }, [stockError, id, showStockError]);
  
  const handleAddToCart = () => {
    debugLog(`Add to cart clicked, stock: ${stock_quantity}`);
    
    if (stock_quantity <= 0) return;
    
    // Clear any existing stock error for this product
    if (stockError && stockError.productId === id) {
      clearStockError();
    }
    
    setIsAdding(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      addToCart({
        id,
        title,
        price: displayPrice,
        stock_quantity,
        image
      }, 1); // Always add 1 item
      
      setIsAdding(false);
      setShowNotification(true);
      
      // Hide notification after 2 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 2000);
    }, 300);
  };

  const isOutOfStock = stock_quantity <= 0;
  const isLowStock = stock_quantity > 0 && stock_quantity <= 5;
  
  return (
    <div className="product-card">
      <div className="product-image">
        <img 
          src={image || '/images/product-placeholder.jpg'} 
          alt={title || 'Product'} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/product-placeholder.jpg';
          }}
        />
        <div className="product-category">{category || 'Uncategorized'}</div>
        
        {/* Stock status badges */}
        {isOutOfStock && (
          <div className="out-of-stock-badge">Out of Stock</div>
        )}
        {isLowStock && !isOutOfStock && (
          <div className="low-stock-badge">Only {stock_quantity} left!</div>
        )}
      </div>
      
      <div className="product-details">
        <h3 className="product-title">{title || 'Product Name'}</h3>
        <p className="product-description">{description || 'No description available.'}</p>
        
        {/* Stock error message */}
        {showStockError && stockError && (
          <div className="stock-error-message">
            {stockError.message || "This item has limited stock availability."}
          </div>
        )}
        
        <div className="product-footer">
          <span className="product-price">
            UGX {displayPrice.toLocaleString()}
          </span>
          <button 
            className={`add-to-cart-btn ${isOutOfStock ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            type="button"
          >
            {isAdding ? 'Adding...' : (isOutOfStock ? 'Out of Stock' : 'Add to Cart')}
          </button>
        </div>
      </div>
      
      {showNotification && (
        <div className="notification">
          <span className="notification-text">Added to cart!</span>
        </div>
      )}
    </div>
  );
};

export default ProductCard;