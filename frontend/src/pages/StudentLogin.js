import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import TurnstileWidget from '../components/security/TurnstileWidget';
import useTurnstileGate from '../utils/useTurnstileGate';

const StudentLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [infoMessage, setInfoMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        turnstileEnabled,
        turnstileResetKey,
        turnstileToken,
        setTurnstileToken,
        resetTurnstile,
        validateTurnstile
    } = useTurnstileGate();
    const redirectTo = location.state?.from?.pathname || '/hostels';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setInfoMessage('');
        
        try {
            if (!validateTurnstile(setError)) {
                return;
            }

            const res = await axios.post(API_ENDPOINTS.LOGIN, {
                ...formData,
                turnstileToken
            });

            if (res.data?.mfaRequired) {
                setError('This login is for students only. Please use the manager login.');
                return;
            }
            
            if (res.data.user.role !== 'student') {
                setError('This login is for students only. Please use the manager login.');
                return;
            }
            
            login(res.data.user, res.data.csrfToken, res.data.token);
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to sign in right now. Please try again later.');
        } finally {
            resetTurnstile();
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f3fbf9]">
            <div className="relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "linear-gradient(112deg, rgba(8,37,35,0.9) 0%, rgba(18,89,82,0.82) 45%, rgba(35,129,122,0.62) 100%), url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80')"
                    }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(188,255,239,0.18),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.10),transparent_28%)]" />
                <div className="relative max-w-6xl mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:px-8 lg:py-20">
                    <div className="hidden lg:flex flex-col justify-center text-white pr-4">
                        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-50">
                            <span className="h-2 w-2 rounded-full bg-emerald-300" />
                            Student access
                        </div>
                        <h1 className="mt-6 max-w-[11ch] text-5xl font-black leading-[0.96] tracking-tight">
                            Step back into your hostel search with clarity.
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-teal-50/92">
                            Browse verified student accommodation, track your application, and move from approval to payment without losing the flow.
                        </p>
                        <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
                            {['Verified hostels', 'Approval-first payment', 'Live dashboard updates'].map((item) => (
                                <div key={item} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mx-auto w-full max-w-md lg:max-w-none lg:pl-6">
                        <div className="rounded-[2rem] border border-white/25 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:p-8">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-700/25">
                                    <GraduationCap className="h-8 w-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight text-slate-950">Student Login</h2>
                                <p className="mt-2 text-sm text-slate-600">
                                    Pick up your housing journey and keep every step in view.
                                </p>
                            </div>

                    {error && (
                        <div className="mb-4 mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {infoMessage && (
                        <div className="mb-4 mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {infoMessage}
                        </div>
                    )}
                    
                    <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Email Address
                            </label>
                            <input 
                                type="email" 
                                required 
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100" 
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    required 
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-11 text-slate-900 shadow-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100" 
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            <div className="mt-2 text-right">
                                <Link to="/forgot-password?returnTo=/student-login" className="text-xs font-medium text-primary-700 hover:text-primary-800">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        {turnstileEnabled && (
                            <TurnstileWidget
                                action="login"
                                resetKey={turnstileResetKey}
                                onTokenChange={setTurnstileToken}
                                onError={setError}
                            />
                        )}
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex w-full items-center justify-center rounded-2xl bg-primary-600 px-4 py-3.5 font-medium text-white shadow-lg shadow-primary-700/20 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                        <p className="text-sm text-slate-600">
                            Don't have an account?{' '}
                            <Link to="/student-register" className="font-semibold text-primary-700 hover:text-primary-800">
                                Register as Student
                            </Link>
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                            Are you a hostel manager?{' '}
                            <Link to="/manager-login" className="font-medium text-primary-700 hover:text-primary-800">
                                Manager Login
                            </Link>
                        </p>
                    </div>
                </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentLogin;
