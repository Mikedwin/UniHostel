import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Trash2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import API_URL from '../config';

const GDPRSettings = () => {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleExportData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/gdpr/export-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const dataStr = JSON.stringify(res.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `unihostel-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/gdpr/delete-account`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy & Data Settings</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start">
            <Download className="w-6 h-6 text-blue-600 mr-4 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Export Your Data</h2>
              <p className="text-gray-600 mb-4">
                Download a copy of all your personal data stored on UniHostel in JSON format.
              </p>
              <button
                onClick={handleExportData}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Exporting...' : 'Export Data'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
          <div className="flex items-start">
            <Trash2 className="w-6 h-6 text-red-600 mr-4 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Account</h2>
              <p className="text-gray-600 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Delete Account
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-start mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                    <p className="text-sm text-red-800 font-semibold">
                      Are you absolutely sure? This action is permanent and cannot be reversed.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDPRSettings;
