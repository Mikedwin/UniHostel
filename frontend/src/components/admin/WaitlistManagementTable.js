import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Users, Download, Search, Trash2, RefreshCw, MessageSquare, Mail, Calendar, Phone } from 'lucide-react';
import API_ENDPOINTS from '../../config/api';

const WaitlistManagementTable = ({ token }) => {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalAll, setTotalAll] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWaitlist = useCallback(async (currentPage = 1, searchQuery = '') => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_ENDPOINTS.WAITLIST}?page=${currentPage}&limit=20&search=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(res.data.entries || []);
      setTotal(res.data.total || 0);
      setTotalAll(res.data.totalAll || 0);
      setPage(res.data.page || 1);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching waitlist:', err);
      setError(err.response?.data?.message || 'Failed to load waitlist');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchWaitlist(page, search);
    }
  }, [token, page, fetchWaitlist]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchWaitlist(1, search);
  };

  const handleExportCSV = async () => {
    try {
      setExportLoading(true);
      const res = await axios.get(API_ENDPOINTS.WAITLIST_EXPORT, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `unihostel-waitlist-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting waitlist CSV:', err);
      alert('Failed to export waitlist CSV');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the waitlist?`)) {
      return;
    }

    try {
      await axios.delete(API_ENDPOINTS.WAITLIST_DELETE(id), {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWaitlist(page, search);
    } catch (err) {
      console.error('Error deleting waitlist entry:', err);
      alert(err.response?.data?.message || 'Failed to delete waitlist entry');
    }
  };

  const formatGhanaPhoneForWhatsApp = (phoneStr) => {
    if (!phoneStr) return '';
    let cleaned = phoneStr.replace(/\D/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '233' + cleaned.slice(1);
    }
    return cleaned;
  };

  return (
    <div className="space-y-6">
      {/* Header card with summary & export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#173B35] text-[#F6DEB1]">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Early Access Leads</span>
            <h2 className="text-2xl font-black text-[#173B35]">Student Waitlist</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Total Signups: <strong className="text-[#C96E32] font-bold">{totalAll} students</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchWaitlist(page, search)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={exportLoading || totalAll === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-[#173B35] hover:bg-[#1f4a43] px-5 py-2.5 text-sm font-bold text-[#F6DEB1] shadow-md transition disabled:opacity-50"
          >
            <Download className="h-4 w-4 text-[#C96E32]" />
            {exportLoading ? 'Exporting...' : 'Export to CSV'}
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:border-[#173B35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173B35]/20 transition"
          />
        </form>
        <span className="text-xs font-semibold text-gray-500">
          Showing {entries.length} of {total} results
        </span>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Waitlist Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-[#173B35] text-[#F6DEB1] text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Phone / WhatsApp</th>
                <th className="py-3.5 px-4">Date Joined</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#173B35] border-t-transparent" />
                      <span>Loading waitlist leads...</span>
                    </div>
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    <Users className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-600">No waitlist signups found</p>
                    <p className="text-xs text-gray-400 mt-1">Students who join early access will appear here.</p>
                  </td>
                </tr>
              ) : (
                entries.map((entry, index) => {
                  const whatsappPhone = formatGhanaPhoneForWhatsApp(entry.phone);
                  const queueNum = (page - 1) * 20 + index + 1;
                  return (
                    <tr key={entry._id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3.5 px-4 text-center font-bold text-gray-400 text-xs">
                        #{queueNum}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#173B35]">
                        {entry.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <a
                          href={`mailto:${entry.email}`}
                          className="inline-flex items-center gap-1.5 text-gray-700 hover:text-[#C96E32] transition"
                        >
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          <span>{entry.email}</span>
                        </a>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{entry.phone}</span>
                          {whatsappPhone && (
                            <a
                              href={`https://wa.me/${whatsappPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chat on WhatsApp"
                              className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(entry._id, entry.name)}
                          title="Delete Lead"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-gray-50/50">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs font-semibold text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitlistManagementTable;
