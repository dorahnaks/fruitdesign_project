import axios from 'axios';

// Use the full URL to avoid proxy issues
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Helper function to convert relative image URL to full URL
const getFullImageUrl = (image_url) => {
  if (!image_url) return null;
  
  // If it's already a full URL, return as is
  if (image_url.startsWith('http://') || image_url.startsWith('https://')) {
    return image_url;
  }
  
  // If it's a relative path starting with /static/, convert to full URL
  if (image_url.startsWith('/static/')) {
    const baseUrl = API_BASE_URL.replace('/api/v1', ''); // Remove /api/v1 prefix
    return `${baseUrl}${image_url}`;
  }
  
  // Fallback: assume it's a relative path to the API
  return `${API_BASE_URL}/${image_url}`;
};

const productAPI = {
  // Get all products (public endpoint)
  getPublicProducts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/public`);
      return response.data.products.map(product => ({
        ...product,
        image_url: getFullImageUrl(product.image_url)
      }));
    } catch (error) {
      console.error('Error fetching public products:', error);
      throw error;
    }
  },

  // Get all products (requires authentication)
  getAllProducts: async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.products.map(product => ({
        ...product,
        image_url: getFullImageUrl(product.image_url)
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
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
      const product = response.data.product;
      return {
        ...product,
        image_url: getFullImageUrl(product.image_url)
      };
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
      const product = response.data.product;
      return {
        ...product,
        image_url: getFullImageUrl(product.image_url)
      };
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
      const product = response.data.product;
      return {
        ...product,
        image_url: getFullImageUrl(product.image_url)
      };
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
      return response.data.products.map(product => ({
        ...product,
        image_url: getFullImageUrl(product.image_url)
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/category/${category}`);
      return response.data.products.map(product => ({
        ...product,
        image_url: getFullImageUrl(product.image_url)
      }));
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/featured`);
      return response.data.products.map(product => ({
        ...product,
        image_url: getFullImageUrl(product.image_url)
      }));
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
      return response.data.products.map(product => ({
        ...product,
        image_url: getFullImageUrl(product.image_url)
      }));
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }
};

export default productAPI;