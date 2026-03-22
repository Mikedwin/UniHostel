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
    const [selectedApps, setSelectedApps] = useState([]);

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
            const apps = Array.isArray(res.data) ? res.data : [];

            const relevantApplicationIds = apps
                .filter((app) => app.status === 'approved_for_payment' && app.paymentStatus !== 'paid')
                .map((app) => app._id);

            let paymentStatuses = [];
            if (relevantApplicationIds.length > 0) {
                try {
                    const statusRes = await axios.post(
                        API_ENDPOINTS.PAYMENT_STATUS_BATCH,
                        { applicationIds: relevantApplicationIds },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    paymentStatuses = Array.isArray(statusRes.data?.statuses) ? statusRes.data.statuses : [];
                } catch (err) {
                    console.log('Batch payment status check failed');
                }
            }

            const paymentStatusMap = new Map(
                paymentStatuses.map((status) => [status.applicationId, status])
            );

            const updatedApps = apps.map((app) => (
                paymentStatusMap.has(app._id)
                    ? { ...app, ...paymentStatusMap.get(app._id) }
                    : app
            ));

            setApplications(updatedApps);
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
            // First check if payment status has changed
            const statusCheck = await axios.get(API_ENDPOINTS.PAYMENT_STATUS(app._id), {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!statusCheck.data.canPay) {
                Swal.fire('Payment Already Processed', 'This application has already been paid for.', 'info');
                fetchApps(); // Refresh to show updated status
                return;
            }
            
            const response = await axios.post(API_ENDPOINTS.PAYMENT_INITIALIZE, 
                { applicationId: app._id, email: user.email, amount: app.totalAmount },
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
                    axios.get(API_ENDPOINTS.PAYMENT_VERIFY(res.reference), 
                        { headers: { Authorization: `Bearer ${token}` } }
                    ).then(() => {
                        Swal.fire('Payment Successful!', 'Awaiting final manager approval.', 'success');
                        fetchApps();
                    });
                }
            });
            handler.openIframe();
        } catch (err) {
            if (err.response?.data?.message === 'Application already paid') {
                Swal.fire('Payment Already Processed', 'This application has already been paid for.', 'info');
                fetchApps(); // Refresh to show updated status
            } else {
                Swal.fire('Payment Error', err.response?.data?.message || 'Failed', 'error');
            }
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

    const handleRestoreFromHistory = async (appId) => {
        try {
            await axios.patch(`${API_ENDPOINTS.APPLICATIONS}/${appId}/archive`,
                { archive: false },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast('Application restored successfully', 'success');
            fetchApps();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to restore application', 'error');
        }
    };

    const handlePermanentDelete = async (appId, hostelName) => {
        const result = await Swal.fire({
            title: 'Delete Permanently?',
            html: `<p>Are you sure you want to <strong>permanently delete</strong> this application?</p>
                   <p class="text-sm text-gray-600 mt-2">Hostel: <strong>${hostelName}</strong></p>
                   <p class="text-red-600 font-semibold mt-3">⚠️ This action cannot be undone!</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Delete Permanently',
            cancelButtonText: 'Cancel',
            customClass: {
                confirmButton: 'px-4 py-2 rounded-md font-medium',
                cancelButton: 'px-4 py-2 rounded-md font-medium'
            }
        });
        
        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_ENDPOINTS.APPLICATIONS}/${appId}/permanent`, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Application has been permanently deleted.',
                    icon: 'success',
                    confirmButtonColor: '#23817A',
                    timer: 2000
                });
                fetchApps();
            } catch (err) {
                Swal.fire({
                    title: 'Error',
                    text: err.response?.data?.error || 'Failed to delete application',
                    icon: 'error',
                    confirmButtonColor: '#ef4444'
                });
            }
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
                    <button onClick={() => { setViewMode('active'); setSelectedApps([]); }} 
                        className={`px-3 py-1 rounded ${viewMode === 'active' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>
                        Active
                    </button>
                    <button onClick={() => { setViewMode('history'); setSelectedApps([]); }} 
                        className={`px-3 py-1 rounded ${viewMode === 'history' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>
                        History
                    </button>
                </div>
            </div>

            {selectedApps.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{selectedApps.length} selected</span>
                        {viewMode === 'active' ? (
                            <button
                                onClick={async () => {
                                    try {
                                        await Promise.all(selectedApps.map(id => 
                                            axios.patch(`${API_ENDPOINTS.APPLICATIONS}/${id}/archive`, 
                                                { archive: true },
                                                { headers: { Authorization: `Bearer ${token}` } }
                                            )
                                        ));
                                        showToast('Applications moved to history', 'success');
                                        setSelectedApps([]);
                                        fetchApps();
                                    } catch (err) {
                                        showToast('Some operations failed', 'error');
                                    }
                                }}
                                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                            >
                                Move Selected to History
                            </button>
                        ) : (
                            <button
                                onClick={async () => {
                                    const result = await Swal.fire({
                                        title: 'Delete Permanently?',
                                        html: `<p>Are you sure you want to <strong>permanently delete ${selectedApps.length} application(s)</strong>?</p>
                                               <p class="text-red-600 font-semibold mt-3">⚠️ This action cannot be undone!</p>`,
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonColor: '#ef4444',
                                        cancelButtonColor: '#6b7280',
                                        confirmButtonText: 'Yes, Delete Permanently',
                                        cancelButtonText: 'Cancel'
                                    });
                                    if (result.isConfirmed) {
                                        try {
                                            await Promise.all(selectedApps.map(id => 
                                                axios.delete(`${API_ENDPOINTS.APPLICATIONS}/${id}/permanent`, 
                                                    { headers: { Authorization: `Bearer ${token}` } }
                                                )
                                            ));
                                            Swal.fire({
                                                title: 'Deleted!',
                                                text: 'Applications permanently deleted.',
                                                icon: 'success',
                                                confirmButtonColor: '#23817A',
                                                timer: 2000
                                            });
                                            setSelectedApps([]);
                                            fetchApps();
                                        } catch (err) {
                                            Swal.fire({
                                                title: 'Error',
                                                text: 'Some deletions failed',
                                                icon: 'error',
                                                confirmButtonColor: '#ef4444'
                                            });
                                        }
                                    }
                                }}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                                Delete Selected Permanently
                            </button>
                        )}
                        <button
                            onClick={() => setSelectedApps([])}
                            className="text-gray-600 text-sm hover:underline"
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>
            )}

            {loading ? <LoadingSpinner message="Loading your applications..." fullScreen /> : applications.length === 0 ? (
                <div className="bg-white p-8 rounded-lg text-center">
                    <p className="text-gray-500">No applications yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.length > 0 && (
                        <div className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={selectedApps.length === applications.length}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedApps(applications.map(a => a._id));
                                    } else {
                                        setSelectedApps([]);
                                    }
                                }}
                                className="rounded"
                            />
                            <span className="text-sm text-gray-600">Select All</span>
                        </div>
                    )}
                    {applications.map(app => (
                        <div key={app._id} className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={selectedApps.includes(app._id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedApps([...selectedApps, app._id]);
                                        } else {
                                            setSelectedApps(selectedApps.filter(id => id !== app._id));
                                        }
                                    }}
                                    className="rounded mt-1"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <div>
                                            <h3 className="font-bold">{app.hostelId?.name}</h3>
                                            <p className="text-sm text-gray-500">{app.semester}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    {app.status === 'approved_for_payment' && viewMode === 'active' && (
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
                                    {viewMode === 'history' && (
                                        <div className="mt-3 flex gap-2">
                                            <button onClick={() => handleRestoreFromHistory(app._id)}
                                                className="flex-1 py-2 rounded flex items-center justify-center gap-2"
                                                style={{ color: '#23817A', backgroundColor: 'rgba(35, 129, 122, 0.1)' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(35, 129, 122, 0.2)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(35, 129, 122, 0.1)'}>
                                                Restore
                                            </button>
                                            <button onClick={() => handlePermanentDelete(app._id, app.hostelId?.name)}
                                                className="flex-1 bg-red-100 text-red-700 py-2 rounded hover:bg-red-200 font-medium">
                                                Delete Permanently
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
