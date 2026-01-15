import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Building2, FileText, Activity } from 'lucide-react';
import API_URL from '../config';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [hostels, setHostels] = useState([]);
    const [managers, setManagers] = useState([]);
    const [applications, setApplications] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
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
            const [statsRes, hostelsRes, managersRes, appsRes, logsRes] = await Promise.all([
                axios.get(`${API_URL}/api/admin/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/admin/hostels`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/admin/managers`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/admin/applications`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/admin/logs?limit=20`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setStats(statsRes.data);
            setHostels(hostelsRes.data);
            setManagers(managersRes.data);
            setApplications(appsRes.data);
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
    // Note: resetRoomCapacity will be used in future room management features

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-sm text-gray-600">System Overseer & Control Center</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Hostels</p>
                                <p className="text-2xl font-bold">{stats?.overview.totalHostels}</p>
                                <p className="text-xs text-green-600">{stats?.overview.activeHostels} active</p>
                            </div>
                            <Building2 className="w-10 h-10 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Managers</p>
                                <p className="text-2xl font-bold">{stats?.overview.totalManagers}</p>
                            </div>
                            <Users className="w-10 h-10 text-purple-500" />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Applications</p>
                                <p className="text-2xl font-bold">{stats?.overview.totalApplications}</p>
                                <p className="text-xs text-yellow-600">{stats?.overview.pendingApplications} pending</p>
                            </div>
                            <FileText className="w-10 h-10 text-orange-500" />
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Students</p>
                                <p className="text-2xl font-bold">{stats?.overview.totalStudents}</p>
                            </div>
                            <Activity className="w-10 h-10 text-green-500" />
                        </div>
                    </div>
                </div>

                {/* Room Stats */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <h2 className="text-lg font-bold mb-4">Room Statistics</h2>
                    <div className="grid grid-cols-4 gap-4">
                        {stats?.roomStats && Object.entries(stats.roomStats).map(([type, data]) => (
                            <div key={type} className="border rounded p-3">
                                <p className="font-semibold text-sm">{type}</p>
                                <p className="text-xs text-gray-600">Total: {data.total}</p>
                                <p className="text-xs text-gray-600">Occupied: {data.occupied}</p>
                                <p className="text-xs text-green-600">Available: {data.available}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="border-b">
                        <div className="flex space-x-4 px-4">
                            {['overview', 'hostels', 'managers', 'applications', 'logs'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-3 px-4 font-medium capitalize ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4">
                        {activeTab === 'hostels' && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hostel</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rooms</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {hostels.map(hostel => (
                                            <tr key={hostel._id}>
                                                <td className="px-4 py-2 text-sm">{hostel.name}</td>
                                                <td className="px-4 py-2 text-sm">{hostel.managerId?.name}</td>
                                                <td className="px-4 py-2 text-sm">{hostel.roomTypes?.length} types</td>
                                                <td className="px-4 py-2 text-sm">
                                                    <span className={`px-2 py-1 text-xs rounded ${hostel.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {hostel.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    {hostel.isFlagged && <span className="ml-2 px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">Flagged</span>}
                                                </td>
                                                <td className="px-4 py-2 text-sm">
                                                    <button onClick={() => toggleHostelActive(hostel._id)} className="text-blue-600 hover:underline mr-2">Toggle</button>
                                                    <button onClick={() => flagHostel(hostel._id)} className="text-orange-600 hover:underline">Flag</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'managers' && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hostels</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Applications</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {managers.map(manager => (
                                            <tr key={manager._id}>
                                                <td className="px-4 py-2 text-sm">{manager.name}</td>
                                                <td className="px-4 py-2 text-sm">{manager.email}</td>
                                                <td className="px-4 py-2 text-sm">{manager.hostelCount}</td>
                                                <td className="px-4 py-2 text-sm">{manager.applicationCount}</td>
                                                <td className="px-4 py-2 text-sm">{new Date(manager.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'applications' && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hostel</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Room Type</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {applications.map(app => (
                                            <tr key={app._id}>
                                                <td className="px-4 py-2 text-sm">{app.studentId?.name}</td>
                                                <td className="px-4 py-2 text-sm">{app.hostelId?.name}</td>
                                                <td className="px-4 py-2 text-sm">{app.roomType}</td>
                                                <td className="px-4 py-2 text-sm">
                                                    <span className={`px-2 py-1 text-xs rounded ${
                                                        app.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>{app.status}</span>
                                                </td>
                                                <td className="px-4 py-2 text-sm">{new Date(app.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
        </div>
    );
};

export default AdminDashboard;
