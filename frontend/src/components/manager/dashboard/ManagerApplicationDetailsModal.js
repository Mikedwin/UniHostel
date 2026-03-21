import React from 'react';
import { X } from 'lucide-react';

const getStatusClasses = (status) => {
  if (status === 'approved') return 'bg-green-100 text-green-700';
  if (status === 'rejected') return 'bg-red-100 text-red-700';
  if (status === 'approved_for_payment') return 'bg-blue-100 text-blue-700';
  if (status === 'paid_awaiting_final') return 'bg-orange-100 text-orange-700';
  return 'bg-yellow-100 text-yellow-700';
};

const getStatusLabel = (status) => {
  if (status === 'approved_for_payment') return 'APPROVED - AWAITING PAYMENT';
  if (status === 'paid_awaiting_final') return 'PAID - AWAITING FINAL';
  return status;
};

const ManagerApplicationDetailsModal = ({ application, isOpen, onClose, onStatusUpdate }) => {
  if (!isOpen || !application) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">Application Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Student Name</p>
                <p className="font-semibold">{application.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{application.studentId?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact Number</p>
                <p className="font-semibold">{application.contactNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full uppercase ${getStatusClasses(application.status)}`}>
                  {getStatusLabel(application.status)}
                </span>
              </div>
              {application.accessCode && (
                <div>
                  <p className="text-sm text-gray-600">Access Code</p>
                  <code className="bg-gray-100 px-3 py-2 rounded font-mono text-sm">{application.accessCode}</code>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Hostel</p>
                <p className="font-semibold">{application.hostelId?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold">{application.hostelId?.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Room Type</p>
                <p className="font-semibold">{application.roomType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Semester</p>
                <p className="font-semibold">{application.semester}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Applied On</p>
                <p className="font-semibold">{new Date(application.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {application.message && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Message</p>
                <p className="bg-gray-50 p-3 rounded border">{application.message}</p>
              </div>
            )}

            {application.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    onStatusUpdate(application._id, 'approve_for_payment');
                    onClose();
                  }}
                  className="flex-1 text-white px-4 py-2 rounded"
                  style={{ backgroundColor: '#23817A' }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor = '#1a6159';
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor = '#23817A';
                  }}
                >
                  Approve for Payment
                </button>
                <button
                  onClick={() => {
                    onStatusUpdate(application._id, 'reject');
                    onClose();
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Reject Application
                </button>
              </div>
            )}
            {application.status === 'paid_awaiting_final' && (
              <div className="pt-4 border-t">
                <button
                  onClick={() => {
                    onStatusUpdate(application._id, 'final_approve');
                    onClose();
                  }}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Final Approve and Issue Access Code
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerApplicationDetailsModal;
