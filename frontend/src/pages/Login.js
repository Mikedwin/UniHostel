import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock } from 'lucide-react';
import API_URL from '../config';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, formData);
            login(res.data.user, res.data.token);
            const role = res.data.user.role;
            if (role === 'admin') navigate('/admin-dashboard');
            else if (role === 'manager') navigate('/manager-dashboard');
            else navigate('/hostels');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-from-gray-50 to-gray-100 flex">
            {/* Left Side - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ backgroundColor: '#23817A' }}>
                <div className="absolute inset-0 opacity-90" style={{ background: 'linear-gradient(to bottom right, #23817A, #1a6159)' }}></div>
                <img
                    src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                    alt="Student accommodation"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-white text-center">
                        <h1 className="text-5xl font-extrabold mb-4">Welcome Back!</h1>
                        <p className="text-xl" style={{ color: '#d1f0ed' }}>Sign in to access your UniHostel account</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#e6f5f4' }}>
                            <LogIn className="w-8 h-8" style={{ color: '#23817A' }} />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900">Sign In</h2>
                        <p className="mt-2 text-sm text-gray-600">Access your UniHostel account</p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none transition-colors"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    onFocus={(e) => e.target.style.borderColor = '#23817A'}
                                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none transition-colors"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    onFocus={(e) => e.target.style.borderColor = '#23817A'}
                                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-semibold rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#23817A' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a6159'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#23817A'}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-50 text-gray-500">New to UniHostel?</span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link
                                to="/student-register"
                                className="inline-flex items-center justify-center px-8 py-3 border text-base font-semibold rounded-lg bg-white transition-colors duration-200"
                                style={{ 
                                    borderColor: '#23817A',
                                    color: '#23817A'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6f5f4'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                Create Student Account
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link to="/" className="text-sm font-medium" style={{ color: '#23817A' }}>
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
