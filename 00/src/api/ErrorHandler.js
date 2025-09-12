// Centralized error handler
export const handleApiError = (error, customMessage = '') => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return { success: false, message: data.error || 'Bad request' };
      case 401:
        return { success: false, message: 'Unauthorized. Please login again.' };
      case 403:
        return { success: false, message: 'Access denied. Insufficient permissions.' };
      case 404:
        return { success: false, message: 'Resource not found.' };
      case 422:
        return { success: false, message: data.error || 'Validation error' };
      case 500:
        return { success: false, message: 'Server error. Please try again later.' };
      default:
        return { success: false, message: data.error || 'An error occurred' };
    }
  } else if (error.request) {
    return { success: false, message: 'Network error. Please check your connection.' };
  } else {
    return { success: false, message: error.message || 'An unknown error occurred' };
  }
};

// Success response handler
export const handleSuccess = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};