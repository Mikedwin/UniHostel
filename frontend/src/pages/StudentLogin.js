import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import API_URL from '../config';

const StudentLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, formData);
            
            if (res.data.user.role !== 'student') {
                setError('This login is for students only. Please use the manager login.');
                return;
            }
            
            login(res.data.user, res.data.token);
            navigate('/hostels');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#23817A' }}>
                        <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Student Login</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Find your perfect accommodation
                    </p>
                </div>
                
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input 
                                type="email" 
                                required 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none transition-colors" 
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                onFocus={(e) => e.target.style.borderColor = '#23817A'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    required 
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none transition-colors" 
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    onFocus={(e) => e.target.style.borderColor = '#23817A'}
                                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            <div className="text-right mt-1">
                                <Link to="/reset-password-inapp" className="text-xs" style={{ color: '#23817A' }}>
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full text-white py-2 px-4 rounded-md font-medium focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            style={{ backgroundColor: '#23817A' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a6159'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#23817A'}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/student-register" className="font-medium" style={{ color: '#23817A' }}>
                                Register as Student
                            </Link>
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                            Are you a hostel manager?{' '}
                            <Link to="/manager-login" style={{ color: '#23817A' }}>
                                Manager Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentLogin;