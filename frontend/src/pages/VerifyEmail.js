import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Loader, XCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('failed');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const response = await axios.get(API_ENDPOINTS.VERIFY_EMAIL(token));
        setStatus('success');
        setMessage(response.data?.message || 'Email verified successfully. You can now sign in.');
      } catch (error) {
        setStatus('failed');
        setMessage(error.response?.data?.message || 'Email verification failed.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <Loader className="w-16 h-16 mx-auto mb-4 text-primary-600 animate-spin" />
            <h2 className="text-2xl font-bold mb-2">Verifying Email</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-2 text-green-700">Email Verified</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2 text-red-700">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/student-register"
              className="inline-flex items-center justify-center bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Back to Registration
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
