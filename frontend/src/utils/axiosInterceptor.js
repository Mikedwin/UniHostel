import axios from 'axios';

const SAFE_METHODS = new Set(['get', 'head', 'options']);

const isLikelyJwt = (value) => /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test((value || '').trim());

export const setupAxiosInterceptors = (logout, navigate, getCsrfToken = () => null) => {
  axios.defaults.withCredentials = true;

  const requestInterceptorId = axios.interceptors.request.use(
    (config) => {
      const nextConfig = { ...config };
      nextConfig.withCredentials = true;
      nextConfig.headers = nextConfig.headers || {};

      const authorizationHeader = nextConfig.headers.Authorization;
      if (typeof authorizationHeader === 'string' && authorizationHeader.startsWith('Bearer ')) {
        const candidateToken = authorizationHeader.substring(7).trim();
        if (!isLikelyJwt(candidateToken)) {
          delete nextConfig.headers.Authorization;
        }
      }

      const method = (nextConfig.method || 'get').toLowerCase();
      if (!SAFE_METHODS.has(method)) {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
          nextConfig.headers['X-CSRF-Token'] = csrfToken;
        }
      }

      return nextConfig;
    },
    (error) => Promise.reject(error)
  );

  const responseInterceptorId = axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
        logout({ notifyServer: false });
        navigate('/login');
      }
      return Promise.reject(error);
    }
  );

  return () => {
    axios.interceptors.request.eject(requestInterceptorId);
    axios.interceptors.response.eject(responseInterceptorId);
  };
};
