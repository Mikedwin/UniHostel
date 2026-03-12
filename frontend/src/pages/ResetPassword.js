import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import API_URL from '../config';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/auth/reset-password/${token}`, { password });
            setMessage(res.data.message);
            setSuccess(true);
            setTimeout(() => navigate('/student-login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="w-full max-w-md text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-green-100">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
                    <p className="text-gray-600 mb-4">{message}</p>
                    <p className="text-sm text-gray-500">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#e6f5f4' }}>
                        <Lock className="w-8 h-8" style={{ color: '#23817A' }} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Set New Password</h2>
                    <p className="mt-2 text-sm text-gray-600">Enter your new password below</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                            type="password"
                            required
                            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onFocus={(e) => e.target.style.borderColor = '#23817A'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                        <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                        <input
                            type="password"
                            required
                            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            onFocus={(e) => e.target.style.borderColor = '#23817A'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-8 py-3.5 text-base font-semibold rounded-lg text-white transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                        style={{ backgroundColor: '#23817A' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a6159'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#23817A'}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/student-login" className="text-sm font-medium" style={{ color: '#23817A' }}>
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
