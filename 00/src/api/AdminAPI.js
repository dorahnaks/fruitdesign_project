import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

const adminAPI = {
  // Get all admins - superadmin only
  getAllAdmins: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.data.admins;
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw error;
    }
  },
  
  // Get admin by ID
  getAdmin: async (adminId, token) => {
    try {
      const response = await axios.get(`${API_URL}/admins/${adminId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching admin:', error);
      throw error;
    }
  },
  
  // Update admin - superadmin only
  updateAdmin: async (adminId, adminData, token) => {
    try {
      const response = await axios.put(`${API_URL}/admins/${adminId}`, adminData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating admin:', error);
      throw error;
    }
  },
  
  // Delete admin - superadmin only
  deleteAdmin: async (adminId, token) => {
    try {
      const response = await axios.delete(`${API_URL}/admins/${adminId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw error;
    }
  },
  
  // Admin logout
  logout: async (token) => {
    try {
      const response = await axios.post(`${API_URL}/admins/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error logging out admin:', error);
      throw error;
    }
  }
};

export default adminAPI;