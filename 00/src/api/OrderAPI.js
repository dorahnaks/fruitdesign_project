import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

const orderAPI = {
  // Get orders for the current user
  getOrders: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },
  
  // Get a single order by ID
  getOrder: async (orderId, token) => {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },
  
  // Create a new order
  createOrder: async (orderData, token) => {
    try {
      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
  
  // Update order status - admin only
  updateOrderStatus: async (orderId, status, token) => {
    try {
      const response = await axios.patch(`${API_URL}/orders/${orderId}/status`, 
        { status }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },
  
  // Cancel order
  cancelOrder: async (orderId, token) => {
    try {
      const response = await axios.post(`${API_URL}/orders/${orderId}/cancel`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }
};

export default orderAPI;