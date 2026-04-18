import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Archive, KeyRound } from 'lucide-react';
import { API_ENDPOINTS, PAYSTACK_PUBLIC_KEY } from '../config/api';
import Swal from 'sweetalert2';
import LoadingSpinner from '../components/LoadingSpinner';
import { loadExternalScript } from '../utils/loadExternalScript';

const isConfiguredPaystackKey = (key) => /^pk_(test|live)_[\w-]+$/.test((key || '').trim());
const PAYSTACK_SCRIPT_ID = 'paystack-inline-script';
const PAYSTACK_SCRIPT_SRC = 'https://js.paystack.co/v1/inline.js';

const ensurePaystack = async () => {
    if (typeof window !== 'undefined' && window.PaystackPop?.setup) {
        return window.PaystackPop;
    }

    await loadExternalScript({
        id: PAYSTACK_SCRIPT_ID,
        src: PAYSTACK_SCRIPT_SRC
    });

    if (typeof window !== 'undefined' && window.PaystackPop?.setup) {
        return window.PaystackPop;
    }

    throw new Error('Paystack failed to initialize');
};

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
            if (!isConfiguredPaystackKey(PAYSTACK_PUBLIC_KEY)) {
                Swal.fire(
                    'Payment unavailable',
                    'Paystack is not configured for this frontend deployment. Set VITE_PAYSTACK_PUBLIC_KEY in Vercel and redeploy.',
                    'error'
                );
                return;
            }

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

            const paystack = await ensurePaystack();
            
            const handler = paystack.setup({
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
            text: `Are you sure you want to permanently delete this application for ${hostelName || 'this hostel'}? This action cannot be undone.`,
            html: undefined,
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
        <div className="min-h-screen bg-[linear-gradient(180deg,#f3fbf9_0%,#ffffff_24%,#f8fbfb_100%)]">
        <div className="max-w-7xl mx-auto px-4 py-8">
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
                    toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                } text-white flex items-center gap-2`}>
                    {toast.message}
                </div>
            )}
            
            <div className="mb-8 rounded-[2rem] border border-emerald-100/70 bg-[linear-gradient(135deg,#ffffff_0%,#f3fbf9_100%)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary-600">Student dashboard</p>
                    <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">My Applications</h1>
                    <p className="mt-2 text-sm text-slate-600">Track approvals, payment status, and final access details in one place.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Link
                        to="/change-password"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
                    >
                        <KeyRound className="w-4 h-4" />
                        Change Password
                    </Link>
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
            </div>
            </div>

            {selectedApps.length > 0 && (
                <div className="mb-4 rounded-[1.5rem] border border-slate-200 bg-white/90 p-3 shadow-sm sm:p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                        <span className="text-sm font-medium text-gray-600">
                            {selectedApps.length} {selectedApps.length === 1 ? 'application selected' : 'applications selected'}
                        </span>
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
                                className="w-full rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 sm:w-auto"
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
                                        cancelButtonText: 'Cancel',
                                        text: `Are you sure you want to permanently delete ${selectedApps.length} application(s)? This action cannot be undone.`,
                                        html: undefined
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
                                className="w-full rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 sm:w-auto"
                            >
                                Delete Selected Permanently
                            </button>
                        )}
                        <button
                            onClick={() => setSelectedApps([])}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:w-auto"
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>
            )}

            {loading ? <LoadingSpinner message="Loading your applications..." fullScreen /> : applications.length === 0 ? (
                <div className="rounded-[1.75rem] border border-white/70 bg-white p-8 text-center shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
                    <p className="text-gray-500">No applications yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.length > 0 && (
                        <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/70 bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
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
                        <div key={app._id} className="rounded-[1.75rem] border border-white/70 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
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
                                    {app.status === 'approved' && (
                                        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700">
                                            <span className="font-semibold text-green-700">Final Approval Details:</span>
                                            <span>
                                                <span className="text-gray-500">Student:</span>{' '}
                                                <span className="font-semibold text-gray-900">{app.studentName || user?.name || 'Student'}</span>
                                            </span>
                                            <span>
                                                <span className="text-gray-500">Semester:</span>{' '}
                                                <span className="font-semibold text-gray-900">{app.semester}</span>
                                            </span>
                                            <span>
                                                <span className="text-gray-500">Access Code:</span>{' '}
                                                <span className="font-semibold text-gray-900">{app.accessCode || 'Pending issuance'}</span>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        </div>
    );
};

export default StudentDashboard;
