// Shared frontend configuration
const normalizeApiRoot = (value) => value.replace(/\/+$/, '').replace(/\/api$/, '');

const runtimeEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
const legacyEnv = typeof process !== 'undefined' && process.env ? process.env : {};

const API_URL = normalizeApiRoot(runtimeEnv.VITE_API_URL || legacyEnv.REACT_APP_API_URL || 'https://unihostel.onrender.com');
export const API_BASE_URL = `${API_URL}/api`;

export const PAYSTACK_PUBLIC_KEY = (runtimeEnv.VITE_PAYSTACK_PUBLIC_KEY || legacyEnv.REACT_APP_PAYSTACK_PUBLIC_KEY || '').trim();

export default API_URL;
