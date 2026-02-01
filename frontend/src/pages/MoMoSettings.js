import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';

const MoMoSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [hasSetup, setHasSetup] = useState(false);
  
  const [formData, setFormData] = useState({
    momoProvider: '',
    momoNumber: '',
    momoAccountName: ''
  });

  useEffect(() => {
    fetchMoMoDetails();
  }, []);

  const fetchMoMoDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/api/payout/momo-details`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.hasSubaccount) {
        setFormData({
          momoProvider: response.data.momoProvider || '',
          momoNumber: response.data.momoNumber || '',
          momoAccountName: response.data.momoAccountName || ''
        });
        setHasSetup(true);
      }
    } catch (err) {
      console.error('Error fetching MoMo details:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      const endpoint = hasSetup ? '/api/payout/update-momo' : '/api/payout/setup-momo';
      
      const response = await axios({
        method: hasSetup ? 'put' : 'post',
        url: `${API_URL}${endpoint}`,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessage(response.data.message);
      setHasSetup(true);
      setTimeout(() => navigate('/manager-dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to setup Mobile Money');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {hasSetup ? 'Update' : 'Setup'} Mobile Money Payouts
            </h1>
            <p className="text-gray-600">
              Receive automatic payouts directly to your Mobile Money account when students pay
            </p>
          </div>

          {/* Info Banner */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-teal-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-teal-800 mb-1">How it works</h3>
                <ul className="text-sm text-teal-700 space-y-1">
                  <li>• Student pays total amount (hostel fee + 3% commission)</li>
                  <li>• Your share goes directly to your Mobile Money</li>
                  <li>• Admin commission (3%) stays in platform account</li>
                  <li>• Instant automatic payouts - no manual transfers!</li>
                </ul>
              </div>
            </div>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mobile Money Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Money Provider *
              </label>
              <select
                name="momoProvider"
                value={formData.momoProvider}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select Provider</option>
                <option value="MTN">MTN Mobile Money</option>
                <option value="Vodafone">Vodafone Cash</option>
                <option value="AirtelTigo">AirtelTigo Money</option>
              </select>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Money Number *
              </label>
              <input
                type="tel"
                name="momoNumber"
                value={formData.momoNumber}
                onChange={handleChange}
                placeholder="0241234567"
                required
                pattern="0[0-9]{9}"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">10 digits starting with 0</p>
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name *
              </label>
              <input
                type="text"
                name="momoAccountName"
                value={formData.momoAccountName}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Name registered on the Mobile Money account</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/manager-dashboard')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : hasSetup ? 'Update Details' : 'Setup Payouts'}
              </button>
            </div>
          </form>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              🔒 Your Mobile Money details are securely stored and encrypted. We use Paystack's secure infrastructure for all payouts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoMoSettings;
