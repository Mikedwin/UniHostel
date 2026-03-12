import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config';
import { X, User, Building2, Calendar, Phone, Mail, FileText, AlertTriangle } from 'lucide-react';

const ApplicationDetailsModal = ({ isOpen, onClose, application, token, onRefresh }) => {
    const [appDetails, setAppDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && application) {
            fetchDetails();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, application]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/admin/applications/${application._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppDetails(res.data);
        } catch (err) {
            console.error('Failed to fetch application details:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Application Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : appDetails ? (
                    <div className="p-6 space-y-6">
                        {/* Student Info */}
                        <div className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <User className="h-5 w-5 text-blue-600" />
                                <h3 className="font-semibold">Student Information</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-600">Name:</span>
                                    <p className="font-medium">{appDetails.studentName}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Email:</span>
                                    <p className="font-medium flex items-center gap-1">
                                        <Mail className="h-4 w-4" />
                                        {appDetails.studentId?.email}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Contact:</span>
                                    <p className="font-medium flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        {appDetails.contactNumber}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Semester:</span>
                                    <p className="font-medium flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {appDetails.semester}
                                    </p>
                                </div>
                            </div>
                            {appDetails.message && (
                                <div className="mt-3">
                                    <span className="text-gray-600 text-sm">Message:</span>
                                    <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{appDetails.message}</p>
                                </div>
                            )}
                        </div>

                        {/* Hostel Info */}
                        <div className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Building2 className="h-5 w-5 text-green-600" />
                                <h3 className="font-semibold">Hostel Information</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-600">Hostel:</span>
                                    <p className="font-medium">{appDetails.hostelId?.name}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Location:</span>
                                    <p className="font-medium">{appDetails.hostelId?.location}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Room Type:</span>
                                    <p className="font-medium">{appDetails.roomType}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Applied:</span>
                                    <p className="font-medium">{new Date(appDetails.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Status Info */}
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-3">Application Status</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Current Status:</span>
                                    <span className={`px-3 py-1 text-sm rounded ${
                                        appDetails.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        appDetails.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {appDetails.status.toUpperCase()}
                                    </span>
                                </div>
                                {appDetails.adminOverride && (
                                    <div className="text-sm bg-purple-50 p-3 rounded">
                                        <p className="font-medium text-purple-700">Admin Override Applied</p>
                                        <p className="text-gray-600 mt-1">By: {appDetails.overriddenBy?.name}</p>
                                        <p className="text-gray-600">Reason: {appDetails.overrideReason}</p>
                                        <p className="text-gray-500 text-xs mt-1">
                                            {new Date(appDetails.overrideTimestamp).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dispute Info */}
                        {appDetails.hasDispute && (
                            <div className="border border-orange-300 rounded-lg p-4 bg-orange-50">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                                    <h3 className="font-semibold text-orange-900">Dispute Information</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-700 font-medium">Status:</span>
                                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                            appDetails.disputeStatus === 'resolved' ? 'bg-green-100 text-green-700' :
                                            appDetails.disputeStatus === 'under_review' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {appDetails.disputeStatus}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-700 font-medium">Reason:</span>
                                        <p className="mt-1">{appDetails.disputeReason}</p>
                                    </div>
                                    {appDetails.disputeDetails && (
                                        <div>
                                            <span className="text-gray-700 font-medium">Details:</span>
                                            <p className="mt-1">{appDetails.disputeDetails}</p>
                                        </div>
                                    )}
                                    {appDetails.disputeStatus === 'resolved' && (
                                        <div className="mt-3 pt-3 border-t border-orange-200">
                                            <span className="text-gray-700 font-medium">Resolution:</span>
                                            <p className="mt-1">{appDetails.disputeResolution}</p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Resolved by {appDetails.disputeResolvedBy?.name} on{' '}
                                                {new Date(appDetails.disputeResolvedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Admin Notes */}
                        {appDetails.adminNotes && appDetails.adminNotes.length > 0 && (
                            <div className="border rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                    <h3 className="font-semibold">Admin Notes</h3>
                                </div>
                                <div className="space-y-2">
                                    {appDetails.adminNotes.map((note, idx) => (
                                        <div key={idx} className="bg-gray-50 p-3 rounded text-sm">
                                            <p>{note.note}</p>
                                            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                                <span>By: {note.adminId?.name}</span>
                                                <span>{new Date(note.timestamp).toLocaleString()}</span>
                                            </div>
                                            {note.visibleToManager && (
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                                    Visible to Manager
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Payment Info (if applicable) */}
                        {appDetails.paymentStatus && appDetails.paymentStatus !== 'pending' && (
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-3">Payment Information</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">Payment Status:</span>
                                        <p className="font-medium">{appDetails.paymentStatus}</p>
                                    </div>
                                    {appDetails.refundStatus !== 'not_applicable' && (
                                        <div>
                                            <span className="text-gray-600">Refund Status:</span>
                                            <p className="font-medium">{appDetails.refundStatus}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-6 text-center text-gray-500">No details available</div>
                )}

                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetailsModal;
