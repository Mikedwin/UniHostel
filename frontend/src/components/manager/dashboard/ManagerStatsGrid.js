import React from 'react';
import { Clock, Home, TrendingUp, Users } from 'lucide-react';

const ManagerStatsGrid = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <div className="rounded-[1.75rem] border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfb_100%)] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_22px_50px_rgba(15,23,42,0.10)]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Total Hostels</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalHostels}</p>
        </div>
        <div className="rounded-2xl bg-primary-50 p-3">
          <Home className="w-6 h-6 text-primary-600" />
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

    <div className="rounded-[1.75rem] border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfb_100%)] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_22px_50px_rgba(15,23,42,0.10)]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Applications</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalApps}</p>
        </div>
        <div className="rounded-2xl bg-primary-50 p-3">
          <Users className="w-6 h-6 text-primary-600" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">{stats.pending} Pending</span>
        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{stats.approved} Approved</span>
        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">{stats.rejected} Rejected</span>
      </div>
    </div>

    <div className="rounded-[1.75rem] border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfb_100%)] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_22px_50px_rgba(15,23,42,0.10)]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Occupancy Rate</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.occupancyRate}%</p>
        </div>
        <div className="rounded-2xl bg-primary-50 p-3">
          <TrendingUp className="w-6 h-6 text-primary-600" />
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

    <div className="rounded-[1.75rem] border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfb_100%)] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_22px_50px_rgba(15,23,42,0.10)]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Pending Actions</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
        </div>
        <div className="rounded-2xl bg-primary-50 p-3">
          <Clock className="w-6 h-6 text-primary-600" />
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
