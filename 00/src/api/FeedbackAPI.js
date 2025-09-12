import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

const feedbackAPI = {
  // Submit feedback
  submitFeedback: async (feedbackData, token) => {
    try {
      const response = await axios.post(`${API_URL}/feedback`, feedbackData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },
  
  // Get current user's feedback
  getMyFeedback: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/feedback/mine`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.feedbacks;
    } catch (error) {
      console.error('Error fetching user feedback:', error);
      throw error;
    }
  },
  
  // Get all feedback - admin only
  getAllFeedback: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/feedback`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.feedbacks;
    } catch (error) {
      console.error('Error fetching all feedback:', error);
      throw error;
    }
  },
  
  // Get feedback by ID - admin only
  getFeedbackById: async (feedbackId, token) => {
    try {
      const response = await axios.get(`${API_URL}/feedback/${feedbackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback by ID:', error);
      throw error;
    }
  },
  
  // Respond to feedback - admin only
  respondToFeedback: async (feedbackId, responseData, token) => {
    try {
      const response = await axios.put(`${API_URL}/feedback/${feedbackId}/respond`, responseData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error responding to feedback:', error);
      throw error;
    }
  }
};

export default feedbackAPI;