import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, Calendar, Filter, Download, PieChart, RotateCcw } from 'lucide-react';
import API_URL from '../../config';

const AdminTransactions = ({ token }) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    semester: '',
    hostelId: '',
    managerId: '',
    startDate: '',
    endDate: ''
  });
  const [hostels, setHostels] = useState([]);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, hostelsRes, managersRes] = await Promise.all([
        axios.get(`${API_URL}/api/transactions/admin`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/admin/hostels`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/admin/managers`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setTransactions(transRes.data.transactions);
      setSummary(transRes.data.summary);
      setHostels(hostelsRes.data);
      setManagers(managersRes.data);
    } catch (err) {
      console.error('Error fetching admin transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.hostelId) params.append('hostelId', filters.hostelId);
      if (filters.managerId) params.append('managerId', filters.managerId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await axios.get(`${API_URL}/api/transactions/admin?${params}`, {
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
    setFilters({ semester: '', hostelId: '', managerId: '', startDate: '', endDate: '' });
    setTimeout(() => fetchData(), 100);
  };

  const handleResetTransactions = async () => {
    if (!window.confirm('⚠️ WARNING: This will permanently delete ALL transactions from the system (including manager transactions).\n\nThis action cannot be undone. Are you absolutely sure?')) return;
    
    try {
      const res = await axios.delete(`${API_URL}/api/transactions/admin/reset`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
      fetchData();
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-md p-5 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">GH₵{summary?.totalRevenue?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-600">System-wide revenue</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white rounded-lg shadow-md p-5 border border-green-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Admin Commission</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">GH₵{summary?.totalAdminCommission?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-600">Platform earnings</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg shadow-md p-5 border border-purple-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Hostel Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">GH₵{summary?.totalHostelRevenue?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-600">Manager earnings</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-white rounded-lg shadow-md p-5 border border-orange-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">Transactions</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.totalTransactions || 0}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-600">Successful payments</p>
        </div>
      </div>

      {/* Semester Breakdown */}
      {summary?.bySemester && Object.keys(summary.bySemester).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-5">
          <h3 className="text-lg font-bold mb-4">Revenue by Semester</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(summary.bySemester).map(([semester, data]) => (
              <div key={semester} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-semibold text-gray-900">{semester}</span>
                  <span className="text-blue-600 font-bold">GH₵{data.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admin Commission:</span>
                    <span className="text-green-600 font-semibold">GH₵{data.adminCommission.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hostel Revenue:</span>
                    <span className="text-purple-600 font-semibold">GH₵{data.hostelRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t">
                    <span className="text-gray-600">Transactions:</span>
                    <span className="font-semibold">{data.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hostel Breakdown */}
      {summary?.byHostel && Object.keys(summary.byHostel).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-5">
          <h3 className="text-lg font-bold mb-4">Revenue by Hostel</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hostel</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin Commission</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hostel Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(summary.byHostel).map(([hostelId, data]) => (
                  <tr key={hostelId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {data.hostelName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {data.count}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-blue-600">
                      GH₵{data.totalRevenue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600">
                      GH₵{data.adminCommission.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-purple-600">
                      GH₵{data.hostelRevenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-bold">Filter Transactions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={filters.semester}
            onChange={(e) => handleFilterChange('semester', e.target.value)}
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Semesters</option>
            <option value="First Semester">First Semester</option>
            <option value="Second Semester">Second Semester</option>
          </select>

          <select
            value={filters.hostelId}
            onChange={(e) => handleFilterChange('hostelId', e.target.value)}
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Hostels</option>
            {hostels.map(h => (
              <option key={h._id} value={h._id}>{h.name}</option>
            ))}
          </select>

          <select
            value={filters.managerId}
            onChange={(e) => handleFilterChange('managerId', e.target.value)}
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Managers</option>
            {managers.map(m => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            placeholder="Start Date"
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            placeholder="End Date"
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={applyFilters}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Clear
          </button>
          <button
            onClick={handleResetTransactions}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2 ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All Transactions
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hostel Fee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
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
                      {t.managerId?.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {t.roomType}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {t.semester}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-purple-600">
                      GH₵{t.hostelFee.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600">
                      GH₵{t.adminCommission.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-blue-600">
                      GH₵{t.totalAmount.toLocaleString()}
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

export default AdminTransactions;
