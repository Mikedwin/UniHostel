import axios from 'axios';

export const setupAxiosInterceptors = (logout, navigate) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        const message = error.response?.data?.message || '';
        if (message.includes('expired') || message.includes('Invalid token')) {
          logout();
          navigate('/');
          alert('Your session has expired. Please login again.');
        }
      }
      return Promise.reject(error);
    }
  );
};
