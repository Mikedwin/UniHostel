import React from 'react';
import { Check, Eye, Search, X } from 'lucide-react';

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

const ManagerApplicationsSection = ({
  applications,
  filteredApplications,
  searchQuery,
  selectedApps,
  setSearchQuery,
  setSelectedApps,
  setShowDetailsModal,
  setStatusFilter,
  setSelectedApp,
  setViewMode,
  stats,
  statusFilter,
  viewMode,
  onArchiveRequest,
  onBulkAction,
  onBulkDeletePermanent,
  onBulkMoveToHistory,
  onContextMenu,
  onPermanentDelete,
  onRestore,
  onStatusUpdate
}) => (
  <div className="lg:col-span-7">
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-lg font-bold">Incoming Applications</h2>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setViewMode('active')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              viewMode === 'active' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              viewMode === 'history' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            History
          </button>
        </div>
      </div>
      {stats.pending > 0 && (
        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
          {stats.pending} Pending
        </span>
      )}
    </div>

    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search student..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved_for_payment">Approved for Payment</option>
          <option value="paid_awaiting_final">Paid - Awaiting Final</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {selectedApps.length > 0 && (
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-600">{selectedApps.length} selected</span>
          {viewMode === 'active' ? (
            <>
              <button
                onClick={() => onBulkAction('approve_for_payment')}
                className="text-white px-3 py-1 rounded text-sm"
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
                onClick={() => onBulkAction('reject')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Reject All
              </button>
              <button
                onClick={onBulkMoveToHistory}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                Move to History
              </button>
            </>
          ) : (
            <button
              onClick={onBulkDeletePermanent}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Delete Permanently
            </button>
          )}
        </div>
      )}
    </div>

    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {filteredApplications.length === 0 ? (
        <p className="p-8 text-gray-500 text-center">
          {applications.length === 0 ? 'No applications yet.' : 'No applications match your filters.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedApps.length === filteredApplications.length && filteredApplications.length > 0}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedApps(filteredApplications.map((application) => application._id));
                      } else {
                        setSelectedApps([]);
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <tr
                  key={application._id}
                  className="hover:bg-gray-50"
                  onContextMenu={(event) => onContextMenu(event, application)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedApps.includes(application._id)}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setSelectedApps([...selectedApps, application._id]);
                        } else {
                          setSelectedApps(selectedApps.filter((id) => id !== application._id));
                        }
                      }}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{application.studentName || application.studentId?.name}</div>
                    <div className="text-xs text-gray-500">{application.studentId?.email}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{application.contactNumber}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{application.hostelId?.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{application.roomType}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{application.semester}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${getStatusClasses(application.status)}`}>
                      {getStatusLabel(application.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {application.accessCode ? (
                      <code className="bg-green-50 text-green-700 px-2 py-1 rounded font-mono text-xs font-semibold">{application.accessCode}</code>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedApp(application);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onStatusUpdate(application._id, 'approve_for_payment')}
                            className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                            title="Approve for Payment"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => onStatusUpdate(application._id, 'reject')}
                            className="text-red-600 hover:bg-red-50 p-1 rounded"
                            title="Reject"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {application.status === 'paid_awaiting_final' && (
                        <button
                          onClick={() => onStatusUpdate(application._id, 'final_approve')}
                          className="text-green-600 hover:bg-green-50 px-3 py-1 rounded text-sm font-medium"
                          title="Final Approve"
                        >
                          Final Approve
                        </button>
                      )}
                      {viewMode === 'active' && ['approved', 'rejected', 'approved_for_payment'].includes(application.status) && (
                        <button
                          onClick={() => onArchiveRequest(application._id)}
                          className="text-gray-600 hover:bg-gray-50 px-3 py-1 rounded text-xs font-medium"
                          title="Move to History"
                        >
                          Move to History
                        </button>
                      )}
                      {viewMode === 'history' && (
                        <>
                          <button
                            onClick={() => onRestore(application._id)}
                            className="px-3 py-1 rounded text-xs"
                            style={{ color: '#23817A', backgroundColor: 'rgba(35, 129, 122, 0.1)' }}
                            onMouseEnter={(event) => {
                              event.currentTarget.style.backgroundColor = 'rgba(35, 129, 122, 0.2)';
                            }}
                            onMouseLeave={(event) => {
                              event.currentTarget.style.backgroundColor = 'rgba(35, 129, 122, 0.1)';
                            }}
                            title="Restore to Active"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => onPermanentDelete(
                              application._id,
                              application.studentName || application.studentId?.name,
                              application.hostelId?.name
                            )}
                            className="px-3 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200"
                            title="Delete Permanently"
                          >
                            Delete Permanently
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
      )}
    </div>
  </div>
);

export default ManagerApplicationsSection;
