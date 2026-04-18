import React from 'react';

const tabs = ['overview', 'analytics', 'transactions', 'visitors', 'users', 'hostels', 'managers', 'register-manager', 'applications', 'logs', 'logs-history', 'trash'];

const AdminTabNavigation = ({ activeTab, onTabChange }) => (
  <div className="border-b border-slate-200/80 overflow-x-auto">
    <div className="flex gap-2 px-2 py-3 sm:px-4 min-w-max">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`py-2 px-3 sm:px-4 font-medium capitalize text-xs sm:text-sm whitespace-nowrap rounded-full transition ${
            activeTab === tab ? 'bg-primary-600 text-white shadow-md shadow-primary-700/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {tab === 'register-manager' ? 'Register Manager' : tab === 'logs-history' ? 'Logs History' : tab}
        </button>
      ))}
    </div>
  </div>
);

export default AdminTabNavigation;
