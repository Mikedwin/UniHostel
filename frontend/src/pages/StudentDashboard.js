import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, X, CreditCard, Key, Archive, RotateCcw, Trash2, Settings } from 'lucide-react';
import API_URL from '../config';
import Swal from 'sweetalert2';
import LoadingSpinner from '../components/LoadingSpinner';

const StudentDashboard = () => {
    const [applications, setApplications] = useState([]);
    const { token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'history'
    const [toast, setToast] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [newUpdates, setNewUpdates] = useState(0);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchApps = async () => {
        try {
            const archived = viewMode === 'history' ? 'true' : 'false';
            const res = await axios.get(`${API_URL}/api/applications/student?archived=${archived}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setApplications(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApps();
        
        const handleClick = () => {
            setContextMenu(null);
            setNewUpdates(0);
        };
        document.addEventListener('click', handleClick);
        
        return () => {
            document.removeEventListener('click', handleClick);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, viewMode]);

    const handleContextMenu = (e, app) => {
        e.preventDefault();
        setContextMenu({
            x: e.pageX,
            y: e.pageY,
            app: app
        });
    };

    const handleDeleteFromContext = async (appId) => {
        setContextMenu(null);
        const result = await Swal.fire({
            title: 'Move to History',
            text: 'Are you sure you want to move this application to history?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, move it',
            cancelButtonText: 'Cancel'
        });
        
        if (result.isConfirmed) {
            handleArchive(appId);
        }
    };

    const handleCancelApplication = async (appId) => {
        const result = await Swal.fire({
            title: 'Cancel Application',
            text: 'Are you sure you want to move this application to history?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, cancel it',
            cancelButtonText: 'No, keep it'
        });
        
        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/api/applications/${appId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showToast('Moved to history successfully');
                fetchApps();
            } catch (err) {
                console.error('Error cancelling application:', err);
                showToast('Failed to move to history', 'error');
            }
        }
    };

    const handleArchiveClick = async (appId) => {
        const result = await Swal.fire({
            title: 'Move to History',
            text: 'Are you sure you want to move this item to history?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, move it',
            cancelButtonText: 'Cancel'
        });
        
        if (result.isConfirmed) {
            try {
                await axios.patch(`${API_URL}/api/applications/${appId}/archive`, 
                    { archive: true },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showToast('Moved to history successfully');
                fetchApps();
            } catch (err) {
                console.error('Error archiving application:', err);
                showToast('Failed to move to history', 'error');
            }
        }
    };

    const handleArchive = async (appId) => {
        try {
            await axios.patch(`${API_URL}/api/applications/${appId}/archive`, 
                { archive: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast('Moved to history successfully');
            fetchApps();
        } catch (err) {
            console.error('Error archiving application:', err);
            showToast('Failed to move to history', 'error');
        }
    };

    const handleRestore = async (appId) => {
        try {
            await axios.patch(`${API_URL}/api/applications/${appId}/archive`, 
                { archive: false },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast('Restored successfully');
            fetchApps();
        } catch (err) {
            console.error('Error restoring application:', err);
            showToast('Failed to restore', 'error');
        }
    };

    const handleProceedToPayment = async (app) => {
        try {
            // First, recalculate payment amounts to ensure they're up to date
            console.log('Recalculating payment amounts...');
            const recalcResponse = await axios.patch(
                `${API_URL}/api/applications/${app._id}/recalculate`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            const updatedApp = recalcResponse.data.application;
            console.log('Updated application data:', {
                hostelFee: updatedApp.hostelFee,
                adminCommission: updatedApp.adminCommission,
                totalAmount: updatedApp.totalAmount,
                commissionPercent: recalcResponse.data.commissionPercent
            });
            
            const commissionPercent = recalcResponse.data.commissionPercent || '10.0';
            
            const result = await Swal.fire({
                title: 'Payment Breakdown',
                html: `
                    <div style="text-align: left; padding: 20px;">
                        <div style="margin-bottom: 15px;">
                            <strong>Hostel:</strong> ${updatedApp.hostelId?.name || app.hostelId?.name || 'N/A'}<br/>
                            <strong>Room Type:</strong> ${updatedApp.roomType}<br/>
                            <strong>Semester:</strong> ${updatedApp.semester}
                        </div>
                        <hr style="margin: 15px 0;"/>
                        <div style="margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>Room Price:</span>
                                <strong>GH₵${(updatedApp.hostelFee || 0).toFixed(2)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #666;">
                                <span>Platform Fee (${commissionPercent}%):</span>
                                <strong>GH₵${(updatedApp.adminCommission || 0).toFixed(2)}</strong>
                            </div>
                        </div>
                        <hr style="margin: 15px 0;"/>
                        <div style="display: flex; justify-content: space-between; font-size: 18px;">
                            <strong>Total Amount:</strong>
                            <strong style="color: #3b82f6;">GH₵${(updatedApp.totalAmount || 0).toFixed(2)}</strong>
                        </div>
                    </div>
                `,
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3b82f6',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Proceed to Payment',
                cancelButtonText: 'Cancel',
                width: '500px'
            });
            
            if (!result.isConfirmed) return;
            
            console.log('Initializing payment for application:', updatedApp._id);
            const response = await axios.post(`${API_URL}/api/payment/initialize`, 
                { applicationId: updatedApp._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log('Payment response:', response.data);
            const { reference, totalAmount } = response.data;
            
            // Use Paystack inline popup instead of redirect
            const handler = window.PaystackPop.setup({
                key: 'pk_live_eb0f80d31cbab0aea6cbf905036e6b3a096d888c',
                email: response.data.email || updatedApp.studentId?.email || app.studentId?.email,
                amount: totalAmount * 100,
                ref: reference,
                channels: ['card', 'mobile_money'],
                onClose: function() {
                    Swal.fire({
                        title: 'Payment Cancelled',
                        text: 'You closed the payment window',
                        icon: 'info',
                        confirmButtonColor: '#3b82f6'
                    });
                },
                callback: async function(response) {
                    console.log('Payment successful:', response);
                    try {
                        const verifyRes = await axios.get(
                            `${API_URL}/api/payment/verify/${response.reference}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        
                        if (verifyRes.data.success) {
                            await Swal.fire({
                                title: 'Payment Successful!',
                                text: 'Your payment has been confirmed. Awaiting final manager approval.',
                                icon: 'success',
                                confirmButtonColor: '#3b82f6'
                            });
                            fetchApps();
                        }
                    } catch (err) {
                        console.error('Verification error:', err);
                        Swal.fire({
                            title: 'Verification Error',
                            text: 'Payment may have succeeded but verification failed. Please check your dashboard.',
                            icon: 'warning',
                            confirmButtonColor: '#3b82f6'
                        });
                    }
                }
            });
            
            handler.openIframe();
        } catch (err) {
            console.error('Payment error:', err);
            console.error('Error response:', err.response);
            console.error('Error data:', err.response?.data);
            
            const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Payment initialization failed';
            const errorDetails = err.response?.data?.details || '';
            const errorHint = err.response?.data?.hint || '';
            
            let fullErrorMsg = errorMsg;
            if (errorDetails) {
                fullErrorMsg += `\n\nDetails: ${JSON.stringify(errorDetails)}`;
            }
            if (errorHint) {
                fullErrorMsg += `\n\n${errorHint}`;
            }
            
            Swal.fire({
                title: 'Payment Error',
                html: `<div style="text-align: left;">
                    <p><strong>Error:</strong> ${errorMsg}</p>
                    ${errorDetails ? `<p style="margin-top: 10px;"><strong>Details:</strong><br/><pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; overflow-x: auto;">${JSON.stringify(errorDetails, null, 2)}</pre></p>` : ''}
                    ${errorHint ? `<p style="margin-top: 10px; color: #666;"><em>${errorHint}</em></p>` : ''}
                </div>`,
                icon: 'error',
                confirmButtonColor: '#3b82f6',
                confirmButtonText: 'OK',
                width: '600px'
            });
        }
    };

    const canMoveToHistory = (app) => {
        // Students can archive: rejected, approved (completed), cancelled
        return app.status === 'rejected' || app.status === 'approved';
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
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
                    toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                } text-white flex items-center gap-2 animate-fade-in`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {toast.message}
                </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                        My Applications
                        {newUpdates > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                {newUpdates} new
                            </span>
                        )}
                    </h1>
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => setViewMode('active')}
                            className={`px-3 py-1 rounded text-sm font-medium ${
                                viewMode === 'active' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setViewMode('history')}
                            className={`px-3 py-1 rounded text-sm font-medium ${
                                viewMode === 'history' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            History
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/setup-security-question')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium border-2"
                    style={{ borderColor: '#23817A', color: '#23817A' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e6f5f4';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <Settings className="w-4 h-4" />
                    Security Question
                </button>
            </div>
            {loading ? (
                <LoadingSpinner message="Loading your applications..." />
            ) : applications.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <p className="text-gray-500 mb-4">You haven't applied for any hostels yet.</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
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
                                    <tr 
                                        key={app._id} 
                                        onContextMenu={(e) => viewMode === 'active' ? handleContextMenu(e, app) : null}
                                        className="hover:bg-gray-50 cursor-pointer"
                                    >
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
                                            {viewMode === 'history' ? (
                                                <button 
                                                    onClick={() => handleRestore(app._id)}
                                                    className="flex items-center gap-1 hover:bg-opacity-10 px-3 py-1 rounded text-xs font-medium" 
                                                    style={{ color: '#23817A', backgroundColor: 'rgba(35, 129, 122, 0.1)' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(35, 129, 122, 0.2)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(35, 129, 122, 0.1)'}
                                                    title="Restore to Active">
                                                    <RotateCcw className="w-3 h-3" />
                                                    Restore
                                                </button>
                                            ) : canMoveToHistory(app) ? (
                                                <button 
                                                    onClick={() => handleArchiveClick(app._id)}
                                                    className="flex items-center gap-1 text-gray-600 hover:bg-gray-50 px-3 py-1 rounded text-xs font-medium" 
                                                    title="Move to History">
                                                    <Archive className="w-3 h-3" />
                                                    Move to History
                                                </button>
                                            ) : app.status === 'approved_for_payment' ? (
                                                <button
                                                    onClick={() => handleProceedToPayment(app)}
                                                    className="text-white px-4 py-2 rounded flex items-center gap-2 font-semibold"
                                                    style={{ backgroundColor: '#23817A' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a6159'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#23817A'}
                                                >
                                                    <CreditCard className="w-4 h-4" />
                                                    Pay Now
                                                </button>
                                            ) : app.status === 'pending' ? (
                                                <button 
                                                    onClick={() => handleCancelApplication(app._id)}
                                                    className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-1 rounded text-xs font-medium" 
                                                    title="Cancel Application"
                                                >
                                                    <X className="w-3 h-3" />
                                                    Cancel
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

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {applications.map(app => (
                            <div key={app._id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{app.hostelId?.name || 'N/A'}</h3>
                                        <p className="text-xs text-gray-500">{app.hostelId?.location || 'N/A'}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${getStatusStyle(app.status)}`}>
                                        {getStatusIcon(app.status)}
                                        {getStatusText(app.status)}
                                    </span>
                                </div>
                                
                                <div className="space-y-2 mb-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Semester:</span>
                                        <span className="font-medium">{app.semester}</span>
                                    </div>
                                    {app.accessCode && (
                                        <div className="flex justify-between text-sm items-center">
                                            <span className="text-gray-600">Access Code:</span>
                                            <div className="flex items-center gap-1">
                                                <Key className="w-3 h-3 text-green-600" />
                                                <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{app.accessCode}</code>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-gray-200">
                                    {viewMode === 'history' ? (
                                        <button 
                                            onClick={() => handleRestore(app._id)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded font-medium"
                                            style={{ color: '#23817A', backgroundColor: 'rgba(35, 129, 122, 0.1)' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(35, 129, 122, 0.2)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(35, 129, 122, 0.1)'}
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Restore to Active
                                        </button>
                                    ) : canMoveToHistory(app) ? (
                                        <button 
                                            onClick={() => handleArchiveClick(app._id)}
                                            className="w-full flex items-center justify-center gap-2 text-gray-600 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded font-medium"
                                        >
                                            <Archive className="w-4 h-4" />
                                            Move to History
                                        </button>
                                    ) : app.status === 'approved_for_payment' ? (
                                        <button
                                            onClick={() => handleProceedToPayment(app)}
                                            className="w-full text-white px-4 py-3 rounded flex items-center justify-center gap-2 font-semibold"
                                            style={{ backgroundColor: '#23817A' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a6159'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#23817A'}
                                        >
                                            <CreditCard className="w-5 h-5" />
                                            Pay Now
                                        </button>
                                    ) : app.status === 'pending' ? (
                                        <button 
                                            onClick={() => handleCancelApplication(app._id)}
                                            className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded font-medium"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel Application
                                        </button>
                                    ) : app.status === 'paid_awaiting_final' ? (
                                        <div className="text-center text-orange-600 font-medium py-2">Awaiting Final Approval</div>
                                    ) : app.status === 'approved' ? (
                                        <div className="text-center text-green-600 font-medium py-2">Completed</div>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            
            {/* Context Menu */}
            {contextMenu && (
                <div 
                    className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-[180px]"
                    style={{ 
                        left: `${contextMenu.x}px`, 
                        top: `${contextMenu.y}px` 
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => handleDeleteFromContext(contextMenu.app._id)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-red-600"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="font-medium">Move to History</span>
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <div className="px-4 py-2 text-xs text-gray-500">
                        {contextMenu.app.hostelId?.name}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
