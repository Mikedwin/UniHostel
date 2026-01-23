import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import API_URL from '../config';

const StudentRegister = () => {
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        confirmPassword: '',
        role: 'student' 
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return;
            }
            
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters long');
                return;
            }
            
            const { confirmPassword, ...submitData } = formData;
            console.log('Submitting registration data:', submitData);
            
            const res = await axios.post(`${API_URL}/api/auth/register`, submitData);
            console.log('Registration response:', res.data);
            
            login(res.data.user, res.data.token);
            navigate('/hostels');
        } catch (err) {
            console.error('Registration error:', err);
            console.error('Error response:', err.response?.data);
            setError(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
                        <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Student Registration</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Create your account to find accommodation
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
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" 
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input 
                                    type="email" 
                                    required 
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" 
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})} 
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    required 
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" 
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})} 
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
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input 
                                    type={showConfirmPassword ? "text" : "password"}
                                    required 
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors" 
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/student-login" className="text-primary-600 font-medium hover:text-primary-500">
                                Sign In
                            </Link>
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                            Are you a hostel manager?{' '}
                            <Link to="/manager-register" className="text-primary-600 hover:text-primary-500">
                                Manager Registration
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentRegister;