// src/utils/storage.js
// Create a proper storage utility with all cart methods
export const storage = {
  // Authentication helpers
  auth: {
    getToken: () => {
      try {
        const token = localStorage.getItem('token');
        return token || null; // Return as plain string, not JSON
      } catch (error) {
        console.error('Error getting token:', error);
        return null;
      }
    },
    
    setToken: (token) => {
      try {
        localStorage.setItem('token', token); // Store as plain string
      } catch (error) {
        console.error('Error setting token:', error);
      }
    },
    
    getRefreshToken: () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        return refreshToken || null; // Return as plain string, not JSON
      } catch (error) {
        console.error('Error getting refresh token:', error);
        return null;
      }
    },
    
    setRefreshToken: (token) => {
      try {
        localStorage.setItem('refreshToken', token); // Store as plain string
      } catch (error) {
        console.error('Error setting refresh token:', error);
      }
    },
    
    getUser: () => {
      try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
      } catch (error) {
        console.error('Error getting user:', error);
        return null;
      }
    },
    
    setUser: (user) => {
      try {
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Error setting user:', error);
      }
    },
    
    clearAuth: () => {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } catch (error) {
        console.error('Error clearing auth:', error);
      }
    },
    
    isAuthenticated: () => {
      return !!storage.auth.getToken();
    },
    
    getUserRole: () => {
      const user = storage.auth.getUser();
      return user ? user.role : null;
    },
    
    isAdmin: () => {
      const role = storage.auth.getUserRole();
      return role === 'admin' || role === 'superadmin' || role === 'super_admin';
    },
    
    isSuperAdmin: () => {
      const role = storage.auth.getUserRole();
      return role === 'superadmin' || role === 'super_admin';
    },
    
    isCustomer: () => {
      const role = storage.auth.getUserRole();
      return role === 'customer';
    },
    
    getUserId: () => {
      const user = storage.auth.getUser();
      return user ? user.id : null;
    }
  },
  
  // Cart helpers
  cart: {
    getCart: () => {
      try {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
      } catch (error) {
        console.error('Error getting cart:', error);
        return [];
      }
    },
    
    setCart: (cart) => {
      try {
        localStorage.setItem('cart', JSON.stringify(cart));
      } catch (error) {
        console.error('Error setting cart:', error);
      }
    },
    
    addItem: (item) => {
      try {
        const cart = storage.cart.getCart();
        const existingItem = cart.find(i => i.productId === item.productId);
        
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          cart.push(item);
        }
        
        storage.cart.setCart(cart);
        return cart;
      } catch (error) {
        console.error('Error adding item to cart:', error);
        return storage.cart.getCart();
      }
    },
    
    removeItem: (productId) => {
      try {
        let cart = storage.cart.getCart();
        cart = cart.filter(item => item.productId !== productId);
        storage.cart.setCart(cart);
        return cart;
      } catch (error) {
        console.error('Error removing item from cart:', error);
        return storage.cart.getCart();
      }
    },
    
    updateItem: (productId, quantity) => {
      try {
        let cart = storage.cart.getCart();
        const itemIndex = cart.findIndex(item => item.productId === productId);
        
        if (itemIndex !== -1) {
          if (quantity <= 0) {
            cart.splice(itemIndex, 1);
          } else {
            cart[itemIndex].quantity = quantity;
          }
        }
        
        storage.cart.setCart(cart);
        return cart;
      } catch (error) {
        console.error('Error updating cart item:', error);
        return storage.cart.getCart();
      }
    },
    
    clearCart: () => {
      try {
        localStorage.removeItem('cart');
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    },
    
    getTotal: () => {
      try {
        const cart = storage.cart.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      } catch (error) {
        console.error('Error getting cart total:', error);
        return 0;
      }
    },
    
    getItemCount: () => {
      try {
        const cart = storage.cart.getCart();
        return cart.reduce((count, item) => count + item.quantity, 0);
      } catch (error) {
        console.error('Error getting cart item count:', error);
        return 0;
      }
    },
    
    isInCart: (productId) => {
      try {
        const cart = storage.cart.getCart();
        return cart.some(item => item.productId === productId);
      } catch (error) {
        console.error('Error checking if item is in cart:', error);
        return false;
      }
    }
  },
  
  // Preferences helpers
  preferences: {
    get: (key, defaultValue = null) => {
      try {
        const preferences = localStorage.getItem('preferences');
        const prefs = preferences ? JSON.parse(preferences) : {};
        return prefs[key] !== undefined ? prefs[key] : defaultValue;
      } catch (error) {
        console.error('Error getting preference:', error);
        return defaultValue;
      }
    },
    
    set: (key, value) => {
      try {
        let preferences = localStorage.getItem('preferences');
        preferences = preferences ? JSON.parse(preferences) : {};
        preferences[key] = value;
        localStorage.setItem('preferences', JSON.stringify(preferences));
      } catch (error) {
        console.error('Error setting preference:', error);
      }
    },
    
    remove: (key) => {
      try {
        let preferences = localStorage.getItem('preferences');
        preferences = preferences ? JSON.parse(preferences) : {};
        delete preferences[key];
        localStorage.setItem('preferences', JSON.stringify(preferences));
      } catch (error) {
        console.error('Error removing preference:', error);
      }
    },
    
    clear: () => {
      try {
        localStorage.removeItem('preferences');
      } catch (error) {
        console.error('Error clearing preferences:', error);
      }
    }
  },
  
  // Cache helpers
  cache: {
    get: (key) => {
      try {
        const item = localStorage.getItem(`cache_${key}`);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error('Error getting cached item:', error);
        return null;
      }
    },
    
    set: (key, value, ttl = null) => {
      try {
        const item = {
          value,
          timestamp: Date.now(),
          ttl
        };
        localStorage.setItem(`cache_${key}`, JSON.stringify(item));
      } catch (error) {
        console.error('Error setting cached item:', error);
      }
    },
    
    remove: (key) => {
      try {
        localStorage.removeItem(`cache_${key}`);
      } catch (error) {
        console.error('Error removing cached item:', error);
      }
    },
    
    isExpired: (key) => {
      try {
        const item = storage.cache.get(key);
        if (!item || !item.ttl) return false;
        return Date.now() - item.timestamp > item.ttl;
      } catch (error) {
        console.error('Error checking cache expiration:', error);
        return true;
      }
    },
    
    clear: () => {
      try {
        // Remove all cache items
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('cache_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.error('Error clearing cache:', error);
      }
    }
  },
  
  // Session helpers
  session: {
    get: (key) => {
      try {
        return sessionStorage.getItem(key);
      } catch (error) {
        console.error('Error getting session item:', error);
        return null;
      }
    },
    
    set: (key, value) => {
      try {
        sessionStorage.setItem(key, value);
      } catch (error) {
        console.error('Error setting session item:', error);
      }
    },
    
    remove: (key) => {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing session item:', error);
      }
    },
    
    clear: () => {
      try {
        sessionStorage.clear();
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }
  },
  
  // Utility methods
  utils: {
    clearAll: () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (error) {
        console.error('Error clearing all storage:', error);
      }
    },
    
    exportData: () => {
      try {
        const data = {
          localStorage: {},
          sessionStorage: {}
        };
        
        // Export localStorage
        Object.keys(localStorage).forEach(key => {
          try {
            data.localStorage[key] = JSON.parse(localStorage.getItem(key));
          } catch (e) {
            data.localStorage[key] = localStorage.getItem(key);
          }
        });
        
        // Export sessionStorage
        Object.keys(sessionStorage).forEach(key => {
          try {
            data.sessionStorage[key] = JSON.parse(sessionStorage.getItem(key));
          } catch (e) {
            data.sessionStorage[key] = sessionStorage.getItem(key);
          }
        });
        
        return data;
      } catch (error) {
        console.error('Error exporting storage data:', error);
        return null;
      }
    },
    
    importData: (data) => {
      try {
        if (!data) return;
        
        // Import localStorage
        if (data.localStorage) {
          Object.keys(data.localStorage).forEach(key => {
            localStorage.setItem(key, JSON.stringify(data.localStorage[key]));
          });
        }
        
        // Import sessionStorage
        if (data.sessionStorage) {
          Object.keys(data.sessionStorage).forEach(key => {
            sessionStorage.setItem(key, JSON.stringify(data.sessionStorage[key]));
          });
        }
      } catch (error) {
        console.error('Error importing storage data:', error);
      }
    }
  }
};

// Export individual utilities for easier importing
export const { auth, cart, preferences, cache, session, utils } = storage;
export default storage;