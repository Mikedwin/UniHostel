import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, formData);
            login(res.data.user, res.data.token);
            const role = res.data.user.role;
            if (role === 'admin') navigate('/admin-dashboard');
            else if (role === 'manager') navigate('/manager-dashboard');
            else navigate('/hostels');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">Login to UniHostel</h2>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                                onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                                onChange={e => setFormData({...formData, password: e.target.value})} />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-md font-bold hover:bg-primary-700 transition">
                        Sign In
                    </button>
                    <div className="text-center text-sm text-gray-500">
                        New here? <Link to="/register" className="text-primary-600 font-bold">Create account</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
