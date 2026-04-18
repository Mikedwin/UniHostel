import React from 'react';
import { BarChart3, DollarSign, KeyRound, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'transactions', label: 'Transactions', icon: DollarSign }
];

const ManagerDashboardHeader = ({ activeTab, onTabChange }) => (
  <div className="mb-8 rounded-[2rem] border border-emerald-100/70 bg-[linear-gradient(135deg,#ffffff_0%,#f3fbf9_100%)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary-600">Manager dashboard</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Run your hostel operations with clarity.</h1>
      <p className="mt-2 text-sm text-slate-600">Review applications, track occupancy, and stay on top of approvals from one cleaner control space.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-700/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              } ${Icon ? 'flex items-center gap-2' : ''}`}
            >
              {Icon ? <Icon className="w-4 h-4" /> : null}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
      <Link
        to="/change-password"
        className="w-full sm:w-auto bg-slate-950 text-white px-4 py-3 rounded-2xl hover:bg-slate-800 flex items-center justify-center"
      >
        <KeyRound className="w-4 h-4 mr-2" />
        Change Password
      </Link>
      <Link
        to="/add-hostel"
        className="w-full sm:w-auto bg-primary-600 text-white px-4 py-3 rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-700/20 flex items-center justify-center"
      >
        <Plus className="w-4 h-4 mr-2" />
        List New Hostel
      </Link>
    </div>
  </div>
  </div>
);

export default ManagerDashboardHeader;
