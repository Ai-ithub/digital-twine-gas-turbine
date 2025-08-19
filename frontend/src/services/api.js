import axios from 'axios';

// Create a pre-configured instance of axios
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can add interceptors here later for handling tokens, etc.

export default apiClient;