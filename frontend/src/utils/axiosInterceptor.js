import axios from 'axios';

export const setupAxiosInterceptors = (logout, navigate) => {
  // Request interceptor - Add CSRF token
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      const csrfToken = localStorage.getItem('csrfToken');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add CSRF token for state-changing requests
      if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
        config.headers['X-CSRF-Token'] = csrfToken;
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
      if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
        console.error('CSRF token invalid - logging out');
        logout();
        navigate('/student-login');
      }
      return Promise.reject(error);
    }
  );
};

// Call logout endpoint to invalidate CSRF token
export const logoutWithCsrfCleanup = async (API_URL) => {
  try {
    const csrfToken = localStorage.getItem('csrfToken');
    if (csrfToken) {
      await axios.post(`${API_URL}/api/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-CSRF-Token': csrfToken
        }
      });
    }
  } catch (err) {
    console.error('Logout cleanup failed:', err);
  }
};
