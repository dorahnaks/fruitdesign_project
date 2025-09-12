import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error("AuthContext is not available. Make sure you are using the AuthProvider.");
    return {
      currentUser: null,
      isAdmin: false,
      loading: false,
      token: null,
      login: () => Promise.reject(new Error("AuthContext not available")),
      signup: () => Promise.reject(new Error("AuthContext not available")),
      logout: () => {},
      updateProfile: () => Promise.reject(new Error("AuthContext not available")),
      changePassword: () => Promise.reject(new Error("AuthContext not available"))
    };
  }
  return context;
};