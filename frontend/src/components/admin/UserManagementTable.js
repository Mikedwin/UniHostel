import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, UserX, UserCheck, Shield, Trash2, Key, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import API_URL from '../../config';

const UserManagementTable = ({ token, onAction }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [sortField, setSortField] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, roleFilter, statusFilter, page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (roleFilter) params.append('role', roleFilter);
            if (statusFilter) params.append('status', statusFilter);
            params.append('page', page);
            params.append('limit', 20);

            const res = await axios.get(`${API_URL}/api/admin/users?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data.users);
            setTotalPages(res.data.pages);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedUsers(users.filter(u => u.role !== 'admin').map(u => u._id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleSelectUser = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: 'bg-green-100 text-green-700',
            suspended: 'bg-yellow-100 text-yellow-700',
            banned: 'bg-red-100 text-red-700',
            pending_verification: 'bg-blue-100 text-blue-700'
        };
        return badges[status] || 'bg-gray-100 text-gray-700';
    };

    const getRoleBadge = (role) => {
        const badges = {
            student: 'bg-blue-50 text-blue-700',
            manager: 'bg-purple-50 text-purple-700',
            admin: 'bg-gray-50 text-gray-700'
        };
        return badges[role] || 'bg-gray-50 text-gray-700';
    };

    const formatDate = (date) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const sortedUsers = [...users].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        
        if (sortField === 'createdAt' || sortField === 'lastLogin') {
            aVal = new Date(aVal || 0);
            bVal = new Date(bVal || 0);
        }
        
        if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });

    if (loading) {
        return <div className="flex justify-center items-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                
                <select
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Roles</option>
                    <option value="student">Students</option>
                    <option value="manager">Managers</option>
                    <option value="admin">Admins</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                    <option value="pending_verification">Pending Verification</option>
                </select>

                <button
                    onClick={fetchUsers}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Refresh
                </button>
            </div>

            {selectedUsers.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">
                        {selectedUsers.length} user(s) selected
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onAction('bulk-suspend', selectedUsers)}
                            className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                        >
                            Suspend Selected
                        </button>
                        <button
                            onClick={() => onAction('bulk-ban', selectedUsers)}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                            Ban Selected
                        </button>
                        <button
                            onClick={() => onAction('bulk-activate', selectedUsers)}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                            Activate Selected
                        </button>
                        <button
                            onClick={() => setSelectedUsers([])}
                            className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={selectedUsers.length === users.filter(u => u.role !== 'admin').length && users.length > 0}
                                        className="rounded"
                                    />
                                </th>
                                <th 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Name
                                        {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('role')}
                                >
                                    <div className="flex items-center gap-1">
                                        Role
                                        {sortField === 'role' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('lastLogin')}
                                >
                                    <div className="flex items-center gap-1">
                                        Last Login
                                        {sortField === 'lastLogin' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                    </div>
                                </th>
                                <th 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('createdAt')}
                                >
                                    <div className="flex items-center gap-1">
                                        Joined
                                        {sortField === 'createdAt' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedUsers.map(user => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        {user.role !== 'admin' && (
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user._id)}
                                                onChange={() => handleSelectUser(user._id)}
                                                className="rounded"
                                            />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {user.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {user.email}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadge(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(user.accountStatus)}`}>
                                            {user.accountStatus.replace('_', ' ')}
                                        </span>
                                        {!user.isVerified && user.role === 'manager' && (
                                            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
                                                Unverified
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {formatDate(user.lastLogin)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onAction('view', user)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {user.role !== 'admin' && (
                                                <>
                                                    {user.accountStatus === 'active' ? (
                                                        <button
                                                            onClick={() => onAction('suspend', user)}
                                                            className="text-yellow-600 hover:text-yellow-800"
                                                            title="Suspend User"
                                                        >
                                                            <UserX className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => onAction('activate', user)}
                                                            className="text-green-600 hover:text-green-800"
                                                            title="Activate User"
                                                        >
                                                            <UserCheck className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {user.role === 'manager' && !user.isVerified && (
                                                        <button
                                                            onClick={() => onAction('verify', user)}
                                                            className="text-green-600 hover:text-green-800"
                                                            title="Verify Manager"
                                                        >
                                                            <Shield className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => onAction('reset-password', user)}
                                                        className="text-purple-600 hover:text-purple-800"
                                                        title="Reset Password"
                                                    >
                                                        <Key className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onAction('delete', user)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t">
                        <div className="text-sm text-gray-700">
                            Page {page} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {users.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No users found matching your criteria
                </div>
            )}
        </div>
    );
};

export default UserManagementTable;
