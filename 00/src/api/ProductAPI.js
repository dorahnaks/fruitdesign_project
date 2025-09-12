import axios from 'axios';

// Use the full URL to avoid proxy issues
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const productAPI = {
  // Get all products (public endpoint)
  getPublicProducts: async () => {
    try {
      const url = `${API_BASE_URL}/products/public`;
      console.log('Fetching public products from:', url);
      const response = await axios.get(url);
      console.log('Public products response:', response.data);
      return response.data.products;
    } catch (error) {
      console.error('Error fetching public products:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  // Get all products (requires authentication)
  getAllProducts: async (token) => {
    try {
      const url = `${API_BASE_URL}/products`;
      console.log('Fetching products from:', url);
      console.log('Using token:', token ? 'Token provided' : 'No token');
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Products response:', response.data);
      return response.data.products;
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  // Get a single product
  getProduct: async (id, token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Create a new product
  createProduct: async (formData, token) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/products`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update a product
  updateProduct: async (id, formData, token) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/products/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (id, token) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (query) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/search`, {
        params: { q: query }
      });
      return response.data.products;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/category/${category}`);
      return response.data.products;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/featured`);
      return response.data.products;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  // Toggle product featured status
  toggleFeatured: async (id, token) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/products/${id}/toggle-featured`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling featured status:', error);
      throw error;
    }
  },

  // Toggle product best seller status
  toggleBestSeller: async (id, token) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/products/${id}/toggle-best-seller`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling best seller status:', error);
      throw error;
    }
  },

  // Toggle product active status
  toggleActive: async (id, token) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/products/${id}/toggle-active`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling active status:', error);
      throw error;
    }
  },

  // Update product stock
  updateStock: async (id, stockQuantity, token) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/products/${id}/stock`, {
        stock_quantity: stockQuantity
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  },

  // Get low stock products
  getLowStockProducts: async (threshold = 10, token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/low-stock`, {
        params: { threshold },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.products;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }
};

export default productAPI;