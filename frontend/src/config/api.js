import { API_BASE_URL, PAYSTACK_PUBLIC_KEY } from '../config';

export { PAYSTACK_PUBLIC_KEY };

export const API_ENDPOINTS = {
  // Auth
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  SESSION: `${API_BASE_URL}/auth/session`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  VERIFY_EMAIL: (token) => `${API_BASE_URL}/auth/verify-email/${token}`,
  RESEND_VERIFICATION: `${API_BASE_URL}/auth/resend-verification`,
  
  // Hostels
  HOSTELS: `${API_BASE_URL}/hostels`,
  HOSTEL_DETAIL: (id) => `${API_BASE_URL}/hostels/${id}`,
  
  // Applications
  APPLICATIONS: `${API_BASE_URL}/applications`,
  STUDENT_APPLICATIONS: `${API_BASE_URL}/applications/student`,
  MANAGER_APPLICATIONS: `${API_BASE_URL}/applications/manager`,
  APPLICATION_STATS_BY_HOSTEL: (hostelId) => `${API_BASE_URL}/applications/hostel/${hostelId}/stats`,
  APPLICATION_STATUS: (id) => `${API_BASE_URL}/applications/${id}/status`,
  APPLICATION_DETAIL: (id) => `${API_BASE_URL}/applications/${id}`,
  
  // Payment
  PAYMENT_BASE: `${API_BASE_URL}/payment`,
  PAYMENT_INITIALIZE: `${API_BASE_URL}/payment/initialize`,
  PAYMENT_VERIFY: (reference) => `${API_BASE_URL}/payment/verify/${reference}`,
  PAYMENT_STATUS: (applicationId) => `${API_BASE_URL}/payment/status/${applicationId}`,
  PAYMENT_STATUS_BATCH: `${API_BASE_URL}/payment/status/batch`,

  // Visitor tracking
  VISITOR_TRACK: `${API_BASE_URL}/visitors/track`,
  
  // Upload
  UPLOAD_IMAGE: `${API_BASE_URL}/upload`,
};

export const SUPABASE_CONFIG = {
  URL: 'https://fvkucgyqvuroxbrjdpkx.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2a3VjZ3lxdnVyb3hicmpkcGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MTcyMDUsImV4cCI6MjA4NjM5MzIwNX0.QjySGy5BjkX_QJOYn4z_U74ViKYVTACb9lY2xihW7ik'
};

export default API_ENDPOINTS;
