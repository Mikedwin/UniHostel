import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import TurnstileWidget from '../components/security/TurnstileWidget';
import useTurnstileGate from '../utils/useTurnstileGate';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnTo = searchParams.get('returnTo') || '/login';
    const [formData, setFormData] = useState({
        email: '',
        code: '',
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('request');
    const [success, setSuccess] = useState(false);
    const {
        turnstileEnabled,
        turnstileResetKey,
        turnstileToken,
        setTurnstileToken,
        resetTurnstile,
        validateTurnstile
    } = useTurnstileGate();

    const handleRequestCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (!validateTurnstile(setError)) {
                return;
            }

            const res = await axios.post(API_ENDPOINTS.FORGOT_PASSWORD, {
                email: formData.email.trim().toLowerCase(),
                turnstileToken
            });

            setMessage(res.data.message);
            setStep('verify');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset code');
        } finally {
            resetTurnstile();
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (!/^\d{6}$/.test(formData.code.trim())) {
            setError('Enter the 6-digit reset code');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(API_ENDPOINTS.RESET_PASSWORD_CODE, {
                email: formData.email.trim().toLowerCase(),
                code: formData.code,
                password: formData.password
            });

            setMessage(res.data.message);
            setSuccess(true);
            setTimeout(() => navigate(returnTo), 3000);
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h2>
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
                        {step === 'request' ? (
                            <Mail className="w-8 h-8" style={{ color: '#23817A' }} />
                        ) : (
                            <Lock className="w-8 h-8" style={{ color: '#23817A' }} />
                        )}
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Reset Password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === 'request'
                            ? 'Enter your email to receive a reset code'
                            : 'Enter the reset code and choose a new password'}
                    </p>
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

                {step === 'request' ? (
                    <form onSubmit={handleRequestCode} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                onFocus={(e) => e.target.style.borderColor = '#23817A'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                            <p className="mt-1 text-xs text-gray-500">Use the same email address you registered with.</p>
                        </div>

                        {turnstileEnabled && (
                            <TurnstileWidget
                                action="forgot_password"
                                resetKey={turnstileResetKey}
                                onTokenChange={setTurnstileToken}
                                onError={setError}
                            />
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-8 py-3.5 text-base font-semibold rounded-lg text-white transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                            style={{ backgroundColor: '#23817A' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a6159'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#23817A'}
                        >
                            {loading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                readOnly
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                value={formData.email}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reset Code</label>
                            <input
                                type="text"
                                required
                                inputMode="numeric"
                                maxLength="6"
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none tracking-[0.4em]"
                                placeholder="123456"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.replace(/\D/g, '') })}
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
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                onFocus={(e) => e.target.style.borderColor = '#23817A'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                            <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none"
                                placeholder="Confirm new password"
                                value={formData.confirmPassword}
                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
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

                        <button
                            type="button"
                            className="w-full px-8 py-3 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                            onClick={() => {
                                setStep('request');
                                setError('');
                                setMessage('');
                                setFormData({
                                    email: '',
                                    code: '',
                                    password: '',
                                    confirmPassword: ''
                                });
                            }}
                        >
                            Use Another Email
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <Link to={returnTo} className="inline-flex items-center text-sm font-medium" style={{ color: '#23817A' }}>
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
