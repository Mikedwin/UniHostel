import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config';
import { RotateCcw, Trash2 } from 'lucide-react';

const TrashHostels = ({ token, onRestore }) => {
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrash();
    }, []);

    const fetchTrash = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/trash/hostels`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHostels(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id) => {
        if (!window.confirm('Restore this hostel?')) return;
        try {
            await axios.patch(`${API_URL}/api/admin/trash/hostels/${id}/restore`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTrash();
            if (onRestore) onRestore();
        } catch (err) {
            alert('Failed to restore hostel');
        }
    };

    if (loading) return <div className="text-center py-4">Loading...</div>;
    if (hostels.length === 0) return <div className="text-center py-8 text-gray-500">No deleted hostels</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hostel</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deleted</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deleted By</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {hostels.map(hostel => (
                        <tr key={hostel._id}>
                            <td className="px-4 py-3 text-sm">{hostel.name}</td>
                            <td className="px-4 py-3 text-sm">{hostel.managerId?.name}</td>
                            <td className="px-4 py-3 text-sm">{new Date(hostel.deletedAt).toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm">{hostel.deletedBy?.name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm">
                                <button
                                    onClick={() => handleRestore(hostel._id)}
                                    className="text-green-600 hover:text-green-800 flex items-center gap-1"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Restore
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TrashHostels;
