import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Calendar, Filter, Download, RotateCcw } from 'lucide-react';
import API_URL from '../../config';

const ManagerTransactions = ({ token, hostels }) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    semester: '',
    hostelId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.hostelId) params.append('hostelId', filters.hostelId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await axios.get(`${API_URL}/api/transactions/manager?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(res.data.transactions);
      setSummary(res.data.summary);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchTransactions();
  };

  const clearFilters = () => {
    setFilters({ semester: '', hostelId: '', startDate: '', endDate: '' });
    setTimeout(() => fetchTransactions(), 100);
  };

  const handleResetTransactions = async () => {
    if (!window.confirm('Are you sure you want to reset YOUR transactions?\n\nThis will only delete your hostel transactions and will not affect admin records.\n\nThis action cannot be undone.')) return;
    
    try {
      const res = await axios.delete(`${API_URL}/api/transactions/manager/reset`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reset transactions');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-white rounded-lg shadow-md p-5 border border-green-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">GH₵{summary?.totalRevenue?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-600">From hostel bookings</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-md p-5 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Transactions</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.totalTransactions || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-600">Successful payments</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg shadow-md p-5 border border-purple-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Avg per Transaction</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                GH₵{summary?.totalTransactions > 0 ? Math.round(summary.totalRevenue / summary.totalTransactions).toLocaleString() : 0}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-600">Average revenue</p>
        </div>
      </div>

      {/* Semester Breakdown */}
      {summary?.bySemester && Object.keys(summary.bySemester).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-5">
          <h3 className="text-lg font-bold mb-4">Revenue by Semester</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(summary.bySemester).map(([semester, data]) => (
              <div key={semester} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-900">{semester}</span>
                  <span className="text-green-600 font-bold">GH₵{data.revenue.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600">{data.count} transaction{data.count !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 shadow-md p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-white p-2 shadow-sm">
              <Filter className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Filter Transactions</h3>
              <p className="text-sm text-gray-500">Refine your transaction list by semester, hostel, and date.</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Semester</span>
            <select
              value={filters.semester}
              onChange={(e) => handleFilterChange('semester', e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Semesters</option>
              <option value="First Semester">First Semester</option>
              <option value="Second Semester">Second Semester</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Hostel</span>
            <select
              value={filters.hostelId}
              onChange={(e) => handleFilterChange('hostelId', e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
              disabled={hostels.length <= 1}
            >
              {hostels.length > 1 && <option value="">All My Hostels</option>}
              {hostels.map(h => (
                <option key={h._id} value={h._id}>{h.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Start Date</span>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 focus:ring-2 focus:ring-primary-500"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">End Date</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 focus:ring-2 focus:ring-primary-500"
            />
          </label>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <button
            onClick={applyFilters}
            className="rounded-md bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="rounded-md bg-white px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-100"
          >
            Clear Filters
          </button>
          <button
            onClick={handleResetTransactions}
            className="flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
          >
            <RotateCcw className="w-4 h-4" />
            Reset My Transactions
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">Transaction History</h3>
          <button className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>
        </div>
        {transactions.length === 0 ? (
          <p className="p-8 text-gray-500 text-center">No transactions found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hostel</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(t.paidAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{t.studentId?.name}</div>
                      <div className="text-xs text-gray-500">{t.studentId?.email}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {t.hostelId?.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {t.roomType}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {t.semester}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600">
                      GH₵{t.hostelFee.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                        {t.paymentStatus.toUpperCase()}
                      </span>
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
};

export default ManagerTransactions;
