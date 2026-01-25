import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Lock, Mail, HelpCircle, CheckCircle } from 'lucide-react';
import API_URL from '../config';

const InAppPasswordReset = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userId, setUserId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_URL}/api/auth/reset-verify`, { email });
            setSecurityQuestion(res.data.securityQuestion);
            setUserId(res.data.userId);
            setStep(2);
        } catch (err) {
            if (err.response?.data?.needsSetup) {
                setError('Security question not set. Please use "Forgot Password" or contact support.');
            } else {
                setError(err.response?.data?.message || 'Failed to verify email');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/reset-with-security`, {
                userId,
                securityAnswer,
                newPassword
            });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (step === 3) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="w-full max-w-md text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-green-100">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
                    <p className="text-gray-600 mb-6">You can now login with your new password.</p>
                    <Link
                        to="/student-login"
                        className="inline-block px-8 py-3 rounded-lg text-white font-semibold"
                        style={{ backgroundColor: '#23817A' }}
                    >
                        Go to Login
                    </Link>
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
                    <h2 className="text-3xl font-extrabold text-gray-900">Reset Password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === 1 ? 'Enter your email to continue' : 'Answer your security question'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleVerifyEmail} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onFocus={(e) => e.target.style.borderColor = '#23817A'}
                                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-8 py-3.5 text-base font-semibold rounded-lg text-white transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                            style={{ backgroundColor: '#23817A' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a6159'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#23817A'}
                        >
                            {loading ? 'Verifying...' : 'Continue'}
                        </button>

                        <div className="text-center text-sm text-gray-600">
                            <Link to="/student-login" className="font-medium" style={{ color: '#23817A' }}>
                                Back to Login
                            </Link>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start">
                                <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Security Question:</p>
                                    <p className="text-sm text-blue-700 mt-1">{securityQuestion}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer</label>
                            <input
                                type="text"
                                required
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none"
                                placeholder="Enter your answer"
                                value={securityAnswer}
                                onChange={e => setSecurityAnswer(e.target.value)}
                                onFocus={(e) => e.target.style.borderColor = '#23817A'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input
                                type="password"
                                required
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
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
                                placeholder="Confirm new password"
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
                )}
            </div>
        </div>
    );
};

export default InAppPasswordReset;
