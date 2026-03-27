// src/api/apiClient.js
// Centralized Axios instance using REACT_APP_API_URL

import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/v1',
});

export default apiClient;
