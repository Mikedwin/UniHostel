import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const UserActionModal = ({ isOpen, onClose, action, user, onConfirm, loading }) => {
    const [reason, setReason] = useState('');
    const [note, setNote] = useState('');

    if (!isOpen) return null;

    const getModalConfig = () => {
        switch (action) {
            case 'suspend':
                return {
                    title: 'Suspend User',
                    icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
                    message: `Are you sure you want to suspend ${user?.name}? They will not be able to log in.`,
                    color: 'yellow',
                    requireReason: true,
                    confirmText: 'Suspend User'
                };
            case 'ban':
                return {
                    title: 'Ban User',
                    icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
                    message: `Are you sure you want to permanently ban ${user?.name}? This action is severe.`,
                    color: 'red',
                    requireReason: true,
                    confirmText: 'Ban User'
                };
            case 'activate':
                return {
                    title: 'Activate User',
                    icon: <CheckCircle className="w-12 h-12 text-green-500" />,
                    message: `Reactivate ${user?.name}? They will regain full access to the platform.`,
                    color: 'green',
                    requireReason: false,
                    confirmText: 'Activate User'
                };
            case 'verify':
                return {
                    title: 'Verify Manager',
                    icon: <CheckCircle className="w-12 h-12 text-green-500" />,
                    message: `Verify ${user?.name} as a manager? They will be able to create and manage hostels.`,
                    color: 'green',
                    requireReason: false,
                    confirmText: 'Verify Manager'
                };
            case 'reject':
                return {
                    title: 'Reject Manager',
                    icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
                    message: `Reject ${user?.name}'s manager application? They will be banned from the platform.`,
                    color: 'red',
                    requireReason: true,
                    confirmText: 'Reject Manager'
                };
            case 'reset-password':
                return {
                    title: 'Reset Password',
                    icon: <Info className="w-12 h-12 text-blue-500" />,
                    message: `Reset password for ${user?.name}? A temporary password will be generated.`,
                    color: 'blue',
                    requireReason: false,
                    confirmText: 'Reset Password'
                };
            case 'delete':
                return {
                    title: 'Delete User',
                    icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
                    message: `Permanently delete ${user?.name}? This action cannot be undone. All their data will be removed.`,
                    color: 'red',
                    requireReason: false,
                    confirmText: 'Delete User'
                };
            default:
                return {
                    title: 'Confirm Action',
                    icon: <Info className="w-12 h-12 text-gray-500" />,
                    message: 'Are you sure you want to proceed?',
                    color: 'gray',
                    requireReason: false,
                    confirmText: 'Confirm'
                };
        }
    };

    const config = getModalConfig();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (config.requireReason && !reason.trim()) {
            alert('Please provide a reason');
            return;
        }
        onConfirm({ reason: reason.trim(), note: note.trim() });
    };

    const handleClose = () => {
        setReason('');
        setNote('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-900">{config.title}</h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-center">
                            {config.icon}
                        </div>

                        <p className="text-center text-gray-700">{config.message}</p>

                        {user && (
                            <div className="bg-gray-50 p-4 rounded-md">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Email:</span> {user.email}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Role:</span> {user.role}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Status:</span> {user.accountStatus}
                                </p>
                            </div>
                        )}

                        {config.requireReason && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reason <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select a reason</option>
                                        <option value="Violation of terms">Violation of terms</option>
                                        <option value="Spam or abuse">Spam or abuse</option>
                                        <option value="Fraudulent activity">Fraudulent activity</option>
                                        <option value="Inappropriate content">Inappropriate content</option>
                                        <option value="Multiple complaints">Multiple complaints</option>
                                        <option value="Security concerns">Security concerns</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional Notes (Optional)
                                    </label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        placeholder="Add any additional details..."
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex gap-3 p-6 border-t bg-gray-50">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 px-4 py-2 text-white rounded-md ${
                                config.color === 'red' ? 'bg-red-600 hover:bg-red-700' :
                                config.color === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700' :
                                config.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                                'bg-blue-600 hover:bg-blue-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : config.confirmText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserActionModal;
