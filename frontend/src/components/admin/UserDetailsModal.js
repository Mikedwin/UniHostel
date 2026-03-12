import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, User, Mail, Calendar, Clock, Activity } from 'lucide-react';
import API_URL from '../../config';

const UserDetailsModal = ({ isOpen, onClose, user, token }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            fetchActivities();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, user]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/admin/users/${user._id}/activity`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActivities(res.data);
        } catch (err) {
            console.error('Error fetching activities:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="p-6 space-y-6">
                        {/* User Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium text-gray-900">{user.name}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium text-gray-900">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Activity className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Role</p>
                                    <p className="font-medium text-gray-900 capitalize">{user.role}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Activity className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <p className="font-medium text-gray-900 capitalize">{user.accountStatus.replace('_', ' ')}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Joined</p>
                                    <p className="font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Last Login</p>
                                    <p className="font-medium text-gray-900">{formatDate(user.lastLogin)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Verification Status */}
                        {user.role === 'manager' && (
                            <div className="bg-gray-50 p-4 rounded-md">
                                <p className="text-sm font-medium text-gray-700 mb-2">Manager Verification</p>
                                <p className={`text-sm ${user.isVerified ? 'text-green-600' : 'text-orange-600'}`}>
                                    {user.isVerified ? '✓ Verified' : '⚠ Not Verified'}
                                </p>
                            </div>
                        )}

                        {/* Suspension Info */}
                        {(user.accountStatus === 'suspended' || user.accountStatus === 'banned') && (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                                <p className="text-sm font-medium text-red-900 mb-2">
                                    {user.accountStatus === 'suspended' ? 'Suspension Details' : 'Ban Details'}
                                </p>
                                {user.suspensionReason && (
                                    <p className="text-sm text-red-700 mb-1">
                                        <span className="font-medium">Reason:</span> {user.suspensionReason}
                                    </p>
                                )}
                                {user.suspensionNote && (
                                    <p className="text-sm text-red-700 mb-1">
                                        <span className="font-medium">Note:</span> {user.suspensionNote}
                                    </p>
                                )}
                                {user.suspendedAt && (
                                    <p className="text-sm text-red-700">
                                        <span className="font-medium">Date:</span> {formatDate(user.suspendedAt)}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Login History */}
                        {user.loginHistory && user.loginHistory.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Login History</h4>
                                <div className="space-y-2">
                                    {user.loginHistory.slice(-5).reverse().map((login, idx) => (
                                        <div key={idx} className="bg-gray-50 p-3 rounded text-sm">
                                            <p className="text-gray-900">{formatDate(login.timestamp)}</p>
                                            {login.ipAddress && (
                                                <p className="text-gray-600 text-xs">IP: {login.ipAddress}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Activity Log */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Activity Log</h4>
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                </div>
                            ) : activities.length > 0 ? (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {activities.map((activity, idx) => (
                                        <div key={idx} className="bg-gray-50 p-3 rounded text-sm">
                                            <p className="font-medium text-gray-900">{activity.action}</p>
                                            {activity.details && (
                                                <p className="text-gray-600 text-xs mt-1">{JSON.stringify(activity.details)}</p>
                                            )}
                                            <p className="text-gray-500 text-xs mt-1">{formatDate(activity.timestamp)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No activity recorded</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;
