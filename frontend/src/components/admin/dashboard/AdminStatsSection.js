import React from 'react';
import { Activity, Building2, FileText, Users } from 'lucide-react';

const AdminStatsSection = ({ stats }) => (
  <>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Total Hostels</p>
            <p className="text-xl sm:text-2xl font-bold">{stats?.overview.totalHostels}</p>
            <p className="text-xs text-green-600">{stats?.overview.activeHostels} active</p>
          </div>
          <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
        </div>
      </div>
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Managers</p>
            <p className="text-xl sm:text-2xl font-bold">{stats?.overview.totalManagers}</p>
          </div>
          <Users className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" />
        </div>
      </div>
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Applications</p>
            <p className="text-xl sm:text-2xl font-bold">{stats?.overview.totalApplications}</p>
            <p className="text-xs text-yellow-600">{stats?.overview.pendingApplications} pending</p>
          </div>
          <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
        </div>
      </div>
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Students</p>
            <p className="text-xl sm:text-2xl font-bold">{stats?.overview.totalStudents}</p>
          </div>
          <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
        </div>
      </div>
    </div>

    <div className="bg-white p-3 sm:p-4 rounded-lg shadow mb-6">
      <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Room Statistics</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats?.roomStats && Object.entries(stats.roomStats).map(([type, data]) => (
          <div key={type} className="border rounded p-2 sm:p-3">
            <p className="font-semibold text-xs sm:text-sm">{type}</p>
            <p className="text-xs text-gray-600">Total: {data.total}</p>
            <p className="text-xs text-gray-600">Occupied: {data.occupied}</p>
            <p className="text-xs text-green-600">Available: {data.available}</p>
          </div>
        ))}
      </div>
    </div>
  </>
);

export default AdminStatsSection;
