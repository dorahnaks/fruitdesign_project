import axios from 'axios';
import api from './axiosConfig';

export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('auth/login', credentials);
      console.log('Login API response:', response);
      console.log('Login API response data:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      const data = response.data.data || response.data;
      
      let userData;
      if (data.customer) {
        userData = data.customer;
      } else if (data.admin) {
        userData = data.admin;
      } else {
        userData = data.user || data;
      }
      
      return {
        data: {
          access_token: data.access_token || data.token,
          refresh_token: data.refresh_token,
          user: userData,
          role: data.role || (userData ? userData.role : 'customer')
        }
      };
    } catch (error) {
      console.error('Login API error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },
  
  registerCustomer: async (userData) => {
    try {
      console.log('Sending registration request with data:', userData);
      const response = await api.post('/auth/register', userData);
      console.log('Registration response:', response);
      console.log('Registration response data:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      const data = response.data.data || response.data;
      
      let userResponse;
      if (data.customer) {
        userResponse = data.customer;
      } else if (data.admin) {
        userResponse = data.admin;
      } else {
        userResponse = data.user || data;
      }
      
      return {
        data: {
          access_token: data.access_token || data.token,
          refresh_token: data.refresh_token,
          user: userResponse,
          role: data.role || (userResponse ? userResponse.role : 'customer')
        }
      };
    } catch (error) {
      console.error('Register API error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },
  
  refreshToken: async (refreshToken) => {
    try {
      const response = await axios.post(`${api.defaults.baseURL}/api/v1/auth/refresh`, {}, {
        headers: {
          Authorization: `Bearer ${refreshToken}`
        }
      });
      console.log('Refresh token response:', response);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      const data = response.data.data || response.data;
      
      return {
        data: {
          access_token: data.access_token || data.token,
          user: data.user || data
        }
      };
    } catch (error) {
      console.error('Refresh token API error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const response = await api.post('/api/v1/auth/logout');
      console.log('Logout response:', response);
      return response;
    } catch (error) {
      console.error('Logout API error:', error);
      throw error;
    }
  },
  
  getCurrentUser: async (token) => {
    try {
      const response = await api.get('/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Get current user response:', response);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      const data = response.data.data || response.data;
      
      return {
        data: data.user || data
      };
    } catch (error) {
      console.error('Get current user API error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },
  
  updateUser: async (userData) => {
    try {
      console.log('=== AUTH API UPDATE DEBUG ===');
      console.log('Sending update user request with data:', userData);
      console.log('Data types:', {
        name: typeof userData.name,
        phone: typeof userData.phone,
        email: typeof userData.email,
        address: typeof userData.address
      });
      
      const response = await api.put('/api/v1/auth/me', userData);
      console.log('Update user response status:', response.status);
      console.log('Update user response data:', response.data);
      console.log('=== END AUTH API DEBUG ===');
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      const data = response.data.data || response.data;
      
      return {
        data: data.user || data
      };
    } catch (error) {
      console.error('=== AUTH API UPDATE ERROR ===');
      console.error('Update user API error:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        console.error('Error response headers:', error.response.headers);
      }
      console.error('=== END AUTH API ERROR ===');
      throw error;
    }
  }
};