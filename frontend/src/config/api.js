// API Configuration for UniHostel Frontend
// Automatically detects environment and uses appropriate API URL

const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000/api'  // Local development
  : 'https://unihostel.onrender.com/api';  // Production

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', isDevelopment ? 'Development' : 'Production');

export const API_ENDPOINTS = {
  // Auth
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  
  // Hostels
  HOSTELS: `${API_BASE_URL}/hostels`,
  HOSTEL_DETAIL: (id) => `${API_BASE_URL}/hostels/${id}`,
  
  // Applications
  APPLICATIONS: `${API_BASE_URL}/applications`,
  STUDENT_APPLICATIONS: `${API_BASE_URL}/applications/student`,
  MANAGER_APPLICATIONS: `${API_BASE_URL}/applications/manager`,
  APPLICATION_STATUS: (id) => `${API_BASE_URL}/applications/${id}/status`,
  APPLICATION_DETAIL: (id) => `${API_BASE_URL}/applications/${id}`,
  
  // Payment
  PAYMENT_INITIALIZE: `${API_BASE_URL}/payment/initialize`,
  PAYMENT_VERIFY: `${API_BASE_URL}/payment/verify`,
  
  // Upload
  UPLOAD_IMAGE: `${API_BASE_URL}/upload`,
};

export const SUPABASE_CONFIG = {
  URL: 'https://fvkucgyqvuroxbrjdpkx.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2a3VjZ3lxdnVyb3hicmpkcGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MTcyMDUsImV4cCI6MjA4NjM5MzIwNX0.QjySGy5BjkX_QJOYn4z_U74ViKYVTACb9lY2xihW7ik'
};

export const PAYSTACK_PUBLIC_KEY = 'pk_live_eb0f80d31cbab0aea6cbf905036e6b3a096d888c';

export default API_ENDPOINTS;
