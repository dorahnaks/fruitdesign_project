// src/hooks/useTokenRefresh.js
import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export const useTokenRefresh = () => {
  const { handleTokenExpired } = useAuth();

  const refreshToken = useCallback(async () => {
    try {
      const newToken = await handleTokenExpired();
      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }, [handleTokenExpired]);

  return { refreshToken };
};