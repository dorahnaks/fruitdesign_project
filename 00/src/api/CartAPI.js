import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

const cartAPI = {
  // Get current user's cart
  getCart: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/carts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.cart;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },
  
  // Add item to cart
  addToCart: async (itemData, token) => {
    try {
      const response = await axios.post(`${API_URL}/carts/items`, itemData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  },
  
  // Update cart item quantity
  updateCartItem: async (itemId, quantity, token) => {
    try {
      const response = await axios.put(`${API_URL}/carts/items/${itemId}`, 
        { quantity }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },
  
  // Remove item from cart
  removeCartItem: async (itemId, token) => {
    try {
      const response = await axios.delete(`${API_URL}/carts/items/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  },
  
  // Checkout cart
  checkout: async (token) => {
    try {
      const response = await axios.post(`${API_URL}/carts/checkout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking out:', error);
      throw error;
    }
  }
};

export default cartAPI;