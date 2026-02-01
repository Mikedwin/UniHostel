import axios from 'axios';

export const setupAxiosInterceptors = (logout, navigate) => {
  // Request interceptor - Add JWT token
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - Handle errors
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Only logout on 401 if it's an authentication endpoint or token is actually invalid
      if (error.response?.status === 401) {
        const url = error.config?.url || '';
        // Only auto-logout for auth-related endpoints
        if (url.includes('/auth/') || url.includes('/login') || error.response?.data?.message?.includes('token')) {
          console.log('Authentication failed - logging out');
          logout();
          navigate('/student-login');
        }
      }
      return Promise.reject(error);
    }
  );
};
