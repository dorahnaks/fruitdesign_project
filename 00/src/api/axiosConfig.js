import axios from 'axios';
import { storage } from '../utils/storage';

// Explicitly set the baseURL to include the API path
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

console.log('API baseURL:', baseURL);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 10 second timeout
  withCredentials: false // Don't send credentials automatically
});

api.interceptors.request.use(
  config => {
    const token = storage.auth.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData requests
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    console.log('=== AXIOS REQUEST DEBUG ===');
    console.log('Making request to:', config.url);
    console.log('Full URL:', config.baseURL + config.url);
    console.log('Request method:', config.method);
    console.log('Request headers:', config.headers);
    console.log('Request data:', config.data);
    console.log('=== END AXIOS REQUEST DEBUG ===');
    return config;
  },
  error => {
    console.error('=== AXIOS REQUEST ERROR ===');
    console.error('Request error:', error);
    console.error('=== END AXIOS REQUEST ERROR ===');
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('=== AXIOS RESPONSE DEBUG ===');
    console.log('Received response from:', response.config.url);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', response.data);
    console.log('=== END AXIOS RESPONSE DEBUG ===');
    return response;
  },
  async function (error) {
    console.error('=== AXIOS RESPONSE ERROR ===');
    console.error('Response error:', error);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      console.error('Error response data:', error.response.data);
    } else if (error.request) {
      console.error('Error request:', error.request);
      console.error('Error message:', error.message);
    } else {
      console.error('Error message:', error.message);
    }
    console.error('=== END AXIOS RESPONSE ERROR ===');
    
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = storage.auth.getRefreshToken();
        if (refreshToken) {
          try {
            const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, {
              headers: {
                Authorization: `Bearer ${refreshToken}`
              }
            });
            
            const { access_token } = response.data;
            
            // Update stored token
            storage.auth.setToken(access_token);
            api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
            
            // Retry the original request
            return api(originalRequest);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Clear auth and redirect to login
            storage.auth.clearAuth();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token available
          storage.auth.clearAuth();
          window.location.href = '/login';
        }
      } catch (err) {
        console.error('Error during token refresh:', err);
        storage.auth.clearAuth();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    
    // For other errors, just reject
    return Promise.reject(error);
  }
);

export default api;