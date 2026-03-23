import React, { lazy, useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import UserActionModal from '../components/admin/UserActionModal';
import UserDetailsModal from '../components/admin/UserDetailsModal';
import ApplicationDetailsModal from '../components/admin/ApplicationDetailsModal';
import ApplicationActionModal from '../components/admin/ApplicationActionModal';
import LoadingSpinner from '../components/LoadingSpinner';
import AdminStatsSection from '../components/admin/dashboard/AdminStatsSection';
import AdminTabContent from '../components/admin/dashboard/AdminTabContent';
import AdminTabNavigation from '../components/admin/dashboard/AdminTabNavigation';

const UserManagementTable = lazy(() => import('../components/admin/UserManagementTable'));
const ApplicationManagementTable = lazy(() => import('../components/admin/ApplicationManagementTable'));
const AnalyticsDashboard = lazy(() => import('../components/admin/AnalyticsDashboard'));
const AdminTransactions = lazy(() => import('../components/admin/AdminTransactions'));
const ManagerRegistrationForm = lazy(() => import('../components/admin/ManagerRegistrationForm'));
const VisitorTracking = lazy(() => import('../components/admin/VisitorTracking'));

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [managers, setManagers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, message: '', onConfirm: null });
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [appModalAction, setAppModalAction] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [appDetailsModalOpen, setAppDetailsModalOpen] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [selectedHistoryLogs, setSelectedHistoryLogs] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [emailStatus, setEmailStatus] = useState(null);
  const [emailStatusLoading, setEmailStatusLoading] = useState(false);
  const [emailTestLoading, setEmailTestLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchDashboardData();
      fetchEmailStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, hostelsRes, managersRes, logsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/admin/hostels`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/admin/managers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/admin/logs?limit=20`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data);
      setHostels(hostelsRes.data);
      setManagers(managersRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      console.error('Admin dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/logs/history?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistoryLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch history logs:', err);
      showError('Failed to fetch history logs');
    }
  };

  const fetchEmailStatus = async () => {
    try {
      setEmailStatusLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/email/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmailStatus(res.data);
    } catch (err) {
      console.error('Failed to fetch email status:', err);
      showError('Unable to check email delivery status right now');
    } finally {
      setEmailStatusLoading(false);
    }
  };

  const sendTestEmail = async () => {
    try {
      setEmailTestLoading(true);
      const res = await axios.post(`${API_URL}/api/admin/email/test`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmailStatus(res.data.status || null);
      showSuccess(res.data.message || 'Test email sent');
    } catch (err) {
      const nextStatus = err.response?.data?.status;
      if (nextStatus) {
        setEmailStatus(nextStatus);
      }
      showError(err.response?.data?.error || 'Unable to send a test email right now');
    } finally {
      setEmailTestLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'logs-history') {
      fetchHistoryLogs();
    }
  };

  const toggleHostelActive = async (hostelId) => {
    if (!window.confirm('Are you sure you want to change this hostel status?')) return;
    try {
      await axios.patch(`${API_URL}/api/admin/hostels/${hostelId}/toggle-active`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update hostel status');
    }
  };

  const flagHostel = async (hostelId) => {
    const reason = prompt('Enter reason for flagging this hostel:');
    if (!reason) return;
    try {
      await axios.patch(`${API_URL}/api/admin/hostels/${hostelId}/flag`, { reason }, { headers: { Authorization: `Bearer ${token}` } });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to flag hostel');
    }
  };

  const deleteHostel = async (hostelId) => {
    if (!window.confirm('Are you sure you want to DELETE this hostel? This action cannot be undone and will remove it from the browse section.')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/hostels/${hostelId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to delete hostel');
    }
  };

  const handleUserAction = (action, user) => {
    if (action === 'view') {
      setSelectedUser(user);
      setDetailsModalOpen(true);
    } else if (action.startsWith('bulk-')) {
      handleBulkAction(action.replace('bulk-', ''), user);
    } else {
      setModalAction(action);
      setSelectedUser(user);
      setModalOpen(true);
    }
  };

  const handleActionConfirm = async (data) => {
    setActionLoading(true);
    try {
      let endpoint = '';
      let method = 'patch';
      let payload = data;

      switch (modalAction) {
        case 'suspend':
          endpoint = `/api/admin/users/${selectedUser._id}/suspend`;
          break;
        case 'ban':
          endpoint = `/api/admin/users/${selectedUser._id}/ban`;
          break;
        case 'activate':
          endpoint = `/api/admin/users/${selectedUser._id}/activate`;
          break;
        case 'verify':
          endpoint = `/api/admin/users/${selectedUser._id}/verify`;
          break;
        case 'reject':
          endpoint = `/api/admin/users/${selectedUser._id}/reject`;
          break;
        case 'reset-password':
          endpoint = `/api/admin/users/${selectedUser._id}/reset-password`;
          method = 'post';
          break;
        case 'delete':
          endpoint = `/api/admin/users/${selectedUser._id}`;
          method = 'delete';
          break;
        default:
          throw new Error('Unknown action');
      }

      const res = await axios[method](`${API_URL}${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (modalAction === 'reset-password' && res.data.temporaryPassword) {
        alert(`Password reset successful!\n\nTemporary Password: ${res.data.temporaryPassword}\n\nPlease save this password and share it with the user securely.`);
      }

      showSuccess(res.data.message || 'Action completed successfully');
      setModalOpen(false);
      setSelectedUser(null);
      setModalAction('');
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action, userIds) => {
    const reason = action === 'suspend' || action === 'ban' ? prompt(`Enter reason for bulk ${action}:`) : null;
    if ((action === 'suspend' || action === 'ban') && !reason) return;

    if (!window.confirm(`Are you sure you want to ${action} ${userIds.length} user(s)?`)) return;

    try {
      const res = await axios.post(`${API_URL}/api/admin/users/bulk-action`, {
        userIds,
        action,
        reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { success, failed } = res.data.results;
      let message = `Bulk action completed: ${success.length} succeeded`;
      if (failed.length > 0) message += `, ${failed.length} failed`;
      showSuccess(message);
    } catch (err) {
      alert(err.response?.data?.error || 'Bulk action failed');
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const showConfirm = (message, onConfirm) => {
    setConfirmDialog({ open: true, message, onConfirm });
  };

  const handleConfirmClose = (confirmed) => {
    if (confirmed && confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    setConfirmDialog({ open: false, message: '', onConfirm: null });
  };

  const tabFallback = (message) => (
    <div className="py-10">
      <LoadingSpinner message={message} />
    </div>
  );

  const handleApplicationAction = (action, app, refreshCallback) => {
    if (action === 'view') {
      setSelectedApp(app);
      setAppDetailsModalOpen(true);
    } else if (action === 'delete') {
      handleDeleteApplication(app, refreshCallback);
    } else if (action.startsWith('bulk-')) {
      handleBulkApplicationAction(action.replace('bulk-', ''), app, refreshCallback);
    } else {
      setAppModalAction(action);
      setSelectedApp(app);
      setAppModalOpen(true);
    }
  };

  const handleDeleteApplication = async (app, refreshCallback) => {
    showConfirm(
      `Are you sure you want to delete this application from ${app.studentName}?\n\nThis action cannot be undone.`,
      async () => {
        try {
          await axios.delete(`${API_URL}/api/admin/applications/${app._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          showSuccess('Application deleted successfully');
          if (refreshCallback) refreshCallback();
          fetchDashboardData();
        } catch (err) {
          showError(err.response?.data?.error || 'Failed to delete application');
        }
      }
    );
  };

  const handleAppActionConfirm = async (data) => {
    setActionLoading(true);
    try {
      let endpoint = '';
      let method = 'post';
      let payload = data;

      switch (appModalAction) {
        case 'approve':
          endpoint = `/api/admin/applications/${selectedApp._id}/override`;
          method = 'patch';
          payload = { status: 'approved', reason: data.reason };
          break;
        case 'reject':
          endpoint = `/api/admin/applications/${selectedApp._id}/override`;
          method = 'patch';
          payload = { status: 'rejected', reason: data.reason };
          break;
        case 'note':
          endpoint = `/api/admin/applications/${selectedApp._id}/note`;
          payload = { note: data.note, visibleToManager: data.visibleToManager };
          break;
        case 'dispute':
          endpoint = `/api/admin/applications/${selectedApp._id}/dispute`;
          payload = { disputeReason: data.disputeReason, disputeDetails: data.disputeDetails };
          break;
        case 'resolve-dispute':
          endpoint = `/api/admin/applications/${selectedApp._id}/dispute/resolve`;
          method = 'patch';
          payload = { resolution: data.resolution, newStatus: data.newStatus };
          break;
        case 'refund':
          endpoint = `/api/admin/applications/${selectedApp._id}/refund`;
          payload = { refundAmount: parseFloat(data.refundAmount), reason: data.reason };
          break;
        default:
          throw new Error('Unknown action');
      }

      const res = await axios[method](`${API_URL}${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showSuccess(res.data.message || 'Action completed successfully');
      setAppModalOpen(false);
      setSelectedApp(null);
      setAppModalAction('');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkApplicationAction = async (action, appIds, refreshCallback) => {
    if (action === 'delete') {
      showConfirm(
        `Are you sure you want to delete ${appIds.length} application(s)?\n\nThis action cannot be undone.`,
        async () => {
          try {
            const deletePromises = appIds.map((id) => axios.delete(`${API_URL}/api/admin/applications/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            }));
            await Promise.all(deletePromises);
            showSuccess(`Successfully deleted ${appIds.length} application(s)`);
            if (refreshCallback) refreshCallback();
            fetchDashboardData();
          } catch (err) {
            showError(err.response?.data?.error || 'Bulk delete failed');
          }
        }
      );
      return;
    }

    const reason = prompt(`Enter reason for bulk ${action}:`);
    if (!reason) return;

    if (!window.confirm(`Are you sure you want to ${action} ${appIds.length} application(s)?`)) return;

    try {
      const res = await axios.post(`${API_URL}/api/admin/applications/bulk-action`, {
        applicationIds: appIds,
        action,
        reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { success, failed } = res.data.results;
      let message = `Bulk action completed: ${success.length} succeeded`;
      if (failed.length > 0) message += `, ${failed.length} failed`;
      showSuccess(message);
      if (refreshCallback) refreshCallback();
      fetchDashboardData();
    } catch (err) {
      showError(err.response?.data?.error || 'Bulk action failed');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading admin dashboard..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">System Overseer & Control Center - Analytics Enabled</p>
          </div>
          <Link
            to="/change-password"
            className="inline-flex items-center justify-center gap-2 rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <KeyRound className="w-4 h-4" />
            Change Password
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <AdminStatsSection stats={stats} />

        <div className="mb-6 rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <Mail className="h-5 w-5" />
                <h2 className="text-lg font-semibold text-gray-900">Email Security Check</h2>
              </div>
              <p className="text-sm text-gray-600">
                Confirm email delivery here before turning privileged MFA back on.
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
                <span>
                  Sender: {emailStatus?.emailUser || 'Not configured'}
                </span>
                <span>
                  Status: {emailStatusLoading
                    ? 'Checking...'
                    : emailStatus?.verified
                      ? 'Ready'
                      : emailStatus?.configured
                        ? 'Needs attention'
                        : 'Not configured'}
                </span>
                <span>
                  App password format: {emailStatus?.passwordLooksLikeAppPassword ? 'Looks valid' : 'Check it'}
                </span>
              </div>
              {!emailStatus?.verified && (
                <p className="text-sm text-amber-700">
                  If the test fails, re-copy the Gmail App Password into Render. Google often shows it in groups, but the app now ignores spaces automatically.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={fetchEmailStatus}
                disabled={emailStatusLoading}
                className="inline-flex items-center justify-center gap-2 rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${emailStatusLoading ? 'animate-spin' : ''}`} />
                Refresh Status
              </button>
              <button
                type="button"
                onClick={sendTestEmail}
                disabled={emailTestLoading || emailStatusLoading}
                className="inline-flex items-center justify-center gap-2 rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Mail className="h-4 w-4" />
                {emailTestLoading ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <AdminTabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

          <div className="p-3 sm:p-4">
            <AdminTabContent
              activeTab={activeTab}
              token={token}
              stats={stats}
              hostels={hostels}
              managers={managers}
              logs={logs}
              historyLogs={historyLogs}
              selectedLogs={selectedLogs}
              selectedHistoryLogs={selectedHistoryLogs}
              setSelectedLogs={setSelectedLogs}
              setSelectedHistoryLogs={setSelectedHistoryLogs}
              onApplicationAction={handleApplicationAction}
              onUserAction={handleUserAction}
              onDeleteHostel={deleteHostel}
              onFlagHostel={flagHostel}
              onShowConfirm={showConfirm}
              onShowError={showError}
              onShowSuccess={showSuccess}
              onToggleHostelActive={toggleHostelActive}
              onTabChange={handleTabChange}
              tabFallback={tabFallback}
              UserManagementTable={UserManagementTable}
              AnalyticsDashboard={AnalyticsDashboard}
              AdminTransactions={AdminTransactions}
              VisitorTracking={VisitorTracking}
              ApplicationManagementTable={ApplicationManagementTable}
              ManagerRegistrationForm={ManagerRegistrationForm}
              refreshDashboard={fetchDashboardData}
            />
          </div>
        </div>
      </div>

      <UserActionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
          setModalAction('');
        }}
        action={modalAction}
        user={selectedUser}
        onConfirm={handleActionConfirm}
        loading={actionLoading}
      />

      <UserDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        token={token}
      />

      <ApplicationActionModal
        isOpen={appModalOpen}
        onClose={() => {
          setAppModalOpen(false);
          setSelectedApp(null);
          setAppModalAction('');
        }}
        action={appModalAction}
        application={selectedApp}
        onConfirm={handleAppActionConfirm}
        loading={actionLoading}
      />

      <ApplicationDetailsModal
        isOpen={appDetailsModalOpen}
        onClose={() => {
          setAppDetailsModalOpen(false);
          setSelectedApp(null);
        }}
        application={selectedApp}
        token={token}
        onRefresh={fetchDashboardData}
      />

      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {errorMessage}
        </div>
      )}

      {confirmDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirm Action</h3>
            <p className="text-gray-700 mb-6 whitespace-pre-line">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => handleConfirmClose(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
              <button onClick={() => handleConfirmClose(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
