import React from 'react';

const tabs = ['overview', 'analytics', 'transactions', 'visitors', 'users', 'hostels', 'managers', 'register-manager', 'applications', 'logs', 'logs-history', 'trash'];

const AdminTabNavigation = ({ activeTab, onTabChange }) => (
  <div className="border-b overflow-x-auto">
    <div className="flex space-x-2 sm:space-x-4 px-2 sm:px-4 min-w-max">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`py-2 sm:py-3 px-2 sm:px-4 font-medium capitalize text-xs sm:text-base whitespace-nowrap ${
            activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
          }`}
        >
          {tab === 'register-manager' ? 'Register Manager' : tab === 'logs-history' ? 'Logs History' : tab}
        </button>
      ))}
    </div>
  </div>
);

export default AdminTabNavigation;
