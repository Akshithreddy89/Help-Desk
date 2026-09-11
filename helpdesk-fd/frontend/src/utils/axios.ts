import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api', // Proxied by Vite to the backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token in every http request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token added to request headers:', token);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
