import React from 'react';
import { BarChart3, DollarSign, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'transactions', label: 'Transactions', icon: DollarSign }
];

const ManagerDashboardHeader = ({ activeTab, onTabChange }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
    <div>
      <h1 className="text-2xl font-bold flex items-center gap-2">Manager Dashboard</h1>
      <div className="flex gap-2 mt-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${Icon ? 'flex items-center gap-2' : ''}`}
            >
              {Icon ? <Icon className="w-4 h-4" /> : null}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
    <Link
      to="/add-hostel"
      className="w-full sm:w-auto bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center justify-center"
    >
      <Plus className="w-4 h-4 mr-2" />
      List New Hostel
    </Link>
  </div>
);

export default ManagerDashboardHeader;
