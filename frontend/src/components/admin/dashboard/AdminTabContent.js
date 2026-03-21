import React, { Suspense } from 'react';
import axios from 'axios';
import API_URL from '../../../config';

const AdminTabContent = ({
  activeTab,
  token,
  stats,
  hostels,
  managers,
  logs,
  historyLogs,
  selectedLogs,
  selectedHistoryLogs,
  setSelectedLogs,
  setSelectedHistoryLogs,
  onApplicationAction,
  onUserAction,
  onDeleteHostel,
  onFlagHostel,
  onShowConfirm,
  onShowError,
  onShowSuccess,
  onToggleHostelActive,
  onTabChange,
  tabFallback,
  UserManagementTable,
  AnalyticsDashboard,
  AdminTransactions,
  VisitorTracking,
  ApplicationManagementTable,
  ManagerRegistrationForm,
  refreshDashboard
}) => {
  if (activeTab === 'overview') {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Welcome to Admin Dashboard</h3>
          <p className="text-sm text-blue-800">Manage users, hostels, applications, and monitor system activity from this central control hub.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Quick Stats</h4>
            <ul className="text-sm space-y-1">
              <li>{stats?.overview.totalHostels} total hostels ({stats?.overview.activeHostels} active)</li>
              <li>{stats?.overview.totalManagers} managers registered</li>
              <li>{stats?.overview.totalStudents} students registered</li>
              <li>{stats?.overview.totalApplications} applications ({stats?.overview.pendingApplications} pending)</li>
            </ul>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <button onClick={() => onTabChange('users')} className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded text-sm">Manage Users</button>
              <button onClick={() => onTabChange('applications')} className="w-full text-left px-3 py-2 bg-green-50 hover:bg-green-100 rounded text-sm">Review Applications</button>
              <button onClick={() => onTabChange('hostels')} className="w-full text-left px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded text-sm">Manage Hostels</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'users') {
    return (
      <Suspense fallback={tabFallback('Loading users...')}>
        {token ? (
          <UserManagementTable token={token} onAction={onUserAction} />
        ) : (
          <div className="text-center py-8 text-red-600">No authentication token found</div>
        )}
      </Suspense>
    );
  }

  if (activeTab === 'analytics') {
    return (
      <Suspense fallback={tabFallback('Loading analytics...')}>
        <AnalyticsDashboard token={token} />
      </Suspense>
    );
  }

  if (activeTab === 'transactions') {
    return (
      <Suspense fallback={tabFallback('Loading transactions...')}>
        <AdminTransactions token={token} />
      </Suspense>
    );
  }

  if (activeTab === 'visitors') {
    return (
      <Suspense fallback={tabFallback('Loading visitor insights...')}>
        <VisitorTracking />
      </Suspense>
    );
  }

  if (activeTab === 'applications') {
    return (
      <div>
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Payment Verification Tool</h4>
          <p className="text-sm text-blue-800 mb-3">Use this tool to manually verify payments that may have been processed but not updated in the system.</p>
          <div className="flex gap-2">
            <input type="text" placeholder="Application ID" className="flex-1 px-3 py-2 border rounded-md text-sm" id="verifyAppId" />
            <input type="text" placeholder="Payment Reference (optional)" className="flex-1 px-3 py-2 border rounded-md text-sm" id="verifyPayRef" />
            <button
              onClick={async () => {
                const appId = document.getElementById('verifyAppId').value;
                const payRef = document.getElementById('verifyPayRef').value;

                if (!appId) {
                  onShowError('Application ID is required');
                  return;
                }

                try {
                  const res = await axios.post(`${API_URL}/api/payment/admin/verify-payment`, {
                    applicationId: appId,
                    paymentReference: payRef || undefined
                  }, {
                    headers: { Authorization: `Bearer ${token}` }
                  });

                  if (res.data.success) {
                    onShowSuccess(`Payment verified! Paystack: ${res.data.paystackAmount} GHS, App: ${res.data.applicationAmount} GHS`);
                    document.getElementById('verifyAppId').value = '';
                    document.getElementById('verifyPayRef').value = '';
                  } else {
                    onShowError(res.data.message);
                  }
                } catch (err) {
                  onShowError(err.response?.data?.message || 'Verification failed');
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Verify Payment
            </button>
          </div>
        </div>
        <Suspense fallback={tabFallback('Loading applications...')}>
          <ApplicationManagementTable token={token} onAction={onApplicationAction} />
        </Suspense>
      </div>
    );
  }

  if (activeTab === 'hostels') {
    return (
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hostel</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rooms</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hostels.map((hostel) => (
                <tr key={hostel._id}>
                  <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{hostel.name}</td>
                  <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{hostel.managerId?.name}</td>
                  <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{hostel.roomTypes?.length} types</td>
                  <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">
                    <span className={`px-2 py-1 text-xs rounded ${hostel.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {hostel.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {hostel.isFlagged && <span className="ml-2 px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">Flagged</span>}
                  </td>
                  <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">
                    <button onClick={() => onToggleHostelActive(hostel._id)} className="text-blue-600 hover:underline mr-2">Toggle</button>
                    <button onClick={() => onFlagHostel(hostel._id)} className="text-orange-600 hover:underline mr-2">Flag</button>
                    <button onClick={() => onDeleteHostel(hostel._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeTab === 'managers') {
    return (
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hostels</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Applications</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {managers.map((manager) => (
                <tr key={manager._id}>
                  <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{manager.name}</td>
                  <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{manager.email}</td>
                  <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{manager.hostelCount}</td>
                  <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{manager.applicationCount}</td>
                  <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{new Date(manager.createdAt).toLocaleDateString()}</td>
                  <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">
                    <button onClick={() => onUserAction('delete', manager)} className="text-red-600 hover:text-red-800 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeTab === 'register-manager') {
    return (
      <Suspense fallback={tabFallback('Loading manager registration...')}>
        <ManagerRegistrationForm token={token} onSuccess={() => { onShowSuccess('Manager registered successfully'); refreshDashboard(); }} />
      </Suspense>
    );
  }

  if (activeTab === 'logs-history') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Archived Logs</h3>
          <button onClick={() => onTabChange('logs')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Back to Active Logs
          </button>
        </div>

        {selectedHistoryLogs.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium">{selectedHistoryLogs.length} archived log(s) selected</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onShowConfirm(
                    `Restore ${selectedHistoryLogs.length} selected log(s) from history?\n\nThey will be moved back to active logs.`,
                    async () => {
                      try {
                        const res = await axios.patch(`${API_URL}/api/admin/logs/restore`, { logIds: selectedHistoryLogs }, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        onShowSuccess(`Restored ${res.data.count} log(s) from history`);
                        setSelectedHistoryLogs([]);
                        refreshDashboard();
                      } catch (err) {
                        onShowError('Failed to restore logs from history');
                      }
                    }
                  );
                }}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Restore Selected
              </button>
              <button
                onClick={() => {
                  onShowConfirm(
                    `Permanently delete ${selectedHistoryLogs.length} selected log(s)?\n\nThis action cannot be undone.`,
                    async () => {
                      try {
                        await Promise.all(selectedHistoryLogs.map((id) => axios.delete(`${API_URL}/api/admin/logs/${id}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        })));
                        onShowSuccess(`Permanently deleted ${selectedHistoryLogs.length} log(s)`);
                        setSelectedHistoryLogs([]);
                        refreshDashboard();
                      } catch (err) {
                        onShowError('Failed to delete logs');
                      }
                    }
                  );
                }}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete Permanently
              </button>
              <button onClick={() => setSelectedHistoryLogs([])} className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">Clear</button>
            </div>
          </div>
        )}

        {historyLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No archived logs found</div>
        ) : (
          historyLogs.map((log) => (
            <div key={log._id} className="border-l-4 border-gray-400 bg-gray-50 p-3 flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedHistoryLogs.includes(log._id)}
                onChange={(event) => {
                  if (event.target.checked) {
                    setSelectedHistoryLogs([...selectedHistoryLogs, log._id]);
                  } else {
                    setSelectedHistoryLogs(selectedHistoryLogs.filter((id) => id !== log._id));
                  }
                }}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{log.action}</p>
                <p className="text-xs text-gray-600">{log.details}</p>
                <p className="text-xs text-gray-500 mt-1">By {log.adminId?.name} • {new Date(log.timestamp).toLocaleString()}</p>
                <p className="text-xs text-orange-600 mt-1">Archived: {new Date(log.archivedAt).toLocaleString()} by {log.archivedBy?.name}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onShowConfirm('Restore this log from history?\n\nIt will be moved back to active logs.', async () => {
                      try {
                        await axios.patch(`${API_URL}/api/admin/logs/restore`, { logIds: [log._id] }, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        onShowSuccess('Log restored from history');
                        refreshDashboard();
                      } catch (err) {
                        onShowError('Failed to restore log from history');
                      }
                    });
                  }}
                  className="text-green-600 hover:text-green-800 text-sm"
                >
                  Restore
                </button>
                <button
                  onClick={() => {
                    onShowConfirm('Permanently delete this log?\n\nThis action cannot be undone.', async () => {
                      try {
                        await axios.delete(`${API_URL}/api/admin/logs/${log._id}`, { headers: { Authorization: `Bearer ${token}` } });
                        onShowSuccess('Log permanently deleted');
                        refreshDashboard();
                      } catch (err) {
                        onShowError('Failed to delete log');
                      }
                    });
                  }}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  if (activeTab === 'trash') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold mb-4">Deleted Hostels</h3>
          <p className="text-gray-500">Trash feature coming soon</p>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4">Deleted Users</h3>
          <p className="text-gray-500">Trash feature coming soon</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'logs') {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          <button onClick={refreshDashboard} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Active Logs</button>
          <button onClick={() => onTabChange('logs-history')} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">View History</button>
        </div>

        {selectedLogs.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium">{selectedLogs.length} log(s) selected</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onShowConfirm(
                    `Move ${selectedLogs.length} selected log(s) to history?\n\nThey can be restored later if needed.`,
                    async () => {
                      try {
                        const res = await axios.patch(`${API_URL}/api/admin/logs/archive`, { logIds: selectedLogs }, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        onShowSuccess(`Moved ${res.data.count} log(s) to history`);
                        setSelectedLogs([]);
                        refreshDashboard();
                      } catch (err) {
                        onShowError('Failed to move logs to history');
                      }
                    }
                  );
                }}
                className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
              >
                Move Selected to History
              </button>
              <button
                onClick={() => {
                  onShowConfirm(
                    `Delete ${selectedLogs.length} selected log(s)?\n\nThis action cannot be undone.`,
                    async () => {
                      try {
                        await Promise.all(selectedLogs.map((id) => axios.delete(`${API_URL}/api/admin/logs/${id}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        })));
                        onShowSuccess(`Deleted ${selectedLogs.length} log(s)`);
                        setSelectedLogs([]);
                        refreshDashboard();
                      } catch (err) {
                        onShowError('Failed to delete logs');
                      }
                    }
                  );
                }}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete Selected
              </button>
              <button onClick={() => setSelectedLogs([])} className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">Clear</button>
            </div>
          </div>
        )}

        {logs.map((log) => (
          <div key={log._id} className="border-l-4 border-blue-500 bg-gray-50 p-3 flex items-start gap-3">
            <input
              type="checkbox"
              checked={selectedLogs.includes(log._id)}
              onChange={(event) => {
                if (event.target.checked) {
                  setSelectedLogs([...selectedLogs, log._id]);
                } else {
                  setSelectedLogs(selectedLogs.filter((id) => id !== log._id));
                }
              }}
              className="mt-1"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{log.action}</p>
              <p className="text-xs text-gray-600">{log.details}</p>
              <p className="text-xs text-gray-500 mt-1">By {log.adminId?.name} • {new Date(log.timestamp).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onShowConfirm('Move this log to history?\n\nIt can be restored later if needed.', async () => {
                    try {
                      await axios.patch(`${API_URL}/api/admin/logs/archive`, { logIds: [log._id] }, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      onShowSuccess('Log moved to history');
                      refreshDashboard();
                    } catch (err) {
                      onShowError('Failed to move log to history');
                    }
                  });
                }}
                className="text-orange-600 hover:text-orange-800 text-sm"
              >
                Archive
              </button>
              <button
                onClick={() => {
                  onShowConfirm('Delete this log?\n\nThis action cannot be undone.', async () => {
                    try {
                      await axios.delete(`${API_URL}/api/admin/logs/${log._id}`, { headers: { Authorization: `Bearer ${token}` } });
                      onShowSuccess('Log deleted');
                      refreshDashboard();
                    } catch (err) {
                      onShowError('Failed to delete log');
                    }
                  });
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default AdminTabContent;

