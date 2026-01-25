import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import API_URL from '../config';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
            setMessage(res.data.message);
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#e6f5f4' }}>
                        <Mail className="w-8 h-8" style={{ color: '#23817A' }} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Reset Password</h2>
                    <p className="mt-2 text-sm text-gray-600">Enter your email to receive a reset link</p>
                </div>

                {message && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
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
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/student-login" className="inline-flex items-center text-sm font-medium" style={{ color: '#23817A' }}>
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
