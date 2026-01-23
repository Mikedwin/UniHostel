import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Check, X, Plus, Edit, Trash2, Search, Eye, TrendingUp, Users, Home, Clock, BarChart3, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import API_URL from '../config';
import ManagerAnalytics from '../components/manager/ManagerAnalytics';
import ManagerTransactions from '../components/manager/ManagerTransactions';
import Swal from 'sweetalert2';
import LoadingSpinner from '../components/LoadingSpinner';

const ManagerDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [hostels, setHostels] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'history'
    
    // Filter states
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedApps, setSelectedApps] = useState([]);
    const [toast, setToast] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [newUpdates, setNewUpdates] = useState(0);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleContextMenu = (e, app) => {
        e.preventDefault();
        if (viewMode === 'active' && (app.status === 'approved' || app.status === 'rejected')) {
            setContextMenu({
                x: e.pageX,
                y: e.pageY,
                app: app
            });
        }
    };

    const handleArchiveFromContext = async (appId) => {
        setContextMenu(null);
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
            handleArchive(appId, true);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const archived = viewMode === 'history' ? 'true' : 'false';
            const [appRes, hostRes] = await Promise.all([
                axios.get(`${API_URL}/api/applications/manager?archived=${archived}`, { 
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 30000
                }),
                axios.get(`${API_URL}/api/hostels/my-listings`, { 
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 30000
                })
            ]);
            
            setApplications(appRes.data || []);
            setHostels(hostRes.data || []);
            setUserInfo(user);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError(err.response?.data?.error || err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
        
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

    const handleArchive = async (id, archive) => {
        try {
            await axios.patch(`${API_URL}/api/applications/${id}/archive`, 
                { archive }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast(archive ? 'Moved to history successfully' : 'Restored successfully');
            fetchData();
        } catch (err) {
            console.error(err);
            showToast('Operation failed', 'error');
        }
    };

    const handleStatusUpdate = async (id, action) => {
        try {
            const response = await axios.patch(`${API_URL}/api/applications/${id}/status`, 
                { action }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data.error) {
                Swal.fire({
                    title: 'Error',
                    text: response.data.error,
                    icon: 'error',
                    confirmButtonColor: '#3b82f6'
                });
                return;
            }
            
            if (action === 'final_approve' && response.data.accessCode) {
                showToast(`Application approved! Access Code: ${response.data.accessCode}`);
            } else {
                showToast('Application updated successfully');
            }
            
            fetchData();
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.error || 'Failed to update application status';
            showToast(errorMsg, 'error');
        }
    };

    const handleDeleteHostel = async (id, name) => {
        const result = await Swal.fire({
            title: 'Delete Hostel',
            text: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel'
        });
        
        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/api/hostels/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchData();
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Hostel has been deleted.',
                    icon: 'success',
                    confirmButtonColor: '#3b82f6',
                    timer: 2000
                });
            } catch (err) {
                console.error('Error deleting hostel:', err);
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to delete hostel',
                    icon: 'error',
                    confirmButtonColor: '#3b82f6'
                });
            }
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedApps.length === 0) return;
        const actionText = action === 'approve_for_payment' ? 'Approve for Payment' : 'Reject';
        
        const result = await Swal.fire({
            title: `${actionText} Applications`,
            text: `${actionText} ${selectedApps.length} application(s)?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, proceed',
            cancelButtonText: 'Cancel'
        });
        
        if (result.isConfirmed) {
            try {
                const results = await Promise.allSettled(selectedApps.map(id => 
                    axios.patch(`${API_URL}/api/applications/${id}/status`, { action }, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ));
                
                const failed = results.filter(r => r.status === 'rejected');
                if (failed.length > 0) {
                    const errors = failed.map(f => f.reason?.response?.data?.error || 'Unknown error').join(', ');
                    Swal.fire({
                        title: 'Some Actions Failed',
                        text: errors,
                        icon: 'error',
                        confirmButtonColor: '#3b82f6'
                    });
                } else {
                    Swal.fire({
                        title: 'Success!',
                        text: 'All applications updated successfully',
                        icon: 'success',
                        confirmButtonColor: '#3b82f6',
                        timer: 2000
                    });
                }
                
                setSelectedApps([]);
                fetchData();
            } catch (err) {
                console.error('Bulk action error:', err);
                Swal.fire({
                    title: 'Error',
                    text: 'Some actions failed',
                    icon: 'error',
                    confirmButtonColor: '#3b82f6'
                });
            }
        }
    };

    const filteredApplications = useMemo(() => {
        return applications.filter(app => {
            const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
            const matchesSearch = !searchQuery || 
                app.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.studentId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.contactNumber?.includes(searchQuery);
            return matchesStatus && matchesSearch;
        });
    }, [applications, statusFilter, searchQuery]);

    const stats = useMemo(() => {
        const totalApps = applications.length;
        const pending = applications.filter(a => a.status === 'pending').length;
        const approved = applications.filter(a => a.status === 'approved').length;
        const rejected = applications.filter(a => a.status === 'rejected').length;
        const totalCapacity = hostels.reduce((sum, h) => sum + h.roomTypes.reduce((s, r) => s + r.totalCapacity, 0), 0);
        const totalOccupied = hostels.reduce((sum, h) => sum + h.roomTypes.reduce((s, r) => s + (r.occupiedCapacity || 0), 0), 0);
        const occupancyRate = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : 0;
        const activeHostels = hostels.filter(h => h.isActive !== false).length;
        const inactiveHostels = hostels.length - activeHostels;
        
        return { totalApps, pending, approved, rejected, totalHostels: hostels.length, activeHostels, inactiveHostels, occupancyRate, totalCapacity, totalOccupied };
    }, [applications, hostels]);

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
            
            {/* Pending Verification Banner */}
            {userInfo && !userInfo.isVerified && userInfo.accountStatus === 'pending_verification' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Account Pending Verification</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>Your manager account is awaiting admin approval. You cannot create or manage hostels until your account is verified. This usually takes 24-48 hours.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        Manager Dashboard
                        {newUpdates > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                {newUpdates} new
                            </span>
                        )}
                    </h1>
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeTab === 'dashboard'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                                activeTab === 'analytics'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab('transactions')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                                activeTab === 'transactions'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <DollarSign className="w-4 h-4" />
                            Transactions
                        </button>
                    </div>
                </div>
                <Link to="/add-hostel" className="w-full sm:w-auto bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-2" />
                    List New Hostel
                </Link>
            </div>

            {loading && (
                <LoadingSpinner message="Loading your dashboard..." />
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    <p className="font-semibold">Error loading dashboard</p>
                    <p className="text-sm">{error}</p>
                    <button 
                        onClick={fetchData}
                        className="mt-2 text-sm underline hover:no-underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {!loading && !error && (
                <>
                {activeTab === 'analytics' ? (
                    <ManagerAnalytics applications={applications} hostels={hostels} />
                ) : activeTab === 'transactions' ? (
                    <ManagerTransactions token={token} hostels={hostels} />
                ) : (
                <>
                {/* KPI Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Total Hostels */}
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg shadow-md p-5 border border-purple-100 hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Total Hostels</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalHostels}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <Home className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{stats.activeHostels} Active</span>
                            {stats.inactiveHostels > 0 && (
                                <span className="ml-2 text-gray-500">{stats.inactiveHostels} Inactive</span>
                            )}
                        </div>
                    </div>

                    {/* Total Applications */}
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-md p-5 border border-blue-100 hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Applications</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalApps}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">{stats.pending} Pending</span>
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{stats.approved} Approved</span>
                            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">{stats.rejected} Rejected</span>
                        </div>
                    </div>

                    {/* Occupancy Rate */}
                    <div className="bg-gradient-to-br from-green-50 to-white rounded-lg shadow-md p-5 border border-green-100 hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Occupancy Rate</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.occupancyRate}%</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all ${
                                        stats.occupancyRate >= 90 ? 'bg-red-500' :
                                        stats.occupancyRate >= 70 ? 'bg-yellow-500' :
                                        'bg-green-500'
                                    }`}
                                    style={{ width: `${stats.occupancyRate}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-600">{stats.totalOccupied} / {stats.totalCapacity} slots filled</p>
                        </div>
                    </div>

                    {/* Pending Actions */}
                    <div className="bg-gradient-to-br from-yellow-50 to-white rounded-lg shadow-md p-5 border border-yellow-100 hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Pending Actions</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
                            </div>
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600">
                            {stats.pending === 0 ? 'All caught up!' : `${stats.pending} application${stats.pending > 1 ? 's' : ''} awaiting review`}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                    <div className="lg:col-span-7">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-lg font-bold">Incoming Applications</h2>
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
                        {stats.pending > 0 && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
                                {stats.pending} Pending
                            </span>
                        )}
                    </div>
                    
                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search student..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved_for_payment">Approved for Payment</option>
                                <option value="paid_awaiting_final">Paid - Awaiting Final</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        {selectedApps.length > 0 && (
                            <div className="mt-4 flex items-center gap-3">
                                <span className="text-sm text-gray-600">{selectedApps.length} selected</span>
                                <button
                                    onClick={() => handleBulkAction('approve_for_payment')}
                                    className="text-white px-3 py-1 rounded text-sm"
                                    style={{ backgroundColor: '#23817A' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a6159'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#23817A'}
                                >
                                    Approve for Payment
                                </button>
                                <button
                                    onClick={() => handleBulkAction('reject')}
                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                >
                                    Reject All
                                </button>
                                <button
                                    onClick={() => setSelectedApps([])}
                                    className="text-gray-600 text-sm hover:underline"
                                >
                                    Clear
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {filteredApplications.length === 0 ? (
                            <p className="p-8 text-gray-500 text-center">
                                {applications.length === 0 ? 'No applications yet.' : 'No applications match your filters.'}
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedApps.length === filteredApplications.filter(a => a.status === 'pending').length && filteredApplications.filter(a => a.status === 'pending').length > 0}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedApps(filteredApplications.filter(a => a.status === 'pending').map(a => a._id));
                                                        } else {
                                                            setSelectedApps([]);
                                                        }
                                                    }}
                                                    className="rounded"
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredApplications.map(app => (
                                            <tr 
                                                key={app._id} 
                                                className="hover:bg-gray-50"
                                                onContextMenu={(e) => handleContextMenu(e, app)}
                                            >
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {app.status === 'pending' && (
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
                                                            className="rounded"
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{app.studentName || app.studentId?.name}</div>
                                                    <div className="text-xs text-gray-500">{app.studentId?.email}</div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {app.contactNumber}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {app.hostelId?.name}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {app.roomType}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {app.semester}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${
                                                        app.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        app.status === 'approved_for_payment' ? 'bg-blue-100 text-blue-700' :
                                                        app.status === 'paid_awaiting_final' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {app.status === 'approved_for_payment' ? 'APPROVED - AWAITING PAYMENT' :
                                                         app.status === 'paid_awaiting_final' ? 'PAID - AWAITING FINAL' :
                                                         app.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    <div className="flex space-x-2">
                                                        <button 
                                                            onClick={() => { setSelectedApp(app); setShowDetailsModal(true); }}
                                                            className="text-blue-600 hover:bg-blue-50 p-1 rounded" title="View Details">
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        {app.status === 'pending' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => handleStatusUpdate(app._id, 'approve_for_payment')}
                                                                    className="text-blue-600 hover:bg-blue-50 p-1 rounded" title="Approve for Payment">
                                                                    <Check className="w-5 h-5" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleStatusUpdate(app._id, 'reject')}
                                                                    className="text-red-600 hover:bg-red-50 p-1 rounded" title="Reject">
                                                                    <X className="w-5 h-5" />
                                                                </button>
                                                            </>
                                                        )}
                                                        {app.status === 'paid_awaiting_final' && (
                                                            <button 
                                                                onClick={() => handleStatusUpdate(app._id, 'final_approve')}
                                                                className="text-green-600 hover:bg-green-50 px-3 py-1 rounded text-sm font-medium" 
                                                                title="Final Approve">
                                                                Final Approve
                                                            </button>
                                                        )}
                                                        {viewMode === 'active' && (app.status === 'approved' || app.status === 'rejected') && (
                                                            <button 
                                                                onClick={async () => {
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
                                                                        handleArchive(app._id, true);
                                                                    }
                                                                }}
                                                                className="text-gray-600 hover:bg-gray-50 px-3 py-1 rounded text-xs font-medium" 
                                                                title="Move to History">
                                                                Move to History
                                                            </button>
                                                        )}
                                                        {viewMode === 'history' && (
                                                            <button 
                                                                onClick={() => handleArchive(app._id, false)}
                                                                className="px-3 py-1 rounded text-xs" 
                                                                style={{ color: '#23817A', backgroundColor: 'rgba(35, 129, 122, 0.1)' }}
                                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(35, 129, 122, 0.2)'}
                                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(35, 129, 122, 0.1)'}
                                                                title="Restore to Active">
                                                                Restore
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">My Listings</h2>
                        {hostels.length > 0 && (
                            <span className="text-xs text-gray-500">{hostels.length} {hostels.length === 1 ? 'Hostel' : 'Hostels'}</span>
                        )}
                    </div>
                    {hostels.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                            <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 mb-4">No hostels listed yet</p>
                            <Link to="/add-hostel" className="inline-flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
                                <Plus className="w-4 h-4 mr-2" />
                                List Your First Hostel
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {hostels.map(hostel => {
                                const totalCapacity = hostel.roomTypes?.reduce((sum, r) => sum + r.totalCapacity, 0) || 0;
                                const totalOccupied = hostel.roomTypes?.reduce((sum, r) => sum + (r.occupiedCapacity || 0), 0) || 0;
                                const occupancyPercent = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(0) : 0;
                                
                                return (
                                    <div key={hostel._id} className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow">
                                        {/* Hostel Header with Image */}
                                        {hostel.hostelViewImage && (
                                            <div className="relative h-32 overflow-hidden rounded-t-lg">
                                                <img src={hostel.hostelViewImage} alt={hostel.name} className="w-full h-full object-cover" />
                                                <div className="absolute top-2 right-2 flex gap-2">
                                                    <Link 
                                                        to={`/edit-hostel/${hostel._id}`}
                                                        className="bg-white text-blue-600 hover:bg-blue-50 p-2 rounded-full shadow-md" 
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteHostel(hostel._id, hostel.name)}
                                                        className="bg-white text-red-600 hover:bg-red-50 p-2 rounded-full shadow-md" 
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Hostel Info */}
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900 text-lg mb-1">{hostel.name}</h3>
                                                    <p className="text-sm text-gray-500 flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                        </svg>
                                                        {hostel.location}
                                                    </p>
                                                </div>
                                                {!hostel.hostelViewImage && (
                                                    <div className="flex gap-2">
                                                        <Link 
                                                            to={`/edit-hostel/${hostel._id}`}
                                                            className="text-blue-600 hover:bg-blue-50 p-1.5 rounded" 
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteHostel(hostel._id, hostel.name)}
                                                            className="text-red-600 hover:bg-red-50 p-1.5 rounded" 
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Occupancy Bar */}
                                            <div className="mb-3">
                                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                    <span>Occupancy</span>
                                                    <span className="font-semibold">{totalOccupied}/{totalCapacity} ({occupancyPercent}%)</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full transition-all ${
                                                            occupancyPercent >= 90 ? 'bg-red-500' :
                                                            occupancyPercent >= 70 ? 'bg-yellow-500' :
                                                            'bg-green-500'
                                                        }`}
                                                        style={{ width: `${occupancyPercent}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            
                                            {/* Room Types */}
                                            <div className="space-y-2">
                                                {hostel.roomTypes?.sort((a, b) => {
                                                    const order = {'1 in a Room': 1, '2 in a Room': 2, '3 in a Room': 3, '4 in a Room': 4};
                                                    return (order[a.type] || 99) - (order[b.type] || 99);
                                                }).map((room, idx) => {
                                                    const roomOccupancy = room.totalCapacity > 0 ? ((room.occupiedCapacity || 0) / room.totalCapacity * 100).toFixed(0) : 0;
                                                    return (
                                                        <div key={idx} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="font-semibold text-sm text-gray-900">{room.type}</span>
                                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                                            room.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                                        }`}>
                                                                            {room.available ? 'Available' : 'Full'}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500">
                                                                        {room.occupiedCapacity || 0}/{room.totalCapacity} occupied ({roomOccupancy}%)
                                                                    </p>
                                                                </div>
                                                                <span className="text-primary-700 font-bold text-sm whitespace-nowrap">GH₵{room.price}/sem</span>
                                                            </div>
                                                            {room.facilities && room.facilities.length > 0 && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {room.facilities.slice(0, 4).map((f, i) => (
                                                                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{f}</span>
                                                                    ))}
                                                                    {room.facilities.length > 4 && (
                                                                        <span className="text-xs text-gray-500">+{room.facilities.length - 4} more</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                </div>
                
                {/* Application Details Modal */}
                {showDetailsModal && selectedApp && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold">Application Details</h3>
                                    <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Student Name</p>
                                            <p className="font-semibold">{selectedApp.studentName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="font-semibold">{selectedApp.studentId?.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Contact Number</p>
                                            <p className="font-semibold">{selectedApp.contactNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Status</p>
                                            <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full uppercase ${
                                                selectedApp.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                                selectedApp.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                selectedApp.status === 'approved_for_payment' ? 'bg-blue-100 text-blue-700' :
                                                selectedApp.status === 'paid_awaiting_final' ? 'bg-orange-100 text-orange-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {selectedApp.status === 'approved_for_payment' ? 'APPROVED - AWAITING PAYMENT' :
                                                 selectedApp.status === 'paid_awaiting_final' ? 'PAID - AWAITING FINAL' :
                                                 selectedApp.status}
                                            </span>
                                        </div>
                                        {selectedApp.accessCode && (
                                            <div>
                                                <p className="text-sm text-gray-600">Access Code</p>
                                                <code className="bg-gray-100 px-3 py-2 rounded font-mono text-sm">{selectedApp.accessCode}</code>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm text-gray-600">Hostel</p>
                                            <p className="font-semibold">{selectedApp.hostelId?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Location</p>
                                            <p className="font-semibold">{selectedApp.hostelId?.location}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Room Type</p>
                                            <p className="font-semibold">{selectedApp.roomType}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Semester</p>
                                            <p className="font-semibold">{selectedApp.semester}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Applied On</p>
                                            <p className="font-semibold">{new Date(selectedApp.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    
                                    {selectedApp.message && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">Message</p>
                                            <p className="bg-gray-50 p-3 rounded border">{selectedApp.message}</p>
                                        </div>
                                    )}
                                    
                                    {selectedApp.status === 'pending' && (
                                        <div className="flex gap-3 pt-4 border-t">
                                            <button
                                                onClick={() => {
                                                    handleStatusUpdate(selectedApp._id, 'approve_for_payment');
                                                    setShowDetailsModal(false);
                                                }}
                                                className="flex-1 text-white px-4 py-2 rounded"
                                                style={{ backgroundColor: '#23817A' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a6159'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#23817A'}
                                            >
                                                Approve for Payment
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleStatusUpdate(selectedApp._id, 'reject');
                                                    setShowDetailsModal(false);
                                                }}
                                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                            >
                                                Reject Application
                                            </button>
                                        </div>
                                    )}
                                    {selectedApp.status === 'paid_awaiting_final' && (
                                        <div className="pt-4 border-t">
                                            <button
                                                onClick={() => {
                                                    handleStatusUpdate(selectedApp._id, 'final_approve');
                                                    setShowDetailsModal(false);
                                                }}
                                                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                            >
                                                Final Approve & Issue Access Code
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                </>
                )}
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
                        onClick={() => handleArchiveFromContext(contextMenu.app._id)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-700"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="font-medium">Move to History</span>
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <div className="px-4 py-2 text-xs text-gray-500">
                        {contextMenu.app.studentName} - {contextMenu.app.hostelId?.name}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerDashboard;
