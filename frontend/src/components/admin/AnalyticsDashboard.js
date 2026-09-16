import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../../config";
import {
  LineChart,
  Line,
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
  FileText,
  Building2,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Sparkles,
} from "lucide-react";
import { FilterSelect, FilterDateInput, FilterButton } from "../DashboardFilters";

const BRAND_COLORS = [
  "#173b35",
  "#23817a",
  "#c96e32",
  "#e2b667",
  "#8b5cf6",
  "#e11d48",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#173b35] p-3.5 text-white shadow-2xl backdrop-blur-md">
        {label && (
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#f6deb1]">
            {label}
          </p>
        )}
        <div className="space-y-1 text-xs">
          {payload.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor:
                    item.color || item.fill || item.payload?.fill,
                }}
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

const AnalyticsDashboard = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [overview, setOverview] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [locations, setLocations] = useState([]);
  const [peakSeasons, setPeakSeasons] = useState([]);
  const [activeMetrics, setActiveMetrics] = useState({
    students: true,
    managers: true,
    hostels: true,
    applications: true,
  });

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, startDate, endDate]);

  const getDateRange = () => {
    const end = new Date();
    let start = new Date();

    switch (dateRange) {
      case "today":
        start = new Date();
        break;
      case "7days":
        start.setDate(end.getDate() - 7);
        break;
      case "30days":
        start.setDate(end.getDate() - 30);
        break;
      case "thisMonth":
        start = new Date(end.getFullYear(), end.getMonth(), 1);
        break;
      case "thisYear":
        start = new Date(end.getFullYear(), 0, 1);
        break;
      case "custom":
        return { start: startDate, end: endDate };
      default:
        start.setDate(end.getDate() - 30);
    }

    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const dates = getDateRange();
      const params =
        dateRange === "custom" && startDate && endDate
          ? `?startDate=${dates.start}&endDate=${dates.end}`
          : `?startDate=${dates.start}&endDate=${dates.end}`;

      const [overviewRes, growthRes, locationsRes, peakRes] = await Promise.all(
        [
          axios.get(`${API_URL}/api/admin/analytics/overview${params}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/admin/analytics/growth${params}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/admin/analytics/locations${params}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/admin/analytics/peak-seasons`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ],
      );

      setOverview(overviewRes.data);
      setGrowth(growthRes.data);
      setLocations(locationsRes.data);
      setPeakSeasons(peakRes.data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const dates = getDateRange();
      await axios.post(
        `${API_URL}/api/admin/analytics/export`,
        {
          reportType: "full_analytics",
          startDate: dates.start,
          endDate: dates.end,
          format,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert(
        `Export logged successfully. ${format.toUpperCase()} export will be generated.`,
      );
    } catch (err) {
      alert("Export failed");
    }
  };

  const prepareGrowthData = () => {
    if (!growth) return [];

    const allDates = new Set();
    growth.studentGrowth?.forEach((d) => allDates.add(d._id));
    growth.managerGrowth?.forEach((d) => allDates.add(d._id));
    growth.hostelGrowth?.forEach((d) => allDates.add(d._id));
    growth.applicationGrowth?.forEach((d) => allDates.add(d._id));

    return Array.from(allDates)
      .sort()
      .map((date) => ({
        date,
        students: growth.studentGrowth?.find((d) => d._id === date)?.count || 0,
        managers: growth.managerGrowth?.find((d) => d._id === date)?.count || 0,
        hostels: growth.hostelGrowth?.find((d) => d._id === date)?.count || 0,
        applications:
          growth.applicationGrowth?.find((d) => d._id === date)?.count || 0,
      }));
  };

  const prepareConversionData = () => {
    if (!overview) return [];
    return [
      {
        name: "Approved",
        value: overview.approvedApps,
        percentage: overview.approvalRate,
        color: "#173b35",
      },
      {
        name: "Pending",
        value: Math.max(
          0,
          (overview.totalApplications || 0) -
            (overview.approvedApps || 0) -
            (overview.rejectedApps || 0),
        ),
        color: "#e2b667",
      },
      {
        name: "Rejected",
        value: overview.rejectedApps,
        percentage: overview.rejectionRate,
        color: "#e11d48",
      },
    ].filter((item) => item.value > 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="unihostel-inline-loader"></div>
      </div>
    );
  }

  const conversionData = prepareConversionData();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Date Range Filters */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between rounded-[2rem] border border-[#173b35]/10 bg-white p-6 sm:p-8 shadow-[0_1rem_2.5rem_rgba(23,59,53,0.06)]">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-[#c96e32]">
            <Sparkles className="w-3.5 h-3.5" /> Platform Intelligence
          </span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-[-0.03em] text-[#173b35]">
            Analytics & System Growth
          </h2>
          <p className="mt-1 text-sm font-medium text-[#64746e]">
            Comprehensive platform metrics, user adoption trends, and booking funnel rates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: "today", label: "Today" },
              { value: "7days", label: "Last 7 Days" },
              { value: "30days", label: "Last 30 Days" },
              { value: "thisMonth", label: "This Month" },
              { value: "thisYear", label: "This Year" },
              { value: "custom", label: "Custom Range" },
            ]}
            className="min-w-[150px]"
          />

          {dateRange === "custom" && (
            <>
              <FilterDateInput
                label="From"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || undefined}
                className="min-w-[130px]"
              />
              <FilterDateInput
                label="To"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className="min-w-[130px]"
              />
            </>
          )}

          <div className="flex gap-2">
            <FilterButton variant="primary" onClick={() => handleExport("excel")}>
              <Download className="h-4 w-4" />
              Export
            </FilterButton>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-[2rem] border border-[#173b35]/10 bg-white p-6 shadow-[0_1rem_2.5rem_rgba(23,59,53,0.05)] transition-all hover:shadow-[0_1.5rem_3rem_rgba(23,59,53,0.09)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#173b35]">
              Total Users
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e7efe8] text-[#173b35]">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#173b35]">
              {overview?.totalUsers || 0}
            </span>
            <p className="mt-1 text-xs font-medium text-[#64746e]">
              {overview?.totalStudents || 0} students · {overview?.totalManagers || 0} managers
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#173b35]/10 bg-white p-6 shadow-[0_1rem_2.5rem_rgba(23,59,53,0.05)] transition-all hover:shadow-[0_1.5rem_3rem_rgba(23,59,53,0.09)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#c96e32]">
              Applications
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f8e9e5] text-[#c96e32]">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#173b35]">
              {overview?.totalApplications || 0}
            </span>
            <p className="mt-1 text-xs font-medium text-[#64746e]">
              <span className="font-bold text-[#23817a]">{overview?.approvalRate || 0}%</span> approval rate
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#173b35]/10 bg-white p-6 shadow-[0_1rem_2.5rem_rgba(23,59,53,0.05)] transition-all hover:shadow-[0_1.5rem_3rem_rgba(23,59,53,0.09)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#23817a]">
              Approved
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f3fbf9] text-[#23817a]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#173b35]">
              {overview?.approvedApps || 0}
            </span>
            <p className="mt-1 text-xs font-medium text-[#64746e]">
              Confirmed student bookings
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#173b35]/10 bg-white p-6 shadow-[0_1rem_2.5rem_rgba(23,59,53,0.05)] transition-all hover:shadow-[0_1.5rem_3rem_rgba(23,59,53,0.09)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#e2b667]">
              Active Hostels
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f6deb1]/40 text-[#173b35]">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#173b35]">
              {overview?.activeHostels || 0}
            </span>
            <p className="mt-1 text-xs font-medium text-[#64746e]">
              of {overview?.totalHostels || 0} total properties
            </p>
          </div>
        </div>
      </div>

      {/* Growth Trends Line Chart */}
      <div className="rounded-[2rem] border border-[#173b35]/10 bg-white p-6 sm:p-8 shadow-[0_1rem_2.5rem_rgba(23,59,53,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <span className="block text-xs font-extrabold uppercase tracking-[0.15em] text-[#c96e32]">
              Timeline
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#173b35]">
              Growth Trends
            </h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {[
              { key: "students", label: "Students", color: "#173b35" },
              { key: "managers", label: "Managers", color: "#23817a" },
              { key: "hostels", label: "Hostels", color: "#e2b667" },
              { key: "applications", label: "Applications", color: "#c96e32" },
            ].map(({ key, label, color }) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setActiveMetrics({
                    ...activeMetrics,
                    [key]: !activeMetrics[key],
                  })
                }
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  activeMetrics[key]
                    ? "bg-[#173b35] text-white shadow-sm"
                    : "bg-[#f3fbf9] text-[#64746e] border border-[#173b35]/10 hover:bg-white"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[300px]">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prepareGrowthData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf0eb" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64746e", fontSize: 12 }}
                axisLine={{ stroke: "#d8e2da" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64746e", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px", fontWeight: 600 }} />
              {activeMetrics.students && (
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#173b35"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#173b35" }}
                  name="Students"
                />
              )}
              {activeMetrics.managers && (
                <Line
                  type="monotone"
                  dataKey="managers"
                  stroke="#23817a"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#23817a" }}
                  name="Managers"
                />
              )}
              {activeMetrics.hostels && (
                <Line
                  type="monotone"
                  dataKey="hostels"
                  stroke="#e2b667"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#e2b667" }}
                  name="Hostels"
                />
              )}
              {activeMetrics.applications && (
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#c96e32"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#c96e32" }}
                  name="Applications"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion & Locations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Conversion Donut */}
        <div className="lg:col-span-5 rounded-[2rem] border border-[#173b35]/10 bg-white p-6 sm:p-8 shadow-[0_1rem_2.5rem_rgba(23,59,53,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f6deb1]/50 text-[#173b35]">
                <PieIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-extrabold uppercase tracking-[0.15em] text-[#c96e32]">
                  Conversion
                </span>
                <h3 className="text-xl font-black tracking-tight text-[#173b35]">
                  Application Funnel
                </h3>
              </div>
            </div>
            <p className="mt-2 text-xs font-medium text-[#64746e]">
              Approval, pending, and rejection breakdown
            </p>
          </div>

          <div className="my-6 relative flex items-center justify-center min-h-[250px]">
            {conversionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={conversionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {conversionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || BRAND_COLORS[index % BRAND_COLORS.length]}
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
            {conversionData.map((item, idx) => (
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

        {/* Popular Locations */}
        <div className="lg:col-span-7 rounded-[2rem] border border-[#173b35]/10 bg-white p-6 sm:p-8 shadow-[0_1rem_2.5rem_rgba(23,59,53,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e7efe8] text-[#173b35]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-extrabold uppercase tracking-[0.15em] text-[#23817a]">
                  Geographic Demand
                </span>
                <h3 className="text-xl font-black tracking-tight text-[#173b35]">
                  Popular Locations
                </h3>
              </div>
            </div>
            <p className="mt-2 text-xs font-medium text-[#64746e]">
              Hostel density and student application volume by area
            </p>
          </div>

          <div className="my-6 min-h-[250px]">
            {locations.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={locations} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#edf0eb" vertical={false} />
                  <XAxis
                    dataKey="_id"
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
                  <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px", fontWeight: 600 }} />
                  <Bar
                    dataKey="hostelCount"
                    fill="#173b35"
                    name="Hostels"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="totalApplications"
                    fill="#c96e32"
                    name="Applications"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-[#64746e] py-12">
                No location data available
              </div>
            )}
          </div>

          <div className="border-t border-[#edf0eb] pt-4 text-xs font-semibold text-[#64746e]">
            Tracking top regions across Greater Accra and student clusters
          </div>
        </div>
      </div>

      {/* Peak Seasons Bar Chart */}
      <div className="rounded-[2rem] border border-[#173b35]/10 bg-white p-6 sm:p-8 shadow-[0_1rem_2.5rem_rgba(23,59,53,0.06)]">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f6deb1]/50 text-[#173b35]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-extrabold uppercase tracking-[0.15em] text-[#c96e32]">
              Seasonality
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#173b35]">
              Peak Application Periods
            </h3>
          </div>
        </div>

        <div className="min-h-[250px]">
          {peakSeasons.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={peakSeasons.map((d) => ({
                  month: `${d._id.year}-${String(d._id.month).padStart(2, "0")}`,
                  count: d.count,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#edf0eb" vertical={false} />
                <XAxis
                  dataKey="month"
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
                <Bar
                  dataKey="count"
                  fill="#23817a"
                  name="Monthly Applications"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-xs text-[#64746e] py-12">
              No seasonal application trends recorded
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
