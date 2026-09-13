import React from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  WalletCards,
} from "lucide-react";

const tabs = [
  ["dashboard", "Overview", LayoutDashboard],
  ["analytics", "Performance", BarChart3],
  ["transactions", "Payouts", WalletCards],
];

const ManagerDashboardHeader = ({ activeTab, onTabChange }) => (
  <header className="workspace-header manager-workspace-header">
    <div className="workspace-heading">
      <p>Manager workspace</p>
      <h1>Keep every room, request and payout in view.</h1>
      <span>A calm control room for the work behind a good student stay.</span>
    </div>
    <div className="workspace-header-actions">
      <Link to="/add-hostel" className="workspace-primary">
        <Building2 /> Add a hostel
      </Link>
    </div>
    <nav className="workspace-tabs" aria-label="Manager dashboard sections">
      {tabs.map(([id, label, Icon]) => (
        <button
          key={id}
          className={activeTab === id ? "is-active" : ""}
          onClick={() => onTabChange(id)}
        >
          <Icon />
          {label}
        </button>
      ))}
    </nav>
  </header>
);
export default ManagerDashboardHeader;
