import React from "react";
import { Building2, FileCheck2, ShieldCheck, Users } from "lucide-react";
const AdminStatsSection = ({ stats = {} }) => {
  const cards = [
    ["People", stats.totalUsers ?? stats.users ?? 0, Users],
    ["Listed homes", stats.totalHostels ?? stats.hostels ?? 0, Building2],
    [
      "Applications",
      stats.totalApplications ?? stats.applications ?? 0,
      FileCheck2,
    ],
    [
      "Pending review",
      stats.pendingVerification ?? stats.pending ?? 0,
      ShieldCheck,
    ],
  ];
  return (
    <section className="workspace-stat-grid admin-stat-grid">
      {cards.map(([label, value, Icon], i) => (
        <div className="workspace-stat" key={label}>
          <span>0{i + 1}</span>
          <Icon />
          <strong>{value}</strong>
          <p>{label}</p>
        </div>
      ))}
    </section>
  );
};
export default AdminStatsSection;
