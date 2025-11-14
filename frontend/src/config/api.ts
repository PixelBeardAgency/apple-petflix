/**
 * API Configuration
 * Handles API URL based on environment
 */

// Use relative URLs in production (same domain), absolute in development
const getApiUrl = (): string => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production (Vercel), use relative URLs since frontend and backend are on same domain
  if (import.meta.env.PROD) {
    return ''; // Empty string for relative URLs
  }
  
  // In development, use localhost
  return 'http://localhost:3001';
};

export const API_URL = getApiUrl();

