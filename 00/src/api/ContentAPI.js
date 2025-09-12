import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

const contentAPI = {
  // Get best sellers
  getBestSellers: async () => {
    try {
      const response = await axios.get(`${API_URL}/content/home/best-sellers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      throw error;
    }
  },
  
  // Get company info
  getCompanyInfo: async () => {
    try {
      const response = await axios.get(`${API_URL}/content/about/company-info`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company info:', error);
      throw error;
    }
  },
  
  // Get team members
  getTeamMembers: async () => {
    try {
      const response = await axios.get(`${API_URL}/content/about/team-members`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  },
  
  // Get company stats
  getCompanyStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/content/about/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company stats:', error);
      throw error;
    }
  },
  
  // Get health tips
  getHealthTips: async (category = 'all', search = '') => {
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      
      const response = await axios.get(`${API_URL}/content/health-tips`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching health tips:', error);
      throw error;
    }
  },
  
  // Get quick tips
  getQuickTips: async () => {
    try {
      const response = await axios.get(`${API_URL}/content/quick-tips`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quick tips:', error);
      throw error;
    }
  },
  
  // Add best seller - admin only
  addBestSeller: async (bestSellerData, token) => {
    try {
      const response = await axios.post(`${API_URL}/content/admin/best-sellers`, bestSellerData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding best seller:', error);
      throw error;
    }
  },
  
  // Add health tip - admin only
  addHealthTip: async (tipData, token) => {
    try {
      const response = await axios.post(`${API_URL}/content/admin/health-tips`, tipData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding health tip:', error);
      throw error;
    }
  },
  
  // Update health tip - admin only
  updateHealthTip: async (tipId, tipData, token) => {
    try {
      const response = await axios.put(`${API_URL}/content/admin/health-tips/${tipId}`, tipData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating health tip:', error);
      throw error;
    }
  },
  
  // Delete health tip - admin only
  deleteHealthTip: async (tipId, token) => {
    try {
      const response = await axios.delete(`${API_URL}/content/admin/health-tips/${tipId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting health tip:', error);
      throw error;
    }
  }
};

export default contentAPI;