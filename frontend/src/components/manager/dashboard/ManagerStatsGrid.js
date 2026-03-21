import React from 'react';
import { Clock, Home, TrendingUp, Users } from 'lucide-react';

const ManagerStatsGrid = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg shadow-md p-5 border border-purple-100 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Total Hostels</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalHostels}</p>
        </div>
        <div className="bg-purple-100 p-3 rounded-full">
          <Home className="w-6 h-6 text-purple-600" />
        </div>
      </div>
      <div className="flex items-center text-xs text-gray-600">
        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
          {stats.activeHostels} Active
        </span>
        {stats.inactiveHostels > 0 && (
          <span className="ml-2 text-gray-500">{stats.inactiveHostels} Inactive</span>
        )}
      </div>
    </div>

    <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-md p-5 border border-blue-100 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Applications</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalApps}</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-full">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">{stats.pending} Pending</span>
        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{stats.approved} Approved</span>
        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">{stats.rejected} Rejected</span>
      </div>
    </div>

    <div className="bg-gradient-to-br from-green-50 to-white rounded-lg shadow-md p-5 border border-green-100 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Occupancy Rate</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.occupancyRate}%</p>
        </div>
        <div className="bg-green-100 p-3 rounded-full">
          <TrendingUp className="w-6 h-6 text-green-600" />
        </div>
      </div>
      <div className="space-y-1">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              stats.occupancyRate >= 90
                ? 'bg-red-500'
                : stats.occupancyRate >= 70
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            }`}
            style={{ width: `${stats.occupancyRate}%` }}
          />
        </div>
        <p className="text-xs text-gray-600">{stats.totalOccupied} / {stats.totalCapacity} slots filled</p>
      </div>
    </div>

    <div className="bg-gradient-to-br from-yellow-50 to-white rounded-lg shadow-md p-5 border border-yellow-100 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Pending Actions</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-yellow-100 p-3 rounded-full">
          <Clock className="w-6 h-6 text-yellow-600" />
        </div>
      </div>
      <p className="text-xs text-gray-600">
        {stats.pending === 0
          ? 'All caught up!'
          : `${stats.pending} application${stats.pending > 1 ? 's' : ''} awaiting review`}
      </p>
    </div>
  </div>
);

export default ManagerStatsGrid;
