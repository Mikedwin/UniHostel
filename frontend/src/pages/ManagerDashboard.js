import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Check, X, Plus, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import API_URL from '../config';

const ManagerDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [hostels, setHostels] = useState([]);
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [appRes, hostRes] = await Promise.all([
                axios.get(`${API_URL}/api/applications/manager`, { 
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                }),
                axios.get(`${API_URL}/api/hostels/my-listings`, { 
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                })
            ]);
            setApplications(appRes.data || []);
            setHostels(hostRes.data || []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.patch(`${API_URL}/api/applications/${id}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteHostel = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            try {
                await axios.delete(`${API_URL}/api/hostels/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchData();
            } catch (err) {
                console.error('Error deleting hostel:', err);
                alert('Failed to delete hostel');
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Manager Dashboard</h1>
                <Link to="/add-hostel" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    List New Hostel
                </Link>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading your dashboard...</p>
                    </div>
                </div>
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
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                    <div className="lg:col-span-7">
                    <h2 className="text-lg font-bold mb-4">Incoming Applications</h2>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {applications.length === 0 ? (
                            <p className="p-8 text-gray-500 text-center">No applications yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
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
                                        {applications.map(app => (
                                            <tr key={app._id}>
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
                                                        app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    {app.status === 'pending' ? (
                                                        <div className="flex space-x-2">
                                                            <button 
                                                                onClick={() => handleStatusUpdate(app._id, 'approved')}
                                                                className="text-green-600 hover:bg-green-50 p-1 rounded" title="Approve">
                                                                <Check className="w-5 h-5" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleStatusUpdate(app._id, 'rejected')}
                                                                className="text-red-600 hover:bg-red-50 p-1 rounded" title="Reject">
                                                                <X className="w-5 h-5" />
                                                            </button>
                                                        </div>
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
                </div>

                <div className="lg:col-span-3">
                    <h2 className="text-lg font-bold mb-4">My Listings</h2>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                        {hostels.map(hostel => (
                            <div key={hostel._id} className="bg-white rounded-lg shadow-sm border">
                                <div className="p-4 border-b bg-gray-50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{hostel.name}</h3>
                                            <div className="text-sm text-gray-500">{hostel.location}</div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Link 
                                                to={`/edit-hostel/${hostel._id}`}
                                                className="text-blue-600 hover:bg-blue-100 p-1.5 rounded" 
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteHostel(hostel._id, hostel.name)}
                                                className="text-red-600 hover:bg-red-100 p-1.5 rounded" 
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 space-y-3">
                                    {hostel.roomTypes?.sort((a, b) => {
                                        const order = {'1 in a Room': 1, '2 in a Room': 2, '3 in a Room': 3, '4 in a Room': 4};
                                        return (order[a.type] || 99) - (order[b.type] || 99);
                                    }).map((room, idx) => (
                                        <div key={idx} className="border rounded-lg overflow-hidden">
                                            <img src={room.roomImage} alt={room.type} className="w-full h-24 object-cover" />
                                            <div className="p-2">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-semibold text-sm">{room.type}</span>
                                                    <span className="text-primary-700 font-bold text-sm">GH₵{room.price}/sem</span>
                                                </div>
                                                <div className="text-xs text-gray-600 mb-1">
                                                    <span className="font-medium">Occupied:</span> {room.occupiedCapacity || 0} / {room.totalCapacity} students
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {room.facilities?.slice(0, 3).map((f, i) => (
                                                        <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{f}</span>
                                                    ))}
                                                    {room.facilities?.length > 3 && (
                                                        <span className="text-xs text-gray-500">+{room.facilities.length - 3}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerDashboard;
