// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import cartAPI from '../api/CartAPI'; 

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  // Add these missing state variables
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [stockError, setStockError] = useState(null);
  
  // Initialize cart from storage
  useEffect(() => {
    const initializeCart = () => {
      try {
        const savedCart = storage.cart.getCart();
        setCart(savedCart);
        updateCartInfo(savedCart);
      } catch (error) {
        console.error('Error initializing cart:', error);
      }
    };
    initializeCart();
  }, []);

  // Update cart count and total
  const updateCartInfo = (cartItems) => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    setCartCount(count);
    setCartTotal(totalAmount);
  };

  // Add this function to clear stock errors
  const clearStockError = () => {
    setStockError(null);
  };

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    try {
      setIsLoading(true);
      
      const cartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image_url
      };
      
      // Update local state first
      const updatedCart = storage.cart.addItem(cartItem);
      setCart(updatedCart);
      updateCartInfo(updatedCart);
      
      // Sync with backend if authenticated
      const token = storage.auth.getToken();
      if (token) {
        try {
          await cartAPI.addToCart({ product_id: product.id, quantity }, token);
        } catch (error) {
          console.error('Error syncing cart with backend:', error);
        }
      }
      return updatedCart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      setIsLoading(true);
      
      // Update local state first
      const updatedCart = storage.cart.removeItem(productId);
      setCart(updatedCart);
      updateCartInfo(updatedCart);
      
      // Sync with backend if authenticated
      const token = storage.auth.getToken();
      if (token) {
        try {
          // Find the cart item to get its ID for backend sync
          const cartItem = cart.find(item => item.productId === productId);
          if (cartItem && cartItem.id) {
            await cartAPI.removeCartItem(cartItem.id, token);
          }
        } catch (error) {
          console.error('Error syncing cart removal with backend:', error);
        }
      }
      return updatedCart;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (productId, quantity, stockQuantity) => {
    try {
      setIsLoading(true);
      
      // Check if requested quantity exceeds available stock
      if (quantity > stockQuantity) {
        setStockError({
          message: `Only ${stockQuantity} items available in stock.`
        });
        return cart;
      }
      
      // Update local state first
      const updatedCart = storage.cart.updateItem(productId, quantity);
      setCart(updatedCart);
      updateCartInfo(updatedCart);
      
      // Sync with backend if authenticated
      const token = storage.auth.getToken();
      if (token) {
        try {
          // Find the cart item to get its ID for backend sync
          const cartItem = cart.find(item => item.productId === productId);
          if (cartItem && cartItem.id) {
            await cartAPI.updateCartItem(cartItem.id, quantity, token);
          }
        } catch (error) {
          console.error('Error syncing cart update with backend:', error);
        }
      }
      return updatedCart;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setIsLoading(true);
      
      // Update local state first
      storage.cart.clearCart();
      setCart([]);
      setCartCount(0);
      setCartTotal(0);
      
      // Sync with backend if authenticated
      const token = storage.auth.getToken();
      if (token) {
        try {
          // Get current cart from backend to clear it
          const backendCart = await cartAPI.getCart(token);
          if (backendCart.length > 0) {
            // Remove all items from backend cart
            for (const item of backendCart) {
              await cartAPI.removeCartItem(item.id, token);
            }
          }
        } catch (error) {
          console.error('Error syncing cart clear with backend:', error);
        }
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Load cart from backend
  const loadCartFromBackend = async () => {
    try {
      const token = storage.auth.getToken();
      if (!token) return;
      setIsLoading(true);
      const backendCart = await cartAPI.getCart(token);
      
      // Update local storage and state
      storage.cart.setCart(backendCart);
      setCart(backendCart);
      updateCartInfo(backendCart);
    } catch (error) {
      console.error('Error loading cart from backend:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Checkout
  const checkout = async () => {
    try {
      setIsLoading(true);
      
      const token = storage.auth.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }
      const response = await cartAPI.checkout(token);
      
      // Clear cart after successful checkout
      storage.cart.clearCart();
      setCart([]);
      setCartCount(0);
      setCartTotal(0);
      return response.data;
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    cart,
    cartCount,
    cartTotal,
    isLoading,
    isCartOpen,
    setIsCartOpen,
    stockError,
    addToCart,
    removeFromCart,
    updateCartItem,  // Keep the original function name
    clearCart,
    loadCartFromBackend,
    checkout,
    clearStockError,
    isInCart: (productId) => storage.cart.isInCart(productId)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};