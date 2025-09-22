import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

const contactAPI = {
  // Get contact info - public
  getContactInfo: async () => {
    try {
      const response = await axios.get(`${API_URL}/contact`);
      console.log('Contact API Response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching contact info:', error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        
        // If 404, return default structure
        if (error.response.status === 404) {
          return {
            phone: '',
            email: '',
            location: '',
            map_link: '',
            social_media_links: {
              facebook: '',
              twitter: '',
              instagram: '',
              linkedin: ''
            }
          };
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      return {
        phone: '',
        email: '',
        location: '',
        map_link: '',
        social_media_links: {
          facebook: '',
          twitter: '',
          instagram: '',
          linkedin: ''
        }
      };
    }
  },
  
  // Test connection to backend
  testConnection: async () => {
    try {
      await axios.get(`${API_URL}/contact`);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      throw error;
    }
  },
  
  // Get contact info for admin - throws errors
  getContactInfoForAdmin: async () => {
    try {
      const response = await axios.get(`${API_URL}/contact`);
      console.log('Admin Contact API Response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching contact info for admin:', error);
      throw error;
    }
  },
  
  // Update contact info - admin only
  updateContactInfo: async (contactData, token) => {
    try {
      console.log('Updating contact info with data:', contactData); // Debug log
      const response = await axios.put(`${API_URL}/contact`, contactData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Update response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error updating contact info:', error);
      console.error('Full error object:', error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        
        const errorMessage = error.response.data?.error || 
                           error.response.data?.message || 
                           'Failed to update contact information';
        throw new Error(errorMessage);
      } else if (error.request) {
        console.error('Error request:', error.request);
        throw new Error('No response from server. Please check if the backend is running.');
      } else {
        console.error('Error message:', error.message);
        throw new Error('Error setting up request: ' + error.message);
      }
    }
  }
};

export default contactAPI;