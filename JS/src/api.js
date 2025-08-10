// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081', // backend base URL
  withCredentials: false, // set to true if using cookies/sessions
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
