import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config';
import { Search, Filter, CheckCircle, XCircle, Eye, FileText, AlertTriangle } from 'lucide-react';

const ApplicationManagementTable = ({ token, onAction }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [disputeFilter, setDisputeFilter] = useState('');
    const [selectedApps, setSelectedApps] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, statusFilter, disputeFilter, search]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page, limit: 20 });
            if (statusFilter) params.append('status', statusFilter);
            if (disputeFilter) params.append('hasDispute', disputeFilter);
            if (search) params.append('search', search);

            const res = await axios.get(`${API_URL}/api/admin/applications?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplications(res.data.applications);
            setTotalPages(res.data.pages);
        } catch (err) {
            console.error('Failed to fetch applications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedApps(applications.map(app => app._id));
        } else {
            setSelectedApps([]);
        }
    };

    const handleSelectApp = (appId) => {
        setSelectedApps(prev =>
            prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
        );
    };

    const handleBulkAction = (action) => {
        if (selectedApps.length === 0) {
            alert('Please select applications first');
            return;
        }
        onAction(`bulk-${action}`, selectedApps, fetchApplications);
    };

    if (loading) {
        return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div>
            {/* Filters */}
            <div className="mb-4 flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by student name or contact..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                    </div>
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <select
                    value={disputeFilter}
                    onChange={(e) => setDisputeFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                >
                    <option value="">All Applications</option>
                    <option value="true">With Disputes</option>
                </select>
                <button
                    onClick={fetchApplications}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Filter className="h-4 w-4" />
                    Apply Filters
                </button>
            </div>

            {/* Bulk Actions */}
            {selectedApps.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-medium">{selectedApps.length} application(s) selected</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleBulkAction('approve')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                            Bulk Approve
                        </button>
                        <button
                            onClick={() => handleBulkAction('reject')}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                            Bulk Reject
                        </button>
                        <button
                            onClick={() => setSelectedApps([])}
                            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={selectedApps.length === applications.length && applications.length > 0}
                                    onChange={handleSelectAll}
                                    className="rounded"
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hostel</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {applications.map(app => (
                            <tr key={app._id} className={app.hasDispute ? 'bg-yellow-50' : ''}>
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedApps.includes(app._id)}
                                        onChange={() => handleSelectApp(app._id)}
                                        className="rounded"
                                    />
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <div>{app.studentName}</div>
                                    <div className="text-xs text-gray-500">{app.studentId?.email}</div>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <div>{app.hostelId?.name}</div>
                                    <div className="text-xs text-gray-500">{app.hostelId?.location}</div>
                                </td>
                                <td className="px-4 py-3 text-sm">{app.roomType}</td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className={`px-2 py-1 text-xs rounded inline-block ${
                                            app.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {app.status}
                                        </span>
                                        {app.adminOverride && (
                                            <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700 inline-block">
                                                Admin Override
                                            </span>
                                        )}
                                        {app.hasDispute && (
                                            <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-700 inline-block flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                Dispute
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm">{new Date(app.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onAction('view', app, fetchApplications)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="View Details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onAction('approve', app, fetchApplications)}
                                            className="text-green-600 hover:text-green-800"
                                            title="Approve"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onAction('reject', app, fetchApplications)}
                                            className="text-red-600 hover:text-red-800"
                                            title="Reject"
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onAction('note', app, fetchApplications)}
                                            className="text-purple-600 hover:text-purple-800"
                                            title="Add Note"
                                        >
                                            <FileText className="h-4 w-4" />
                                        </button>
                                        {app.hasDispute && (
                                            <button
                                                onClick={() => onAction('resolve-dispute', app, fetchApplications)}
                                                className="text-orange-600 hover:text-orange-800"
                                                title="Resolve Dispute"
                                            >
                                                <AlertTriangle className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ApplicationManagementTable;
