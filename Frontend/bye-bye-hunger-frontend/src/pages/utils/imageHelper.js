// src/utils/imageHelper.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/images/default-food.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  
  const baseUrl = API_URL.replace('/api', '');
  
  // If path already has full uploads/foods path
  if (imagePath.includes('/uploads/foods/')) {
    return `${baseUrl}${imagePath}`;
  }
  
  // If path starts with /uploads/ (without foods)
  if (imagePath.startsWith('/uploads/')) {
    const filename = imagePath.split('/').pop();
    return `${baseUrl}/uploads/foods/${filename}`;
  }
  
  // If just filename
  return `${baseUrl}/uploads/foods/${imagePath}`;
};