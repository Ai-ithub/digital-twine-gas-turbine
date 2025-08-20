// src/api/apiClient.js

import axios from 'axios';

// Create a pre-configured instance of axios
const apiClient = axios.create({
  // Use import.meta.env for Vite environment variables
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can add interceptors here later for handling tokens, etc.

export default apiClient;