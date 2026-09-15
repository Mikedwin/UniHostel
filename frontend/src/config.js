// Shared frontend configuration
const normalizeApiRoot = (value) => (value || '').replace(/\/+$/, '').replace(/\/api$/, '');

const rawApiUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ||
  'https://unihostel.onrender.com';

const API_URL = normalizeApiRoot(rawApiUrl) || 'https://unihostel.onrender.com';
export const API_BASE_URL = `${API_URL}/api`;

export const PAYSTACK_PUBLIC_KEY = (
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_PAYSTACK_PUBLIC_KEY) ||
  ''
).trim();

export const TURNSTILE_SITE_KEY = (
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_TURNSTILE_SITE_KEY) ||
  ''
).trim();

export const TURNSTILE_ENABLED =
  (
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_TURNSTILE_ENABLED) ||
    ''
  ).trim() === 'true' && Boolean(TURNSTILE_SITE_KEY);

export default API_URL;
