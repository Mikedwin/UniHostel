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

      if (!nextConfig.headers.Authorization && typeof window !== 'undefined') {
        const fallbackToken = window.sessionStorage?.getItem('sessionAuthToken') || window.localStorage?.getItem('token');
        if (fallbackToken && isLikelyJwt(fallbackToken)) {
          nextConfig.headers.Authorization = `Bearer ${fallbackToken.trim()}`;
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
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const isAlreadyOnAuthPage = ['/login', '/manager-login', '/student-login', '/admin-login'].includes(currentPath);

        if (!isAlreadyOnAuthPage) {
          logout({ notifyServer: false });
          const redirectPath = currentPath.includes('manager') ? '/manager-login' : currentPath.includes('student') ? '/student-login' : '/login';
          navigate(redirectPath);
        }
      }
      return Promise.reject(error);
    }
  );

  return () => {
    axios.interceptors.request.eject(requestInterceptorId);
    axios.interceptors.response.eject(responseInterceptorId);
  };
};
