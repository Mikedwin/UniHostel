import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import API_URL from '../../config';

const ManagerRegistrationForm = ({ token, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        hostelName: '',
        securityQuestion: 'What is your email address?',
        securityAnswer: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post(
                `${API_URL}/api/admin/managers/create`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Show success message with credentials
            alert(
                `Manager Account Created Successfully!\n\n` +
                `Name: ${res.data.manager.name}\n` +
                `Email: ${res.data.manager.email}\n` +
                `Password: ${formData.password}\n\n` +
                `Please share these credentials with the manager securely.`
            );

            // Reset form
            setFormData({
                name: '',
                email: '',
                password: '',
                phone: '',
                hostelName: '',
                securityQuestion: 'What is your email address?',
                securityAnswer: ''
            });

            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create manager account');
        } finally {
            setLoading(false);
        }
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, password });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
                <div className="flex items-center gap-3">
                    <UserPlus className="w-8 h-8" />
                    <div>
                        <h2 className="text-2xl font-bold">Register New Manager</h2>
                        <p className="text-blue-100 text-sm">Create a new hostel manager account</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-b-lg shadow-lg">
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter manager's full name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="manager@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password *
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md p-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter secure password"
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={generatePassword}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium whitespace-nowrap"
                            >
                                Generate
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Optional contact number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hostel Name
                        </label>
                        <input
                            type="text"
                            value={formData.hostelName}
                            onChange={(e) => setFormData({ ...formData, hostelName: e.target.value })}
                            className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Optional hostel name"
                        />
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Security Question (For Password Reset)</h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Security Question *
                            </label>
                            <select
                                required
                                value={formData.securityQuestion}
                                onChange={(e) => setFormData({ ...formData, securityQuestion: e.target.value })}
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="What is your email address?">What is your email address?</option>
                                <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                                <option value="What city were you born in?">What city were you born in?</option>
                                <option value="What is your favorite color?">What is your favorite color?</option>
                                <option value="What is your pet's name?">What is your pet's name?</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Security Answer *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.securityAnswer}
                                onChange={(e) => setFormData({ ...formData, securityAnswer: e.target.value })}
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter answer (case-insensitive)"
                            />
                            <p className="text-xs text-gray-500 mt-1">This will be used for password recovery</p>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Important Notes:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• The manager account will be created with full access immediately</li>
                            <li>• Manager can log in using the email and password provided</li>
                            <li>• Make sure to securely share the credentials with the manager</li>
                            <li>• Manager can change their password after first login</li>
                        </ul>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Create Manager Account
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManagerRegistrationForm;
