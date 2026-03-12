import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowLeft } from 'lucide-react';
import API_URL from '../config';

const SECURITY_QUESTIONS = [
    "What was the name of your first pet?",
    "What city were you born in?",
    "What is your mother's maiden name?",
    "What was the name of your elementary school?",
    "What is your favorite book?",
    "What was your childhood nickname?",
    "In what city did you meet your spouse/partner?",
    "What is the name of your favorite childhood friend?"
];

const SetupSecurityQuestion = () => {
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!securityQuestion || !securityAnswer) {
            setError('Please select a question and provide an answer');
            return;
        }

        if (securityAnswer.trim().length < 2) {
            setError('Answer must be at least 2 characters');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/set-security-question`, {
                securityQuestion,
                securityAnswer
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Security question set successfully!');
            setTimeout(() => navigate(-1), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to set security question');
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
                            <Shield className="w-8 h-8" style={{ color: '#23817A' }} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Setup Security Question</h2>
                        <p className="mt-2 text-sm text-gray-600">This will help you reset your password if you forget it</p>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select a Security Question</label>
                            <select
                                required
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none"
                                value={securityQuestion}
                                onChange={e => setSecurityQuestion(e.target.value)}
                                onFocus={(e) => e.target.style.borderColor = '#23817A'}
                                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            >
                                <option value="">-- Choose a question --</option>
                                {SECURITY_QUESTIONS.map((q, i) => (
                                    <option key={i} value={q}>{q}</option>
                                ))}
                            </select>
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
                            <p className="mt-1 text-xs text-gray-500">Remember this answer - it's case-insensitive</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-8 py-3.5 text-base font-semibold rounded-lg text-white transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                            style={{ backgroundColor: '#23817A' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a6159'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#23817A'}
                        >
                            {loading ? 'Saving...' : 'Save Security Question'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SetupSecurityQuestion;
