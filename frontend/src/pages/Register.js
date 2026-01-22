import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, formData);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'manager' ? '/manager-dashboard' : '/hostels');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Register as a student to find your perfect hostel
          </p>
        </div>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
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
            Register as Student
          </button>
          <div className="text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-primary-600 font-bold">Login</Link>
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Hostel Managers:</strong> Contact the administrator to create your manager account.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
