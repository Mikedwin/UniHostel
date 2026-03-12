import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Download, TrendingUp, Users, FileText, Building2 } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const AnalyticsDashboard = ({ token }) => {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30days');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [overview, setOverview] = useState(null);
    const [growth, setGrowth] = useState(null);
    const [locations, setLocations] = useState([]);
    const [peakSeasons, setPeakSeasons] = useState([]);
    const [activeMetrics, setActiveMetrics] = useState({
        students: true,
        managers: true,
        hostels: true,
        applications: true
    });

    useEffect(() => {
        fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange, startDate, endDate]);

    const getDateRange = () => {
        const end = new Date();
        let start = new Date();
        
        switch(dateRange) {
            case 'today':
                start = new Date();
                break;
            case '7days':
                start.setDate(end.getDate() - 7);
                break;
            case '30days':
                start.setDate(end.getDate() - 30);
                break;
            case 'thisMonth':
                start = new Date(end.getFullYear(), end.getMonth(), 1);
                break;
            case 'thisYear':
                start = new Date(end.getFullYear(), 0, 1);
                break;
            case 'custom':
                return { start: startDate, end: endDate };
            default:
                start.setDate(end.getDate() - 30);
        }
        
        return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    };

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const dates = getDateRange();
            const params = dateRange === 'custom' && startDate && endDate ? `?startDate=${dates.start}&endDate=${dates.end}` : `?startDate=${dates.start}&endDate=${dates.end}`;

            const [overviewRes, growthRes, locationsRes, peakRes] = await Promise.all([
                axios.get(`${API_URL}/api/admin/analytics/overview${params}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/admin/analytics/growth${params}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/admin/analytics/locations${params}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/admin/analytics/peak-seasons`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setOverview(overviewRes.data);
            setGrowth(growthRes.data);
            setLocations(locationsRes.data);
            setPeakSeasons(peakRes.data);
        } catch (err) {
            console.error('Analytics fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format) => {
        try {
            const dates = getDateRange();
            await axios.post(`${API_URL}/api/admin/analytics/export`, {
                reportType: 'full_analytics',
                startDate: dates.start,
                endDate: dates.end,
                format
            }, { headers: { Authorization: `Bearer ${token}` } });
            alert(`Export logged successfully. ${format.toUpperCase()} export would be generated here.`);
        } catch (err) {
            alert('Export failed');
        }
    };

    const prepareGrowthData = () => {
        if (!growth) return [];
        
        const allDates = new Set();
        growth.studentGrowth?.forEach(d => allDates.add(d._id));
        growth.managerGrowth?.forEach(d => allDates.add(d._id));
        growth.hostelGrowth?.forEach(d => allDates.add(d._id));
        growth.applicationGrowth?.forEach(d => allDates.add(d._id));

        return Array.from(allDates).sort().map(date => ({
            date,
            students: growth.studentGrowth?.find(d => d._id === date)?.count || 0,
            managers: growth.managerGrowth?.find(d => d._id === date)?.count || 0,
            hostels: growth.hostelGrowth?.find(d => d._id === date)?.count || 0,
            applications: growth.applicationGrowth?.find(d => d._id === date)?.count || 0
        }));
    };

    const prepareConversionData = () => {
        if (!overview) return [];
        return [
            { name: 'Approved', value: overview.approvedApps, percentage: overview.approvalRate },
            { name: 'Rejected', value: overview.rejectedApps, percentage: overview.rejectionRate },
            { name: 'Pending', value: overview.totalApplications - overview.approvedApps - overview.rejectedApps }
        ];
    };

    if (loading) {
        return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="space-y-6">
            {/* Date Range Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex flex-wrap items-center gap-4">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-3 py-2 border rounded-lg">
                        <option value="today">Today</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="thisMonth">This Month</option>
                        <option value="thisYear">This Year</option>
                        <option value="custom">Custom Range</option>
                    </select>
                    
                    {dateRange === 'custom' && (
                        <>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 border rounded-lg" />
                            <span>to</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 border rounded-lg" />
                        </>
                    )}

                    <div className="ml-auto flex gap-2">
                        <button onClick={() => handleExport('pdf')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            PDF
                        </button>
                        <button onClick={() => handleExport('excel')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold">{overview?.totalUsers || 0}</p>
                            <p className="text-xs text-gray-500">{overview?.totalStudents} students, {overview?.totalManagers} managers</p>
                        </div>
                        <Users className="h-10 w-10 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Applications</p>
                            <p className="text-2xl font-bold">{overview?.totalApplications || 0}</p>
                            <p className="text-xs text-green-600">{overview?.approvalRate}% approved</p>
                        </div>
                        <FileText className="h-10 w-10 text-orange-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Approval Rate</p>
                            <p className="text-2xl font-bold">{overview?.approvalRate || 0}%</p>
                            <p className="text-xs text-gray-500">{overview?.approvedApps} approved</p>
                        </div>
                        <TrendingUp className="h-10 w-10 text-green-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Hostels</p>
                            <p className="text-2xl font-bold">{overview?.activeHostels || 0}</p>
                            <p className="text-xs text-gray-500">of {overview?.totalHostels} total</p>
                        </div>
                        <Building2 className="h-10 w-10 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Growth Trends */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Growth Trends</h3>
                    <div className="flex gap-4">
                        {Object.keys(activeMetrics).map(metric => (
                            <label key={metric} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={activeMetrics[metric]} onChange={() => setActiveMetrics({...activeMetrics, [metric]: !activeMetrics[metric]})} className="rounded" />
                                <span className="capitalize">{metric}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={prepareGrowthData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {activeMetrics.students && <Line type="monotone" dataKey="students" stroke="#3B82F6" name="Students" />}
                        {activeMetrics.managers && <Line type="monotone" dataKey="managers" stroke="#10B981" name="Managers" />}
                        {activeMetrics.hostels && <Line type="monotone" dataKey="hostels" stroke="#F59E0B" name="Hostels" />}
                        {activeMetrics.applications && <Line type="monotone" dataKey="applications" stroke="#EF4444" name="Applications" />}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Conversion Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4">Application Conversion</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={prepareConversionData()} cx="50%" cy="50%" labelLine={false} label={entry => `${entry.name}: ${entry.value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                                {prepareConversionData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4">Popular Locations</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={locations}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="hostelCount" fill="#3B82F6" name="Hostels" />
                            <Bar dataKey="totalApplications" fill="#10B981" name="Applications" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Peak Seasons */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Peak Seasons (Monthly Applications)</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={peakSeasons.map(d => ({ month: `${d._id.year}-${String(d._id.month).padStart(2, '0')}`, count: d.count }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8B5CF6" name="Applications" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
