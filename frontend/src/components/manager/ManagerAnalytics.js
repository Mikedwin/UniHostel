import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  TrendingUp,
  Users,
  Home,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  Building2,
  Sparkles,
} from "lucide-react";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { FilterSelect, FilterButton } from "../DashboardFilters";
import { showError } from "../../utils/alerts";

const STATUS_COLORS = {
  Pending: "#e2b667",
  "Approved for Payment": "#23817a",
  "Paid Awaiting": "#c96e32",
  Approved: "#173b35",
  Rejected: "#e11d48",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#173b35] p-3.5 text-white shadow-2xl backdrop-blur-md">
        {label && <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#f6deb1]">{label}</p>}
        <div className="space-y-1 text-xs">
          {payload.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color || item.fill || item.payload?.fill }}
              />
              <span className="font-medium text-white/80">{item.name}:</span>
              <span className="font-bold text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const ManagerAnalytics = ({ applications = [], hostels = [] }) => {
  const [dateRange, setDateRange] = useState("30");
  const [exportLoading, setExportLoading] = useState(false);

  const filteredData = useMemo(() => {
    const days = parseInt(dateRange, 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Filter out archived applications for analytics
    const activeApps = applications.filter((app) => !app.isArchived);

    return {
      applications: activeApps.filter(
        (app) => new Date(app.createdAt) >= cutoffDate,
      ),
      allApplications: activeApps,
    };
  }, [applications, dateRange]);

  const statusDistribution = useMemo(() => {
    const pending = filteredData.allApplications.filter(
      (a) => a.status === "pending",
    ).length;
    const approvedForPayment = filteredData.allApplications.filter(
      (a) => a.status === "approved_for_payment",
    ).length;
    const paidAwaiting = filteredData.allApplications.filter(
      (a) => a.status === "paid_awaiting_final",
    ).length;
    const approved = filteredData.allApplications.filter(
      (a) => a.status === "approved",
    ).length;
    const rejected = filteredData.allApplications.filter(
      (a) => a.status === "rejected",
    ).length;

    return [
      { name: "Pending", value: pending, color: STATUS_COLORS.Pending },
      {
        name: "Approved for Payment",
        value: approvedForPayment,
        color: STATUS_COLORS["Approved for Payment"],
      },
      {
        name: "Paid Awaiting",
        value: paidAwaiting,
        color: STATUS_COLORS["Paid Awaiting"],
      },
      { name: "Approved", value: approved, color: STATUS_COLORS.Approved },
      { name: "Rejected", value: rejected, color: STATUS_COLORS.Rejected },
    ].filter((item) => item.value > 0);
  }, [filteredData]);

  const hostelPerformance = useMemo(() => {
    return hostels
      .map((hostel) => {
        const hostelApps = filteredData.allApplications.filter(
          (app) => app.hostelId?._id === hostel._id,
        );
        const totalCapacity =
          hostel.roomTypes?.reduce((sum, r) => sum + r.totalCapacity, 0) || 0;
        const totalOccupied =
          hostel.roomTypes?.reduce(
            (sum, r) => sum + (r.occupiedCapacity || 0),
            0,
          ) || 0;
        const occupancyRate =
          totalCapacity > 0
            ? ((totalOccupied / totalCapacity) * 100).toFixed(1)
            : 0;

        return {
          name:
            hostel.name.length > 16
              ? hostel.name.substring(0, 16) + "..."
              : hostel.name,
          fullName: hostel.name,
          applications: hostelApps.length,
          occupancy: parseFloat(occupancyRate),
          capacity: totalCapacity,
          occupied: totalOccupied,
        };
      })
      .sort((a, b) => b.applications - a.applications);
  }, [hostels, filteredData]);

  const roomTypeDistribution = useMemo(() => {
    const roomTypes = {};
    hostels.forEach((hostel) => {
      hostel.roomTypes?.forEach((room) => {
        if (!roomTypes[room.type]) {
          roomTypes[room.type] = { total: 0, occupied: 0 };
        }
        roomTypes[room.type].total += room.totalCapacity;
        roomTypes[room.type].occupied += room.occupiedCapacity || 0;
      });
    });

    return Object.entries(roomTypes).map(([type, data]) => ({
      type,
      total: data.total,
      occupied: data.occupied,
      available: Math.max(0, data.total - data.occupied),
    }));
  }, [hostels]);

  const exportToExcel = () => {
    setExportLoading(true);

    try {
      const summaryData = [
        ["Manager Analytics Report"],
        ["Generated:", new Date().toLocaleString()],
        ["Date Range:", `Last ${dateRange} days`],
        [""],
        ["Key Metrics"],
        ["Total Hostels", hostels.length],
        ["Total Applications", filteredData.allApplications.length],
        [
          "Pending",
          filteredData.allApplications.filter((a) => a.status === "pending")
            .length,
        ],
        [
          "Approved",
          filteredData.allApplications.filter((a) => a.status === "approved")
            .length,
        ],
        [
          "Rejected",
          filteredData.allApplications.filter((a) => a.status === "rejected")
            .length,
        ],
      ];

      const appsData = [
        ["Date", "Student", "Email", "Hostel", "Room", "Semester", "Status"],
        ...filteredData.allApplications.map((app) => [
          new Date(app.createdAt).toLocaleDateString(),
          app.studentName,
          app.studentId?.email || "",
          app.hostelId?.name || "",
          app.roomType,
          app.semester,
          app.status,
        ]),
      ];

      const allData = [...summaryData, [""], ["Applications"], ...appsData];
      const csv = Papa.unparse(allData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `Analytics_${new Date().toISOString().split("T")[0]}.csv`);
    } catch (error) {
      console.error("Export error:", error);
      showError("Export Failed", "Failed to export analytics data.");
    } finally {
      setExportLoading(false);
    }
  };

  const totalCapacitySum = hostels.reduce(
    (sum, h) =>
      sum + (h.roomTypes?.reduce((s, r) => s + r.totalCapacity, 0) || 0),
    0,
  );
  const totalOccupiedSum = hostels.reduce(
    (sum, h) =>
      sum + (h.roomTypes?.reduce((s, r) => s + (r.occupiedCapacity || 0), 0) || 0),
    0,
  );
  const averageOccupancy =
    totalCapacitySum > 0
      ? Math.round((totalOccupiedSum / totalCapacitySum) * 100)
      : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Filter Bar */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between rounded-[2rem] border border-[#173b35]/10 bg-white p-6 sm:p-8 shadow-[0_1rem_2.5rem_rgba(23,59,53,0.06)]">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-[#c96e32]">
            <Sparkles className="w-3.5 h-3.5" /> Performance & Analytics
          </span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-[-0.03em] text-[#173b35]">
            Business Overview
          </h2>
          <p className="mt-1 text-sm font-medium text-[#64746e]">
            Real-time insights across student demand, occupancy rates, and room inventory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: "7", label: "Last 7 days" },
              { value: "30", label: "Last 30 days" },
              { value: "60", label: "Last 60 days" },
              { value: "90", label: "Last 90 days" },
            ]}
            className="min-w-[150px]"
          />
          <FilterButton
            variant="primary"
            onClick={exportToExcel}
            disabled={exportLoading}
          >
            <Download className="w-4 h-4" />
            {exportLoading ? "Exporting..." : "Export CSV"}
          </FilterButton>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="group relative overflow-hidden rounded-[2rem] border border-[#173b35]/10 bg-white p-6 shadow-[0_1rem_2.5rem_rgba(23,59,53,0.05)] transition-all hover:shadow-[0_1.5rem_3rem_rgba(23,59,53,0.09)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#c96e32]">
              Applications
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f6deb1]/40 text-[#173b35]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#173b35]">
              {filteredData.allApplications.length}
            </span>
            <p className="mt-1 text-xs font-medium text-[#64746e]">
              <span className="font-bold text-[#173b35]">{filteredData.applications.length}</span> in last {dateRange} days
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="group relative overflow-hidden rounded-[2rem] border border-[#173b35]/10 bg-white p-6 shadow-[0_1rem_2.5rem_rgba(23,59,53,0.05)] transition-all hover:shadow-[0_1.5rem_3rem_rgba(23,59,53,0.09)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#23817a]">
              Accepted
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e7efe8] text-[#23817a]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#173b35]">
              {filteredData.allApplications.filter((a) => a.status === "approved").length}
            </span>
            <p className="mt-1 text-xs font-medium text-[#64746e]">
              Approved student bookings
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="group relative overflow-hidden rounded-[2rem] border border-[#173b35]/10 bg-white p-6 shadow-[0_1rem_2.5rem_rgba(23,59,53,0.05)] transition-all hover:shadow-[0_1.5rem_3rem_rgba(23,59,53,0.09)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#173b35]">
              Properties
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f3fbf9] text-[#173b35]">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#173b35]">
              {hostels.length}
            </span>
            <p className="mt-1 text-xs font-medium text-[#64746e]">
              Active managed hostels
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="group relative overflow-hidden rounded-[2rem] border border-[#173b35]/10 bg-white p-6 shadow-[0_1rem_2.5rem_rgba(23,59,53,0.05)] transition-all hover:shadow-[0_1.5rem_3rem_rgba(23,59,53,0.09)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#c96e32]">
              Occupancy
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f8e9e5] text-[#c96e32]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#173b35]">
              {averageOccupancy}%
            </span>
            <p className="mt-1 text-xs font-medium text-[#64746e]">
              {totalOccupiedSum} of {totalCapacitySum} beds filled
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Status Distribution (Donut) */}
        <div className="lg:col-span-5 rounded-[2rem] border border-[#173b35]/10 bg-white p-6 sm:p-8 shadow-[0_1rem_2.5rem_rgba(23,59,53,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f6deb1]/50 text-[#173b35]">
                <PieIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-extrabold uppercase tracking-[0.15em] text-[#c96e32]">
                  Breakdown
                </span>
                <h3 className="text-xl font-black tracking-tight text-[#173b35]">
                  Application Status
                </h3>
              </div>
            </div>
            <p className="mt-2 text-xs font-medium text-[#64746e]">
              Current status distribution of student accommodation requests
            </p>
          </div>

          <div className="my-6 relative flex items-center justify-center min-h-[260px]">
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-[#64746e] py-12">
                No application data available
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5 border-t border-[#edf0eb] pt-4">
            {statusDistribution.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl bg-[#fbfaf6] px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-[#173b35] truncate">{item.name}</span>
                </div>
                <span className="font-black text-[#173b35] ml-2">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Room Availability */}
        <div className="lg:col-span-7 rounded-[2rem] border border-[#173b35]/10 bg-white p-6 sm:p-8 shadow-[0_1rem_2.5rem_rgba(23,59,53,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e7efe8] text-[#173b35]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-extrabold uppercase tracking-[0.15em] text-[#23817a]">
                  Inventory
                </span>
                <h3 className="text-xl font-black tracking-tight text-[#173b35]">
                  Room Availability
                </h3>
              </div>
            </div>
            <p className="mt-2 text-xs font-medium text-[#64746e]">
              Occupied capacity vs. available vacant spots across all room types
            </p>
          </div>

          <div className="my-6 min-h-[260px]">
            {roomTypeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={roomTypeDistribution} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#edf0eb" vertical={false} />
                  <XAxis
                    dataKey="type"
                    tick={{ fill: "#64746e", fontSize: 12, fontWeight: 600 }}
                    axisLine={{ stroke: "#d8e2da" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64746e", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: "12px", fontSize: "12px", fontWeight: 600 }}
                  />
                  <Bar
                    dataKey="occupied"
                    fill="#173b35"
                    name="Occupied"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="available"
                    fill="#e2b667"
                    name="Available"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-[#64746e] py-12">
                No room inventory registered
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[#edf0eb] pt-4 text-xs font-semibold text-[#64746e]">
            <span>Total Capacity: {totalCapacitySum} beds</span>
            <span>Total Occupied: {totalOccupiedSum} beds</span>
          </div>
        </div>
      </div>

      {/* Hostel Performance Comparison */}
      <div className="rounded-[2rem] border border-[#173b35]/10 bg-white p-6 sm:p-8 shadow-[0_1rem_2.5rem_rgba(23,59,53,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f6deb1]/50 text-[#173b35]">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-extrabold uppercase tracking-[0.15em] text-[#c96e32]">
                Portfolio Comparison
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#173b35]">
                Hostel Performance
              </h3>
            </div>
          </div>
          <div className="text-xs font-semibold text-[#64746e]">
            Comparing student application volume & occupancy rate per hostel
          </div>
        </div>

        <div className="min-h-[300px]">
          {hostelPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hostelPerformance} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf0eb" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#64746e", fontSize: 12, fontWeight: 600 }}
                  axisLine={{ stroke: "#d8e2da" }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tick={{ fill: "#173b35", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#c96e32", fontSize: 12 }}
                  unit="%"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: "16px", fontSize: "12px", fontWeight: 600 }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="applications"
                  fill="#173b35"
                  name="Applications"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="occupancy"
                  fill="#c96e32"
                  name="Occupancy %"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-xs text-[#64746e] py-16">
              No hostel performance data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerAnalytics;
