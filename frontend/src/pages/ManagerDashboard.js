import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import Swal from 'sweetalert2';
import LoadingSpinner from '../components/LoadingSpinner';
import ManagerApplicationsSection from '../components/manager/dashboard/ManagerApplicationsSection';
import ManagerApplicationDetailsModal from '../components/manager/dashboard/ManagerApplicationDetailsModal';
import ManagerContextMenu from '../components/manager/dashboard/ManagerContextMenu';
import ManagerDashboardHeader from '../components/manager/dashboard/ManagerDashboardHeader';
import ManagerListingsSection from '../components/manager/dashboard/ManagerListingsSection';
import ManagerStatsGrid from '../components/manager/dashboard/ManagerStatsGrid';

const ManagerAnalytics = lazy(() => import('../components/manager/ManagerAnalytics'));
const ManagerTransactions = lazy(() => import('../components/manager/ManagerTransactions'));

const ManagerDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('active');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApps, setSelectedApps] = useState([]);
  const [toast, setToast] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleContextMenu = (event, application) => {
    event.preventDefault();
    if (viewMode === 'active' && ['approved', 'rejected', 'approved_for_payment'].includes(application.status)) {
      setContextMenu({ x: event.pageX, y: event.pageY, app: application });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const archived = viewMode === 'history' ? 'true' : 'false';
      const [appRes, hostRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.MANAGER_APPLICATIONS}?archived=${archived}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_ENDPOINTS.HOSTELS}/my-listings`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setApplications(Array.isArray(appRes.data) ? appRes.data : []);
      setHostels(Array.isArray(hostRes.data) ? hostRes.data : []);
      setUserInfo(user);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load dashboard data');
      setApplications([]);
      setHostels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }

    const handleClick = () => {
      setContextMenu(null);
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, viewMode]);

  const handleArchive = async (id, archive) => {
    try {
      await axios.patch(
        `${API_ENDPOINTS.APPLICATIONS}/${id}/archive`,
        { archive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(archive ? 'Moved to history successfully' : 'Restored successfully');
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Operation failed', 'error');
    }
  };

  const handleArchiveWithConfirm = async (appId) => {
    const result = await Swal.fire({
      title: 'Move to History',
      text: 'Are you sure you want to move this item to history?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, move it',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      handleArchive(appId, true);
    }
  };

  const handleArchiveFromContext = async (appId) => {
    setContextMenu(null);
    await handleArchiveWithConfirm(appId);
  };

  const handlePermanentDelete = async (id, studentName, hostelName) => {
    const result = await Swal.fire({
      title: 'Delete Permanently?',
      html: `<p>Are you sure you want to <strong>permanently delete</strong> this application?</p>
             <p class="text-sm text-gray-600 mt-2">Student: <strong>${studentName}</strong></p>
             <p class="text-sm text-gray-600">Hostel: <strong>${hostelName}</strong></p>
             <p class="text-red-600 font-semibold mt-3">This action cannot be undone.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete Permanently',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'px-4 py-2 rounded-md font-medium',
        cancelButton: 'px-4 py-2 rounded-md font-medium'
      }
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_ENDPOINTS.APPLICATIONS}/${id}/permanent`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Application has been permanently deleted.',
          icon: 'success',
          confirmButtonColor: '#23817A',
          timer: 2000
        });
        fetchData();
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: 'Error',
          text: err.response?.data?.error || 'Failed to delete application',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const handleStatusUpdate = async (id, action) => {
    try {
      const response = await axios.patch(
        API_ENDPOINTS.APPLICATION_STATUS(id),
        { action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.error) {
        Swal.fire({
          title: 'Error',
          text: response.data.error,
          icon: 'error',
          confirmButtonColor: '#3b82f6'
        });
        return;
      }

      if (action === 'final_approve' && response.data.accessCode) {
        showToast(`Application approved! Access Code: ${response.data.accessCode}`);
      } else if (action === 'approve_for_payment') {
        showToast('Application approved for payment!');
      } else if (action === 'reject') {
        showToast('Application rejected');
      } else {
        showToast('Application updated successfully');
      }

      fetchData();
    } catch (err) {
      console.error('Status update error:', err);

      let errorMsg = 'Failed to update application status';
      if (err.response) {
        errorMsg = err.response.data?.error || err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMsg = 'No response from server. Please check your connection.';
      } else {
        errorMsg = err.message;
      }

      Swal.fire({
        title: 'Error',
        text: errorMsg,
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const handleDeleteHostel = async (id, name) => {
    const result = await Swal.fire({
      title: 'Delete Hostel',
      text: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(API_ENDPOINTS.HOSTEL_DETAIL(id), {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
        Swal.fire({
          title: 'Deleted!',
          text: 'Hostel has been deleted.',
          icon: 'success',
          confirmButtonColor: '#3b82f6',
          timer: 2000
        });
      } catch (err) {
        console.error('Error deleting hostel:', err);
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete hostel',
          icon: 'error',
          confirmButtonColor: '#3b82f6'
        });
      }
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedApps.length === 0) return;
    const actionText = action === 'approve_for_payment' ? 'Approve for Payment' : 'Reject';

    const result = await Swal.fire({
      title: `${actionText} Applications`,
      text: `${actionText} ${selectedApps.length} application(s)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, proceed',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const results = await Promise.allSettled(
          selectedApps.map((id) =>
            axios.patch(API_ENDPOINTS.APPLICATION_STATUS(id), { action }, {
              headers: { Authorization: `Bearer ${token}` }
            })
          )
        );

        const failed = results.filter((resultItem) => resultItem.status === 'rejected');
        if (failed.length > 0) {
          const errors = failed.map((failure) => failure.reason?.response?.data?.error || 'Unknown error').join(', ');
          Swal.fire({
            title: 'Some Actions Failed',
            text: errors,
            icon: 'error',
            confirmButtonColor: '#3b82f6'
          });
        } else {
          Swal.fire({
            title: 'Success!',
            text: 'All applications updated successfully',
            icon: 'success',
            confirmButtonColor: '#3b82f6',
            timer: 2000
          });
        }

        setSelectedApps([]);
        fetchData();
      } catch (err) {
        console.error('Bulk action error:', err);
        Swal.fire({
          title: 'Error',
          text: 'Some actions failed',
          icon: 'error',
          confirmButtonColor: '#3b82f6'
        });
      }
    }
  };

  const handleMoveSelectedToHistory = async () => {
    const result = await Swal.fire({
      title: 'Move to History',
      text: `Move ${selectedApps.length} application(s) to history?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, move them',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(
          selectedApps.map((id) =>
            axios.patch(`${API_ENDPOINTS.APPLICATIONS}/${id}/archive`, { archive: true }, {
              headers: { Authorization: `Bearer ${token}` }
            })
          )
        );
        showToast('Applications moved to history');
        setSelectedApps([]);
        fetchData();
      } catch (err) {
        showToast('Some operations failed', 'error');
      }
    }
  };

  const handleDeleteSelectedFromHistory = async () => {
    const result = await Swal.fire({
      title: 'Delete Permanently?',
      html: `<p>Are you sure you want to <strong>permanently delete ${selectedApps.length} application(s)</strong>?</p>
             <p class="text-red-600 font-semibold mt-3">This action cannot be undone.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete Permanently',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(
          selectedApps.map((id) =>
            axios.delete(`${API_ENDPOINTS.APPLICATIONS}/${id}/permanent`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          )
        );
        Swal.fire({
          title: 'Deleted!',
          text: 'Applications permanently deleted.',
          icon: 'success',
          confirmButtonColor: '#23817A',
          timer: 2000
        });
        setSelectedApps([]);
        fetchData();
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: 'Some deletions failed',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery
        || application.studentName?.toLowerCase().includes(query)
        || application.studentId?.email?.toLowerCase().includes(query)
        || application.contactNumber?.includes(searchQuery);
      return matchesStatus && matchesSearch;
    });
  }, [applications, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const totalApps = applications.length;
    const pending = applications.filter((application) => application.status === 'pending').length;
    const approved = applications.filter((application) => application.status === 'approved').length;
    const rejected = applications.filter((application) => application.status === 'rejected').length;
    const totalCapacity = hostels.reduce((sum, hostel) => sum + hostel.roomTypes.reduce((roomSum, room) => roomSum + room.totalCapacity, 0), 0);
    const totalOccupied = hostels.reduce((sum, hostel) => sum + hostel.roomTypes.reduce((roomSum, room) => roomSum + (room.occupiedCapacity || 0), 0), 0);
    const occupancyRate = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : 0;
    const activeHostels = hostels.filter((hostel) => hostel.isActive !== false).length;
    const inactiveHostels = hostels.length - activeHostels;

    return {
      totalApps,
      pending,
      approved,
      rejected,
      totalHostels: hostels.length,
      activeHostels,
      inactiveHostels,
      occupancyRate,
      totalCapacity,
      totalOccupied
    };
  }, [applications, hostels]);

  const tabFallback = (message) => (
    <div className="rounded-lg bg-white shadow-sm">
      <LoadingSpinner message={message} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white flex items-center gap-2 animate-fade-in`}
        >
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {userInfo && !userInfo.isVerified && userInfo.accountStatus === 'pending_verification' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Account Pending Verification</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Your manager account is awaiting admin approval. You cannot create or manage hostels until your account is verified. This usually takes 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ManagerDashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {loading && <LoadingSpinner message="Loading your dashboard..." />}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-semibold">Error loading dashboard</p>
          <p className="text-sm">{error}</p>
          <button onClick={fetchData} className="mt-2 text-sm underline hover:no-underline">
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {activeTab === 'analytics' ? (
            <Suspense fallback={tabFallback('Loading analytics...')}>
              <ManagerAnalytics applications={applications} hostels={hostels} />
            </Suspense>
          ) : activeTab === 'transactions' ? (
            <Suspense fallback={tabFallback('Loading transactions...')}>
              <ManagerTransactions token={token} hostels={hostels} />
            </Suspense>
          ) : (
            <>
              <ManagerStatsGrid stats={stats} />

              <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                <ManagerApplicationsSection
                  applications={applications}
                  filteredApplications={filteredApplications}
                  searchQuery={searchQuery}
                  selectedApps={selectedApps}
                  setSearchQuery={setSearchQuery}
                  setSelectedApps={setSelectedApps}
                  setShowDetailsModal={setShowDetailsModal}
                  setStatusFilter={setStatusFilter}
                  setSelectedApp={setSelectedApp}
                  setViewMode={setViewMode}
                  stats={stats}
                  statusFilter={statusFilter}
                  viewMode={viewMode}
                  onArchiveRequest={handleArchiveWithConfirm}
                  onBulkAction={handleBulkAction}
                  onBulkDeletePermanent={handleDeleteSelectedFromHistory}
                  onBulkMoveToHistory={handleMoveSelectedToHistory}
                  onContextMenu={handleContextMenu}
                  onPermanentDelete={handlePermanentDelete}
                  onRestore={(id) => handleArchive(id, false)}
                  onStatusUpdate={handleStatusUpdate}
                />
                <ManagerListingsSection hostels={hostels} onDeleteHostel={handleDeleteHostel} />
              </div>

              <ManagerApplicationDetailsModal
                application={selectedApp}
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                onStatusUpdate={handleStatusUpdate}
              />
            </>
          )}
        </>
      )}

      <ManagerContextMenu contextMenu={contextMenu} onArchiveFromContext={handleArchiveFromContext} />
    </div>
  );
};

export default ManagerDashboard;
