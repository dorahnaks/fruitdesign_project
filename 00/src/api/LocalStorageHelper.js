// Local Storage Helper
export const storage = {
  // Get item from local storage
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  },
  
  // Set item to local storage
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting item to storage:', error);
    }
  },
  
  // Remove item from local storage
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  },
  
  // Clear all items from local storage
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
  
  // Authentication helpers
  auth: {
    // Get token
    getToken: () => {
      return storage.get('token');
    },
    
    // Set token
    setToken: (token) => {
      storage.set('token', token);
    },
    
    // Remove token
    removeToken: () => {
      storage.remove('token');
    },
    
    // Get refresh token
    getRefreshToken: () => {
      return storage.get('refreshToken');
    },
    
    // Set refresh token
    setRefreshToken: (token) => {
      storage.set('refreshToken', token);
    },
    
    // Remove refresh token
    removeRefreshToken: () => {
      storage.remove('refreshToken');
    },
    
    // Get user data
    getUser: () => {
      return storage.get('user');
    },
    
    // Set user data
    setUser: (user) => {
      storage.set('user', user);
    },
    
    // Remove user data
    removeUser: () => {
      storage.remove('user');
    },
    
    // Check if user is authenticated
    isAuthenticated: () => {
      const token = storage.auth.getToken();
      return !!token;
    },
    
    // Get user role
    getUserRole: () => {
      const user = storage.auth.getUser();
      return user ? user.role : null;
    },
    
    // Check if user is admin
    isAdmin: () => {
      const role = storage.auth.getUserRole();
      return role === 'admin' || role === 'superadmin';
    },
    
    // Check if user is superadmin
    isSuperAdmin: () => {
      const role = storage.auth.getUserRole();
      return role === 'superadmin';
    },
    
    // Check if user is customer
    isCustomer: () => {
      const role = storage.auth.getUserRole();
      return role === 'customer';
    },
    
    // Get user ID
    getUserId: () => {
      const user = storage.auth.getUser();
      return user ? user.id : null;
    },
    
    // Clear all auth data
    clearAuth: () => {
      storage.auth.removeToken();
      storage.auth.removeRefreshToken();
      storage.auth.removeUser();
    }
  },
  
  // Cart helpers
  cart: {
    // Get cart
    getCart: () => {
      return storage.get('cart') || [];
    },
    
    // Set cart
    setCart: (cart) => {
      storage.set('cart', cart);
    },
    
    // Add item to cart
    addItem: (item) => {
      const cart = storage.cart.getCart();
      const existingItem = cart.find(i => i.productId === item.productId);
      
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        cart.push(item);
      }
      
      storage.cart.setCart(cart);
      return cart;
    },
    
    // Remove item from cart
    removeItem: (productId) => {
      let cart = storage.cart.getCart();
      cart = cart.filter(item => item.productId !== productId);
      storage.cart.setCart(cart);
      return cart;
    },
    
    // Update item quantity
    updateQuantity: (productId, quantity) => {
      const cart = storage.cart.getCart();
      const item = cart.find(i => i.productId === productId);
      
      if (item) {
        item.quantity = quantity;
        storage.cart.setCart(cart);
      }
      
      return cart;
    },
    
    // Clear cart
    clearCart: () => {
      storage.cart.setCart([]);
    },
    
    // Get cart total
    getTotal: () => {
      const cart = storage.cart.getCart();
      return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    // Get cart item count
    getItemCount: () => {
      const cart = storage.cart.getCart();
      return cart.reduce((count, item) => count + item.quantity, 0);
    }
  },
  
  // Preferences helpers
  preferences: {
    // Get preferences
    get: () => {
      return storage.get('preferences') || {};
    },
    
    // Set preferences
    set: (preferences) => {
      storage.set('preferences', preferences);
    },
    
    // Get theme
    getTheme: () => {
      const preferences = storage.preferences.get();
      return preferences.theme || 'light';
    },
    
    // Set theme
    setTheme: (theme) => {
      const preferences = storage.preferences.get();
      preferences.theme = theme;
      storage.preferences.set(preferences);
    },
    
    // Get language
    getLanguage: () => {
      const preferences = storage.preferences.get();
      return preferences.language || 'en';
    },
    
    // Set language
    setLanguage: (language) => {
      const preferences = storage.preferences.get();
      preferences.language = language;
      storage.preferences.set(preferences);
    },
    
    // Get currency
    getCurrency: () => {
      const preferences = storage.preferences.get();
      return preferences.currency || 'USD';
    },
    
    // Set currency
    setCurrency: (currency) => {
      const preferences = storage.preferences.get();
      preferences.currency = currency;
      storage.preferences.set(preferences);
    }
  },
  
  // Cache helpers
  cache: {
    // Get cached data
    get: (key) => {
      const cache = storage.get('cache') || {};
      const item = cache[key];
      
      if (item && item.expiry > Date.now()) {
        return item.data;
      }
      
      return null;
    },
    
    // Set cached data
    set: (key, data, ttl = 3600000) => { // Default TTL: 1 hour
      const cache = storage.get('cache') || {};
      cache[key] = {
        data,
        expiry: Date.now() + ttl
      };
      storage.set('cache', cache);
    },
    
    // Remove cached data
    remove: (key) => {
      const cache = storage.get('cache') || {};
      delete cache[key];
      storage.set('cache', cache);
    },
    
    // Clear all cache
    clear: () => {
      storage.remove('cache');
    },
    
    // Clear expired cache
    clearExpired: () => {
      const cache = storage.get('cache') || {};
      const now = Date.now();
      
      Object.keys(cache).forEach(key => {
        if (cache[key].expiry <= now) {
          delete cache[key];
        }
      });
      
      storage.set('cache', cache);
    }
  },
  
  // Session helpers
  session: {
    // Get session data
    get: () => {
      return storage.get('session') || {};
    },
    
    // Set session data
    set: (session) => {
      storage.set('session', session);
    },
    
    // Get session ID
    getId: () => {
      const session = storage.session.get();
      return session.id;
    },
    
    // Set session ID
    setId: (id) => {
      const session = storage.session.get();
      session.id = id;
      storage.session.set(session);
    },
    
    // Get session expiry
    getExpiry: () => {
      const session = storage.session.get();
      return session.expiry;
    },
    
    // Set session expiry
    setExpiry: (expiry) => {
      const session = storage.session.get();
      session.expiry = expiry;
      storage.session.set(session);
    },
    
    // Check if session is expired
    isExpired: () => {
      const expiry = storage.session.getExpiry();
      return expiry ? expiry <= Date.now() : true;
    },
    
    // Clear session
    clear: () => {
      storage.remove('session');
    }
  },
  
  // Utility helpers
  utils: {
    // Check if local storage is available
    isAvailable: () => {
      try {
        const testKey = '__test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        return false;
      }
    },
    
    // Get storage usage
    getUsage: () => {
      if (!storage.utils.isAvailable()) {
        return { used: 0, total: 0, percentage: 0 };
      }
      
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += (localStorage[key].length + key.length) * 2;
        }
      }
      
      // Local storage limit is usually 5MB
      const totalBytes = 5 * 1024 * 1024;
      const percentage = (total / totalBytes) * 100;
      
      return {
        used: total,
        total: totalBytes,
        percentage: percentage
      };
    },
    
    // Compress data before storing
    compress: (data) => {
      try {
        const json = JSON.stringify(data);
        return btoa(json);
      } catch (e) {
        console.error('Error compressing data:', e);
        return JSON.stringify(data);
      }
    },
    
    // Decompress data after retrieving
    decompress: (compressed) => {
      try {
        const json = atob(compressed);
        return JSON.parse(json);
      } catch (e) {
        console.error('Error decompressing data:', e);
        try {
          return JSON.parse(compressed);
        } catch (e2) {
          console.error('Error parsing as JSON:', e2);
          return null;
        }
      }
    }
  }
};

// Auto-clear expired cache on load
if (typeof window !== 'undefined') {
  storage.cache.clearExpired();
}

export default storage;