import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Building2, FileText, Activity } from 'lucide-react';
import API_URL from '../config';
import UserManagementTable from '../components/admin/UserManagementTable';
import UserActionModal from '../components/admin/UserActionModal';
import UserDetailsModal from '../components/admin/UserDetailsModal';
import ApplicationManagementTable from '../components/admin/ApplicationManagementTable';
import ApplicationDetailsModal from '../components/admin/ApplicationDetailsModal';
import ApplicationActionModal from '../components/admin/ApplicationActionModal';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import AdminTransactions from '../components/admin/AdminTransactions';
import ManagerRegistrationForm from '../components/admin/ManagerRegistrationForm';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [hostels, setHostels] = useState([]);
    const [managers, setManagers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [appModalOpen, setAppModalOpen] = useState(false);
    const [appModalAction, setAppModalAction] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);
    const [appDetailsModalOpen, setAppDetailsModalOpen] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        if (token) {
            fetchDashboardData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, hostelsRes, managersRes, logsRes] = await Promise.all([
                axios.get(`${API_URL}/api/admin/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/admin/hostels`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/admin/managers`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/admin/logs?limit=20`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setStats(statsRes.data);
            setHostels(hostelsRes.data);
            setManagers(managersRes.data);
            setLogs(logsRes.data);
        } catch (err) {
            console.error('Admin dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleHostelActive = async (hostelId) => {
        if (!window.confirm('Are you sure you want to change this hostel status?')) return;
        try {
            await axios.patch(`${API_URL}/api/admin/hostels/${hostelId}/toggle-active`, {}, { headers: { Authorization: `Bearer ${token}` } });
            fetchDashboardData();
        } catch (err) {
            alert('Failed to update hostel status');
        }
    };

    const flagHostel = async (hostelId) => {
        const reason = prompt('Enter reason for flagging this hostel:');
        if (!reason) return;
        try {
            await axios.patch(`${API_URL}/api/admin/hostels/${hostelId}/flag`, { reason }, { headers: { Authorization: `Bearer ${token}` } });
            fetchDashboardData();
        } catch (err) {
            alert('Failed to flag hostel');
        }
    };

    const deleteHostel = async (hostelId) => {
        if (!window.confirm('Are you sure you want to DELETE this hostel? This action cannot be undone and will remove it from the browse section.')) return;
        try {
            await axios.delete(`${API_URL}/api/admin/hostels/${hostelId}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchDashboardData();
        } catch (err) {
            alert('Failed to delete hostel');
        }
    };

    // Reserved for future room management features
    // eslint-disable-next-line no-unused-vars
    const resetRoomCapacity = async (hostelId, roomType) => {
        const newCapacity = prompt(`Enter new occupied capacity for ${roomType}:`);
        if (newCapacity === null) return;
        if (!window.confirm(`Reset ${roomType} capacity to ${newCapacity}? This action is logged.`)) return;
        try {
            await axios.patch(`${API_URL}/api/admin/hostels/${hostelId}/rooms/${encodeURIComponent(roomType)}/reset-capacity`, 
                { newOccupiedCapacity: parseInt(newCapacity) }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchDashboardData();
        } catch (err) {
            alert('Failed to reset capacity');
        }
    };

    const handleUserAction = (action, user) => {
        if (action === 'view') {
            setSelectedUser(user);
            setDetailsModalOpen(true);
        } else if (action.startsWith('bulk-')) {
            handleBulkAction(action.replace('bulk-', ''), user);
        } else {
            setModalAction(action);
            setSelectedUser(user);
            setModalOpen(true);
        }
    };

    const handleActionConfirm = async (data) => {
        setActionLoading(true);
        try {
            let endpoint = '';
            let method = 'patch';
            let payload = data;

            switch (modalAction) {
                case 'suspend':
                    endpoint = `/api/admin/users/${selectedUser._id}/suspend`;
                    break;
                case 'ban':
                    endpoint = `/api/admin/users/${selectedUser._id}/ban`;
                    break;
                case 'activate':
                    endpoint = `/api/admin/users/${selectedUser._id}/activate`;
                    break;
                case 'verify':
                    endpoint = `/api/admin/users/${selectedUser._id}/verify`;
                    break;
                case 'reject':
                    endpoint = `/api/admin/users/${selectedUser._id}/reject`;
                    break;
                case 'reset-password':
                    endpoint = `/api/admin/users/${selectedUser._id}/reset-password`;
                    method = 'post';
                    break;
                case 'delete':
                    endpoint = `/api/admin/users/${selectedUser._id}`;
                    method = 'delete';
                    break;
                default:
                    throw new Error('Unknown action');
            }

            const res = await axios[method](`${API_URL}${endpoint}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (modalAction === 'reset-password' && res.data.temporaryPassword) {
                alert(`Password reset successful!\n\nTemporary Password: ${res.data.temporaryPassword}\n\nPlease save this password and share it with the user securely.`);
            }

            showSuccess(res.data.message || 'Action completed successfully');
            setModalOpen(false);
            setSelectedUser(null);
            setModalAction('');
        } catch (err) {
            alert(err.response?.data?.error || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleBulkAction = async (action, userIds) => {
        const reason = action === 'suspend' || action === 'ban' ? prompt(`Enter reason for bulk ${action}:`) : null;
        if ((action === 'suspend' || action === 'ban') && !reason) return;

        if (!window.confirm(`Are you sure you want to ${action} ${userIds.length} user(s)?`)) return;

        try {
            const res = await axios.post(`${API_URL}/api/admin/users/bulk-action`, {
                userIds,
                action,
                reason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { success, failed } = res.data.results;
            let message = `Bulk action completed: ${success.length} succeeded`;
            if (failed.length > 0) message += `, ${failed.length} failed`;
            showSuccess(message);
        } catch (err) {
            alert(err.response?.data?.error || 'Bulk action failed');
        }
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleApplicationAction = (action, app, refreshCallback) => {
        if (action === 'view') {
            setSelectedApp(app);
            setAppDetailsModalOpen(true);
        } else if (action === 'delete') {
            handleDeleteApplication(app, refreshCallback);
        } else if (action.startsWith('bulk-')) {
            handleBulkApplicationAction(action.replace('bulk-', ''), app, refreshCallback);
        } else {
            setAppModalAction(action);
            setSelectedApp(app);
            setAppModalOpen(true);
        }
    };

    const handleDeleteApplication = async (app, refreshCallback) => {
        if (!window.confirm(`Are you sure you want to delete this application from ${app.studentName}?\n\nThis action cannot be undone.`)) return;
        
        try {
            await axios.delete(`${API_URL}/api/admin/applications/${app._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSuccess('Application deleted successfully');
            if (refreshCallback) refreshCallback();
            fetchDashboardData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete application');
        }
    };

    const handleAppActionConfirm = async (data) => {
        setActionLoading(true);
        try {
            let endpoint = '';
            let method = 'post';
            let payload = data;

            switch (appModalAction) {
                case 'approve':
                    endpoint = `/api/admin/applications/${selectedApp._id}/override`;
                    method = 'patch';
                    payload = { status: 'approved', reason: data.reason };
                    break;
                case 'reject':
                    endpoint = `/api/admin/applications/${selectedApp._id}/override`;
                    method = 'patch';
                    payload = { status: 'rejected', reason: data.reason };
                    break;
                case 'note':
                    endpoint = `/api/admin/applications/${selectedApp._id}/note`;
                    payload = { note: data.note, visibleToManager: data.visibleToManager };
                    break;
                case 'dispute':
                    endpoint = `/api/admin/applications/${selectedApp._id}/dispute`;
                    payload = { disputeReason: data.disputeReason, disputeDetails: data.disputeDetails };
                    break;
                case 'resolve-dispute':
                    endpoint = `/api/admin/applications/${selectedApp._id}/dispute/resolve`;
                    method = 'patch';
                    payload = { resolution: data.resolution, newStatus: data.newStatus };
                    break;
                case 'refund':
                    endpoint = `/api/admin/applications/${selectedApp._id}/refund`;
                    payload = { refundAmount: parseFloat(data.refundAmount), reason: data.reason };
                    break;
                default:
                    throw new Error('Unknown action');
            }

            const res = await axios[method](`${API_URL}${endpoint}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            showSuccess(res.data.message || 'Action completed successfully');
            setAppModalOpen(false);
            setSelectedApp(null);
            setAppModalAction('');
            fetchDashboardData();
        } catch (err) {
            alert(err.response?.data?.error || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleBulkApplicationAction = async (action, appIds, refreshCallback) => {
        const reason = prompt(`Enter reason for bulk ${action}:`);
        if (!reason) return;

        if (!window.confirm(`Are you sure you want to ${action} ${appIds.length} application(s)?`)) return;

        try {
            const res = await axios.post(`${API_URL}/api/admin/applications/bulk-action`, {
                applicationIds: appIds,
                action,
                reason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { success, failed } = res.data.results;
            let message = `Bulk action completed: ${success.length} succeeded`;
            if (failed.length > 0) message += `, ${failed.length} failed`;
            showSuccess(message);
            if (refreshCallback) refreshCallback();
            fetchDashboardData();
        } catch (err) {
            alert(err.response?.data?.error || 'Bulk action failed');
        }
    };

    if (loading) {
        return <LoadingSpinner message="Loading admin dashboard..." fullScreen />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-sm text-gray-600">System Overseer & Control Center - Analytics Enabled</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600">Total Hostels</p>
                                <p className="text-xl sm:text-2xl font-bold">{stats?.overview.totalHostels}</p>
                                <p className="text-xs text-green-600">{stats?.overview.activeHostels} active</p>
                            </div>
                            <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600">Managers</p>
                                <p className="text-xl sm:text-2xl font-bold">{stats?.overview.totalManagers}</p>
                            </div>
                            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" />
                        </div>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600">Applications</p>
                                <p className="text-xl sm:text-2xl font-bold">{stats?.overview.totalApplications}</p>
                                <p className="text-xs text-yellow-600">{stats?.overview.pendingApplications} pending</p>
                            </div>
                            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
                        </div>
                    </div>
                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600">Students</p>
                                <p className="text-xl sm:text-2xl font-bold">{stats?.overview.totalStudents}</p>
                            </div>
                            <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
                        </div>
                    </div>
                </div>

                {/* Room Stats */}
                <div className="bg-white p-3 sm:p-4 rounded-lg shadow mb-6">
                    <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Room Statistics</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {stats?.roomStats && Object.entries(stats.roomStats).map(([type, data]) => (
                            <div key={type} className="border rounded p-2 sm:p-3">
                                <p className="font-semibold text-xs sm:text-sm">{type}</p>
                                <p className="text-xs text-gray-600">Total: {data.total}</p>
                                <p className="text-xs text-gray-600">Occupied: {data.occupied}</p>
                                <p className="text-xs text-green-600">Available: {data.available}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="border-b overflow-x-auto">
                        <div className="flex space-x-2 sm:space-x-4 px-2 sm:px-4 min-w-max">
                            {['overview', 'analytics', 'transactions', 'users', 'hostels', 'managers', 'register-manager', 'applications', 'logs'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-2 sm:py-3 px-2 sm:px-4 font-medium capitalize text-xs sm:text-base whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                                >
                                    {tab === 'register-manager' ? 'Register Manager' : tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-3 sm:p-4">
                        {activeTab === 'overview' && (
                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900 mb-2">Welcome to Admin Dashboard</h3>
                                    <p className="text-sm text-blue-800">Manage users, hostels, applications, and monitor system activity from this central control hub.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white border rounded-lg p-4">
                                        <h4 className="font-semibold mb-2">Quick Stats</h4>
                                        <ul className="text-sm space-y-1">
                                            <li>• {stats?.overview.totalHostels} total hostels ({stats?.overview.activeHostels} active)</li>
                                            <li>• {stats?.overview.totalManagers} managers registered</li>
                                            <li>• {stats?.overview.totalStudents} students registered</li>
                                            <li>• {stats?.overview.totalApplications} applications ({stats?.overview.pendingApplications} pending)</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white border rounded-lg p-4">
                                        <h4 className="font-semibold mb-2">Quick Actions</h4>
                                        <div className="space-y-2">
                                            <button onClick={() => setActiveTab('users')} className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded text-sm">Manage Users</button>
                                            <button onClick={() => setActiveTab('applications')} className="w-full text-left px-3 py-2 bg-green-50 hover:bg-green-100 rounded text-sm">Review Applications</button>
                                            <button onClick={() => setActiveTab('hostels')} className="w-full text-left px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded text-sm">Manage Hostels</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div>
                                {token ? (
                                    <UserManagementTable token={token} onAction={handleUserAction} />
                                ) : (
                                    <div className="text-center py-8 text-red-600">No authentication token found</div>
                                )}
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <AnalyticsDashboard token={token} />
                        )}

                        {activeTab === 'transactions' && (
                            <AdminTransactions token={token} />
                        )}

                        {activeTab === 'applications' && (
                            <ApplicationManagementTable token={token} onAction={handleApplicationAction} />
                        )}

                        {activeTab === 'hostels' && (
                            <div className="overflow-x-auto -mx-3 sm:mx-0">
                                <div className="inline-block min-w-full align-middle">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hostel</th>
                                                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                                                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rooms</th>
                                                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {hostels.map(hostel => (
                                                <tr key={hostel._id}>
                                                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{hostel.name}</td>
                                                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{hostel.managerId?.name}</td>
                                                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{hostel.roomTypes?.length} types</td>
                                                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">
                                                        <span className={`px-2 py-1 text-xs rounded ${hostel.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {hostel.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                        {hostel.isFlagged && <span className="ml-2 px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">Flagged</span>}
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">
                                                        <button onClick={() => toggleHostelActive(hostel._id)} className="text-blue-600 hover:underline mr-2">Toggle</button>
                                                        <button onClick={() => flagHostel(hostel._id)} className="text-orange-600 hover:underline mr-2">Flag</button>
                                                        <button onClick={() => deleteHostel(hostel._id)} className="text-red-600 hover:underline">Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'managers' && (
                            <div className="overflow-x-auto -mx-3 sm:mx-0">
                                <div className="inline-block min-w-full align-middle">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hostels</th>
                                                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Applications</th>
                                                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {managers.map(manager => (
                                                <tr key={manager._id}>
                                                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{manager.name}</td>
                                                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{manager.email}</td>
                                                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{manager.hostelCount}</td>
                                                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{manager.applicationCount}</td>
                                                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{new Date(manager.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">
                                                        <button 
                                                            onClick={() => handleUserAction('delete', manager)}
                                                            className="text-red-600 hover:text-red-800 hover:underline"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'register-manager' && (
                            <ManagerRegistrationForm token={token} onSuccess={() => { showSuccess('Manager registered successfully'); fetchDashboardData(); }} />
                        )}

                        {activeTab === 'logs' && (
                            <div className="space-y-2">
                                {logs.map(log => (
                                    <div key={log._id} className="border-l-4 border-blue-500 bg-gray-50 p-3">
                                        <p className="text-sm font-medium">{log.action}</p>
                                        <p className="text-xs text-gray-600">{log.details}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            By {log.adminId?.name} • {new Date(log.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* User Action Modal */}
            <UserActionModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setSelectedUser(null); setModalAction(''); }}
                action={modalAction}
                user={selectedUser}
                onConfirm={handleActionConfirm}
                loading={actionLoading}
            />

            {/* User Details Modal */}
            <UserDetailsModal
                isOpen={detailsModalOpen}
                onClose={() => { setDetailsModalOpen(false); setSelectedUser(null); }}
                user={selectedUser}
                token={token}
            />

            {/* Application Action Modal */}
            <ApplicationActionModal
                isOpen={appModalOpen}
                onClose={() => { setAppModalOpen(false); setSelectedApp(null); setAppModalAction(''); }}
                action={appModalAction}
                application={selectedApp}
                onConfirm={handleAppActionConfirm}
                loading={actionLoading}
            />

            {/* Application Details Modal */}
            <ApplicationDetailsModal
                isOpen={appDetailsModalOpen}
                onClose={() => { setAppDetailsModalOpen(false); setSelectedApp(null); }}
                application={selectedApp}
                token={token}
                onRefresh={fetchDashboardData}
            />

            {/* Success Message */}
            {successMessage && (
                <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
                    {successMessage}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
