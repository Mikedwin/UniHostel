import React from "react";
import {
  Activity,
  BarChart3,
  Building2,
  ClipboardCheck,
  UserPlus,
  Users,
  Sparkles,
} from "lucide-react";
const items = [
  ["overview", "Overview", Activity],
  ["waitlist", "Waitlist", Sparkles],
  ["users", "People", Users],
  ["hostels", "Listings", Building2],
  ["applications", "Applications", ClipboardCheck],
  ["analytics", "Signals", BarChart3],
  ["managers", "Managers", UserPlus],
];
const AdminTabNavigation = ({ activeTab, onTabChange }) => (
  <nav
    className="workspace-tabs admin-tabs"
    aria-label="Admin dashboard sections"
  >
    {items.map(([id, label, Icon]) => (
      <button
        key={id}
        onClick={() => onTabChange(id)}
        className={activeTab === id ? "is-active" : ""}
      >
        <Icon />
        {label}
      </button>
    ))}
  </nav>
);
export default AdminTabNavigation;
