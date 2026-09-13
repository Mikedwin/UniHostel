import React from "react";
import { BedDouble, Building2, CheckCircle, Users } from "lucide-react";
const ManagerStatsGrid = ({ stats = {} }) => {
  const items = [
    ["Listed homes", stats.totalHostels ?? 0, Building2],
    ["Rooms occupied", stats.totalOccupied ?? 0, BedDouble],
    ["Requests received", stats.totalApplications ?? 0, Users],
    ["Ready for payment", stats.approvedForPayment ?? 0, CheckCircle],
  ];
  return (
    <section className="workspace-stat-grid">
      {items.map(([label, value, Icon], i) => (
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
export default ManagerStatsGrid;
