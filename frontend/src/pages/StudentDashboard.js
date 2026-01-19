import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle, XCircle, X, CreditCard, Key } from 'lucide-react';
import API_URL from '../config';

const StudentDashboard = () => {
    const [applications, setApplications] = useState([]);
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/applications/student`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setApplications(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, [token]);

    const handleCancelApplication = async (appId) => {
        if (window.confirm('Are you sure you want to cancel this application?')) {
            try {
                await axios.delete(`${API_URL}/api/applications/${appId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Refresh the list
                const res = await axios.get(`${API_URL}/api/applications/student`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setApplications(res.data);
            } catch (err) {
                console.error('Error cancelling application:', err);
            }
        }
    };

    const handleProceedToPayment = async (applicationId) => {
        try {
            const response = await axios.post(`${API_URL}/api/payment/initialize`, 
                { applicationId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const { authorizationUrl } = response.data;
            window.location.href = authorizationUrl;
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Payment initialization failed');
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'approved': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            case 'approved_for_payment': return 'bg-blue-100 text-blue-700';
            case 'paid_awaiting_final': return 'bg-orange-100 text-orange-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'approved': return 'APPROVED';
            case 'rejected': return 'REJECTED';
            case 'approved_for_payment': return 'APPROVED - PAY NOW';
            case 'paid_awaiting_final': return 'PAID - AWAITING FINAL';
            case 'pending': return 'PENDING';
            default: return status.toUpperCase();
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'approved': return <CheckCircle className="w-4 h-4 mr-1" />;
            case 'rejected': return <XCircle className="w-4 h-4 mr-1" />;
            default: return <Clock className="w-4 h-4 mr-1" />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">My Applications</h1>
            {loading ? (
                <p>Loading...</p>
            ) : applications.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <p className="text-gray-500 mb-4">You haven't applied for any hostels yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {applications.map(app => (
                                <tr key={app._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{app.hostelId?.name || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">{app.hostelId?.location || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.semester}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${getStatusStyle(app.status)}`}>
                                            {getStatusIcon(app.status)}
                                            {getStatusText(app.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {app.accessCode ? (
                                            <div className="flex items-center gap-2">
                                                <Key className="w-4 h-4 text-green-600" />
                                                <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{app.accessCode}</code>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {app.status === 'approved_for_payment' ? (
                                            <button
                                                onClick={() => handleProceedToPayment(app._id)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 font-semibold"
                                            >
                                                <CreditCard className="w-4 h-4" />
                                                Pay Now
                                            </button>
                                        ) : app.status === 'pending' ? (
                                            <button 
                                                onClick={() => handleCancelApplication(app._id)}
                                                className="text-red-600 hover:bg-red-50 p-2 rounded-full" 
                                                title="Cancel Application"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        ) : app.status === 'paid_awaiting_final' ? (
                                            <span className="text-orange-600 text-xs font-medium">Awaiting Final Approval</span>
                                        ) : app.status === 'approved' ? (
                                            <span className="text-green-600 text-xs font-medium">Completed</span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
