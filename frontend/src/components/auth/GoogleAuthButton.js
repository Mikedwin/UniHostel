import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import { GOOGLE_CLIENT_ID } from '../../config';

/**
 * Google Authentication Button
 * 
 * Props:
 * - role: "student" | "manager" (default: "student")
 * - redirectTo: string (optional navigation target)
 * - text: "signin_with" | "signup_with" | "continue_with" (default: "continue_with")
 * - onError: callback function for error messages
 */
const GoogleAuthButton = ({
  role = 'student',
  redirectTo = '/hostels',
  text = 'continue_with',
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      if (onError) onError('No credential received from Google.');
      return;
    }

    setLoading(true);
    if (onError) onError('');

    try {
      const response = await axios.post(API_ENDPOINTS.GOOGLE_AUTH, {
        credential: credentialResponse.credential,
        role
      });

      const { user, token, csrfToken } = response.data;

      login(user, csrfToken, token);

      if (user.role === 'manager') {
        navigate('/manager-dashboard', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate(redirectTo || '/hostels', { replace: true });
      }
    } catch (err) {
      console.error('Google authentication error:', err);
      const message = err.response?.data?.message || 'Google sign-in failed. Please try again.';
      if (onError) onError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFailure = () => {
    if (onError) {
      onError('Google sign-in was cancelled or encountered an error.');
    }
  };

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        disabled
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-400 text-sm font-semibold cursor-not-allowed shadow-sm"
        title="Google Sign-In is being configured"
      >
        <svg className="w-5 h-5 opacity-40" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>Google Sign-In</span>
      </button>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {loading ? (
        <div className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-[#173b35]/20 bg-white text-gray-700 text-sm font-semibold shadow-sm">
          <div className="w-4 h-4 border-2 border-[#173b35] border-t-transparent rounded-full animate-spin" />
          <span>Signing in with Google...</span>
        </div>
      ) : (
        <div className="w-full flex items-center justify-center p-1 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-gray-300 transition-colors">
          <div className="w-full flex justify-center items-center py-0.5 [&>div]:!flex [&>div]:!justify-center [&>div]:!items-center [&>div]:!w-full [&>div>iframe]:!mx-auto">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleFailure}
              text={text}
              shape="rectangular"
              theme="outline"
              size="large"
              width="360"
              useOneTap={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;
