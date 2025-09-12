// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../api/AuthAPI';

// Storage utility for localStorage operations
const storage = {
  auth: {
    getToken: () => localStorage.getItem('token'),
    setToken: (token) => localStorage.setItem('token', token),
    getRefreshToken: () => localStorage.getItem('refreshToken'),
    setRefreshToken: (refreshToken) => localStorage.setItem('refreshToken', refreshToken),
    getUser: () => {
      const userStr = localStorage.getItem('user');
      try {
        return userStr ? JSON.parse(userStr) : null;
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        return null;
      }
    },
    setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
    getUserRole: () => localStorage.getItem('userRole'),
    setUserRole: (role) => localStorage.setItem('userRole', role),
    getUserId: () => localStorage.getItem('userId'),
    setUserId: (id) => localStorage.setItem('userId', id),
    clearAuth: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
    }
  },
  cart: {
    clearCart: () => localStorage.removeItem('cart')
  },
  preferences: {
    clear: () => localStorage.removeItem('preferences')
  },
  cache: {
    clear: () => {
      // Clear any cached data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      }
    }
  }
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Function to fetch fresh user data from backend
  const fetchUserData = async (token) => {
    try {
      const response = await authAPI.getCurrentUser(token);
      console.log("Fetched fresh user data:", response.data);
      
      // Process the user data to ensure consistent format
      const userData = response.data.user || response.data;
      
      // Ensure user object has required fields
      const processedUser = {
        ...userData,
        // Ensure name field exists
        name: userData.name || 
              `${userData?.firstName || userData?.first_name || ''} ${userData?.lastName || userData?.last_name || ''}`.trim() || 
              userData?.email || 
              'User',
        // Ensure ID field exists
        id: userData.id || userData._id
      };
      
      return processedUser;
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If the endpoint doesn't exist (404), we'll return null and handle it in the calling function
      if (error.response && error.response.status === 404) {
        console.warn('User data endpoint not found (404), using existing user data');
        return null;
      }
      throw error;
    }
  };

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = storage.auth.getToken();
        const storedUser = storage.auth.getUser();
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          
          // Try to fetch fresh user data from backend, but don't fail if it doesn't work
          try {
            const freshUserData = await fetchUserData(storedToken);
            if (freshUserData) {
              setUser(freshUserData);
            } else {
              setUser(storedUser);
            }
            setIsAuthenticated(true);
            console.log("Auth initialized with user data:", freshUserData || storedUser);
          } catch (error) {
            console.error('Failed to fetch fresh user data, using stored data:', error);
            setUser(storedUser);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        storage.auth.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // Handle token refresh
  const handleTokenExpired = async () => {
    try {
      const refreshToken = storage.auth.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await authAPI.refreshToken(refreshToken);
      const { access_token, user } = response.data;
      
      // Update state and storage
      setToken(access_token);
      setUser(user);
      storage.auth.setToken(access_token);
      storage.auth.setUser(user);
      return access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      console.log("Login response:", response);
      
      // Extract data from response
      const { access_token, refresh_token, user, role } = response.data;
      
      // If user is undefined, we can't proceed
      if (!user) {
        console.error('User data not found in response:', response.data);
        throw new Error('User data not received from server');
      }
      
      // Try to fetch fresh user data from backend, but don't fail if it doesn't work
      let freshUserData;
      try {
        freshUserData = await fetchUserData(access_token);
      } catch (error) {
        console.warn('Failed to fetch fresh user data, using login response data:', error);
        freshUserData = null;
      }
      
      // Use fresh data if available, otherwise use the data from login response
      const userData = freshUserData || user;
      
      // Ensure user object has required fields
      const userWithRole = { 
        ...userData, 
        role: role || userData.role || 'customer'
      };
      
      console.log("Processed user data:", userWithRole);
      
      // Update state
      setToken(access_token);
      setUser(userWithRole);
      setIsAuthenticated(true);
      
      // Update storage
      storage.auth.setToken(access_token);
      storage.auth.setRefreshToken(refresh_token);
      storage.auth.setUser(userWithRole);
      storage.auth.setUserRole(userWithRole.role);
      storage.auth.setUserId(userWithRole.id);
      
      // Return user with role for redirection
      return { user: userWithRole, role: userWithRole.role };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.registerCustomer(userData);
      console.log("Registration response:", response);
      
      // Extract data from response
      const { access_token, refresh_token, user, role } = response.data;
      
      // If user is undefined, we can't proceed
      if (!user) {
        console.error('User data not found in response:', response.data);
        throw new Error('User data not received from server');
      }
      
      // Try to fetch fresh user data from backend, but don't fail if it doesn't work
      let freshUserData;
      try {
        freshUserData = await fetchUserData(access_token);
      } catch (error) {
        console.warn('Failed to fetch fresh user data, using registration response data:', error);
        freshUserData = null;
      }
      
      // Use fresh data if available, otherwise use the data from registration response
      const userData = freshUserData || user;
      
      // Ensure user object has required fields
      const userWithName = { 
        ...userData, 
        role: role || userData.role || 'customer'
      };
      
      console.log("Processed user data:", userWithName);
      
      // Update state
      setToken(access_token);
      setUser(userWithName);
      setIsAuthenticated(true);
      
      // Update storage
      storage.auth.setToken(access_token);
      storage.auth.setRefreshToken(refresh_token);
      storage.auth.setUser(userWithName);
      storage.auth.setUserRole(userWithName.role);
      storage.auth.setUserId(userWithName.id);
      
      showNotification('Account created successfully! Welcome to our platform.');
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear storage
    storage.auth.clearAuth();
    storage.cart.clearCart();
    storage.preferences.clear();
    storage.cache.clear();
  };

  const updateUser = async (userData) => {
    try {
      // Ensure we have a valid user object
      if (!user) {
        console.error('Cannot update user: user is null');
        return;
      }
      
      // Try to call API to update user on backend, but don't fail if it doesn't work
      let updatedUserData;
      try {
        const response = await authAPI.updateUser(userData);
        console.log("Update user response:", response);
        
        // Get the updated user data from response
        updatedUserData = response.data.user || response.data;
      } catch (error) {
        console.warn('Failed to update user on backend, updating locally only:', error);
        updatedUserData = userData;
      }
      
      // Create updated user object with all existing properties
      const updatedUser = { 
        ...user, 
        ...updatedUserData,
        // Ensure name field exists
        name: updatedUserData.name || 
              `${updatedUserData?.firstName || updatedUserData?.first_name || ''} ${updatedUserData?.lastName || updatedUserData?.last_name || ''}`.trim() || 
              user.name
      };
      
      // Update state
      setUser(updatedUser);
      
      // Update storage
      storage.auth.setUser(updatedUser);
      
      // Show notification
      showNotification('Profile updated successfully!');
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  // Function to refresh user data from backend
  const refreshUserData = async () => {
    try {
      if (!token) {
        throw new Error('No token available');
      }
      
      const freshUserData = await fetchUserData(token);
      
      if (freshUserData) {
        // Update state
        setUser(freshUserData);
        
        // Update storage
        storage.auth.setUser(freshUserData);
        
        return freshUserData;
      } else {
        // If we couldn't fetch fresh data, return the current user
        return user;
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  };

  // Helper methods
  const isAdmin = () => {
    try {
      if (!user) return false;
      const role = user?.role || storage.auth.getUserRole();
      console.log("Checking admin role:", role);
      return role === 'admin' || role === 'superadmin' || role === 'super_admin';
    } catch (error) {
      console.error('Error in isAdmin:', error);
      return false;
    }
  };

  const isSuperAdmin = () => {
    try {
      if (!user) return false;
      const role = user?.role || storage.auth.getUserRole();
      console.log("Checking superadmin role:", role);
      return role === 'superadmin' || role === 'super_admin';
    } catch (error) {
      console.error('Error in isSuperAdmin:', error);
      return false;
    }
  };

  const isCustomer = () => {
    try {
      if (!user) return false;
      const role = user?.role || storage.auth.getUserRole();
      return role === 'customer';
    } catch (error) {
      console.error('Error in isCustomer:', error);
      return false;
    }
  };

  const getUserId = () => {
    try {
      return user?.id || user?._id || storage.auth.getUserId();
    } catch (error) {
      console.error('Error in getUserId:', error);
      return null;
    }
  };

  const getUserRole = () => {
    try {
      return user?.role || storage.auth.getUserRole();
    } catch (error) {
      console.error('Error in getUserRole:', error);
      return null;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    notification,
    showNotification,
    login,
    register,
    logout,
    updateUser,
    refreshUserData,
    handleTokenExpired,
    // Helper methods
    isAdmin,
    isSuperAdmin,
    isCustomer,
    getUserId,
    getUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};