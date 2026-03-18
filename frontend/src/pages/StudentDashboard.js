import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Archive } from 'lucide-react';
import { API_ENDPOINTS, PAYSTACK_PUBLIC_KEY } from '../config/api';
import Swal from 'sweetalert2';
import LoadingSpinner from '../components/LoadingSpinner';

const StudentDashboard = () => {
    const [applications, setApplications] = useState([]);
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('active');
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchApps = async () => {
        try {
            const archived = viewMode === 'history' ? 'true' : 'false';
            const res = await axios.get(API_ENDPOINTS.STUDENT_APPLICATIONS + `?archived=${archived}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Ensure data is always an array
            setApplications(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApps();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, viewMode]);

    const handleProceedToPayment = async (app) => {
        try {
            const response = await axios.post(API_ENDPOINTS.PAYMENT_INITIALIZE, 
                { application_id: app._id, email: user.email, amount: app.totalAmount },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const handler = window.PaystackPop.setup({
                key: PAYSTACK_PUBLIC_KEY,
                email: user.email,
                amount: app.totalAmount * 100,
                currency: 'GHS',
                ref: response.data.reference,
                channels: ['card', 'mobile_money'],
                onClose: () => Swal.fire('Payment Cancelled', 'You closed the payment window', 'info'),
                callback: (res) => {
                    axios.post(API_ENDPOINTS.PAYMENT_VERIFY, { reference: res.reference }, 
                        { headers: { Authorization: `Bearer ${token}` } }
                    ).then(() => {
                        Swal.fire('Payment Successful!', 'Awaiting final manager approval.', 'success');
                        fetchApps();
                    });
                }
            });
            handler.openIframe();
        } catch (err) {
            Swal.fire('Payment Error', err.response?.data?.message || 'Failed', 'error');
        }
    };

    const handleMoveToHistory = async (appId) => {
        try {
            await axios.patch(`${API_ENDPOINTS.APPLICATIONS}/${appId}/archive`, 
                { archive: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast('Application moved to history', 'success');
            fetchApps();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to archive', 'error');
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

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
                    toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                } text-white flex items-center gap-2`}>
                    {toast.message}
                </div>
            )}
            
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">My Applications</h1>
                <div className="flex gap-2">
                    <button onClick={() => setViewMode('active')} 
                        className={`px-3 py-1 rounded ${viewMode === 'active' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>
                        Active
                    </button>
                    <button onClick={() => setViewMode('history')} 
                        className={`px-3 py-1 rounded ${viewMode === 'history' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>
                        History
                    </button>
                </div>
            </div>

            {loading ? <LoadingSpinner /> : applications.length === 0 ? (
                <div className="bg-white p-8 rounded-lg text-center">
                    <p className="text-gray-500">No applications yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map(app => (
                        <div key={app._id} className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex justify-between">
                                <div>
                                    <h3 className="font-bold">{app.hostelId?.name}</h3>
                                    <p className="text-sm text-gray-500">{app.semester}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(app.status)}`}>
                                    {app.status}
                                </span>
                            </div>
                            {app.status === 'approved_for_payment' && (
                                <div className="mt-3 flex gap-2">
                                    <button onClick={() => handleProceedToPayment(app)}
                                        className="flex-1 bg-primary-600 text-white py-2 rounded flex items-center justify-center gap-2">
                                        <CreditCard size={16} /> Pay Now
                                    </button>
                                    <button onClick={() => handleMoveToHistory(app._id)}
                                        className="px-4 bg-gray-200 text-gray-700 py-2 rounded flex items-center gap-2 hover:bg-gray-300">
                                        <Archive size={16} /> Move to History
                                    </button>
                                </div>
                            )}
                            {(app.status === 'pending' || app.status === 'rejected') && viewMode === 'active' && (
                                <div className="mt-3">
                                    <button onClick={() => handleMoveToHistory(app._id)}
                                        className="w-full bg-gray-200 text-gray-700 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-300">
                                        <Archive size={16} /> Move to History
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
