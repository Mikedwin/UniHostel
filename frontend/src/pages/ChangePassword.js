import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowLeft } from 'lucide-react';
import API_URL from '../config';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword.length < 8) {
            setError('New password must be at least 8 characters');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/change-password`, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Password changed successfully!');
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => navigate(-1), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-md mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-sm mb-6 hover:underline"
                    style={{ color: '#23817A' }}
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                </button>

                <div className="bg-white rounded-lg shadow-sm p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#e6f5f4' }}>
                            <Lock className="w-8 h-8" style={{ color: '#23817A' }} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                        <p className="mt-2 text-sm text-gray-600">Update your account password</p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                            <input
                                type="password"
                                required
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none"
                                placeholder="Enter current password"
                                value={formData.currentPassword}
                                onChange={e => setFormData({...formData, currentPassword: e.target.value})}
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
                                value={formData.newPassword}
                                onChange={e => setFormData({...formData, newPassword: e.target.value})}
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
                                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
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
                            {loading ? 'Changing Password...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
