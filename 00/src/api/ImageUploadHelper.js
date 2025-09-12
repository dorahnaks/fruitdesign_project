// Helper function for image uploads
export const uploadImage = async (file, folder = 'products') => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await axios.post(`${API_URL}/upload/${folder}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.image_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Helper function to get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/images/placeholder.jpg';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Otherwise, prepend the base URL
  return `${API_URL.replace('/api/v1', '')}${imagePath}`;
};