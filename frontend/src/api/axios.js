// frontend/src/api/axios.js
import axios from "axios";

// Use environment variable if available (set in Vercel), otherwise fallback to localhost
const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: baseURL,
});

// Add token to requests
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  console.log('📡 Request:', req.method, req.url);
  return req;
});

// Add response interceptor for debugging
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default API;