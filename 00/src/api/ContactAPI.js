import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

const contactAPI = {
  // Get contact info - public
  getContactInfo: async () => {
    try {
      const response = await axios.get(`${API_URL}/contact`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contact info:', error);
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
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
  
  // Update contact info - admin only
  updateContactInfo: async (contactData, token) => {
    try {
      const response = await axios.put(`${API_URL}/contact`, contactData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating contact info:', error);
      
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