import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ApplicationActionModal = ({ isOpen, onClose, action, application, onConfirm, loading }) => {
    const [formData, setFormData] = useState({
        reason: '',
        note: '',
        visibleToManager: false,
        disputeReason: '',
        disputeDetails: '',
        resolution: '',
        newStatus: '',
        refundAmount: ''
    });

    if (!isOpen) return null;

    const getModalConfig = () => {
        switch (action) {
            case 'approve':
                return {
                    title: 'Approve Application',
                    color: 'green',
                    message: 'This will approve the application and update room capacity.',
                    requireReason: true
                };
            case 'reject':
                return {
                    title: 'Reject Application',
                    color: 'red',
                    message: 'This will reject the application. If previously approved, capacity will be adjusted.',
                    requireReason: true
                };
            case 'note':
                return {
                    title: 'Add Internal Note',
                    color: 'purple',
                    message: 'Add an internal note for admin reference.',
                    requireNote: true
                };
            case 'dispute':
                return {
                    title: 'Create Dispute',
                    color: 'orange',
                    message: 'Flag this application as disputed for review.',
                    requireDispute: true
                };
            case 'resolve-dispute':
                return {
                    title: 'Resolve Dispute',
                    color: 'blue',
                    message: 'Provide resolution details and optionally change application status.',
                    requireResolution: true
                };
            case 'refund':
                return {
                    title: 'Process Refund',
                    color: 'indigo',
                    message: 'Process a refund for this application.',
                    requireRefund: true
                };
            default:
                return { title: 'Confirm Action', color: 'gray', message: '' };
        }
    };

    const config = getModalConfig();

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(formData);
    };

    const resetForm = () => {
        setFormData({
            reason: '',
            note: '',
            visibleToManager: false,
            disputeReason: '',
            disputeDetails: '',
            resolution: '',
            newStatus: '',
            refundAmount: ''
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
                <div className={`px-6 py-4 border-b flex justify-between items-center bg-${config.color}-50`}>
                    <h2 className={`text-lg font-bold text-${config.color}-900`}>{config.title}</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {config.message && (
                        <div className={`mb-4 p-3 bg-${config.color}-50 border border-${config.color}-200 rounded flex gap-2`}>
                            <AlertTriangle className={`h-5 w-5 text-${config.color}-600 flex-shrink-0 mt-0.5`} />
                            <p className="text-sm text-gray-700">{config.message}</p>
                        </div>
                    )}

                    {/* Application Info */}
                    <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                        <p><span className="font-medium">Student:</span> {application?.studentName}</p>
                        <p><span className="font-medium">Hostel:</span> {application?.hostelId?.name}</p>
                        <p><span className="font-medium">Room:</span> {application?.roomType}</p>
                    </div>

                    {/* Reason Field */}
                    {config.requireReason && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                required
                                placeholder="Provide a reason for this action..."
                            />
                        </div>
                    )}

                    {/* Note Field */}
                    {config.requireNote && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Note <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows="4"
                                    required
                                    placeholder="Enter internal note..."
                                />
                            </div>
                            <div className="mb-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.visibleToManager}
                                        onChange={(e) => setFormData({ ...formData, visibleToManager: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span className="text-sm text-gray-700">Make visible to hostel manager</span>
                                </label>
                            </div>
                        </>
                    )}

                    {/* Dispute Fields */}
                    {config.requireDispute && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dispute Reason <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.disputeReason}
                                    onChange={(e) => setFormData({ ...formData, disputeReason: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                    placeholder="Brief reason..."
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Details
                                </label>
                                <textarea
                                    value={formData.disputeDetails}
                                    onChange={(e) => setFormData({ ...formData, disputeDetails: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Additional details..."
                                />
                            </div>
                        </>
                    )}

                    {/* Resolution Fields */}
                    {config.requireResolution && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Resolution <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.resolution}
                                    onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    required
                                    placeholder="Describe how the dispute was resolved..."
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Change Status (Optional)
                                </label>
                                <select
                                    value={formData.newStatus}
                                    onChange={(e) => setFormData({ ...formData, newStatus: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Keep Current Status</option>
                                    <option value="approved">Approve</option>
                                    <option value="rejected">Reject</option>
                                    <option value="pending">Set to Pending</option>
                                </select>
                            </div>
                        </>
                    )}

                    {/* Refund Fields */}
                    {config.requireRefund && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Refund Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={formData.refundAmount}
                                onChange={(e) => setFormData({ ...formData, refundAmount: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 bg-${config.color}-600 text-white rounded-lg hover:bg-${config.color}-700 disabled:opacity-50`}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Confirm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplicationActionModal;
