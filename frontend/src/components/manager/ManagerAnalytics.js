import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Calendar, TrendingUp, Users, Home, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ManagerAnalytics = ({ applications, hostels }) => {
    const [dateRange, setDateRange] = useState('30');
    const [exportLoading, setExportLoading] = useState(false);

    const filteredData = useMemo(() => {
        const days = parseInt(dateRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return {
            applications: applications.filter(app => new Date(app.createdAt) >= cutoffDate),
            allApplications: applications
        };
    }, [applications, dateRange]);

    const applicationTrends = useMemo(() => {
        const days = parseInt(dateRange);
        const trends = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            const dayApps = filteredData.applications.filter(app => {
                const appDate = new Date(app.createdAt);
                return appDate.toDateString() === date.toDateString();
            });
            
            trends.push({
                date: dateStr,
                total: dayApps.length,
                pending: dayApps.filter(a => a.status === 'pending').length,
                approved: dayApps.filter(a => a.status === 'approved').length,
                rejected: dayApps.filter(a => a.status === 'rejected').length
            });
        }
        
        return trends;
    }, [filteredData, dateRange]);

    const statusDistribution = useMemo(() => {
        const pending = filteredData.allApplications.filter(a => a.status === 'pending').length;
        const approved = filteredData.allApplications.filter(a => a.status === 'approved').length;
        const rejected = filteredData.allApplications.filter(a => a.status === 'rejected').length;
        
        return [
            { name: 'Pending', value: pending, color: '#F59E0B' },
            { name: 'Approved', value: approved, color: '#10B981' },
            { name: 'Rejected', value: rejected, color: '#EF4444' }
        ];
    }, [filteredData]);

    const hostelPerformance = useMemo(() => {
        return hostels.map(hostel => {
            const hostelApps = filteredData.allApplications.filter(app => app.hostelId?._id === hostel._id);
            const totalCapacity = hostel.roomTypes?.reduce((sum, r) => sum + r.totalCapacity, 0) || 0;
            const totalOccupied = hostel.roomTypes?.reduce((sum, r) => sum + (r.occupiedCapacity || 0), 0) || 0;
            const occupancyRate = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : 0;
            
            return {
                name: hostel.name.length > 15 ? hostel.name.substring(0, 15) + '...' : hostel.name,
                fullName: hostel.name,
                applications: hostelApps.length,
                occupancy: parseFloat(occupancyRate),
                capacity: totalCapacity,
                occupied: totalOccupied
            };
        }).sort((a, b) => b.applications - a.applications);
    }, [hostels, filteredData]);

    const roomTypeDistribution = useMemo(() => {
        const roomTypes = {};
        hostels.forEach(hostel => {
            hostel.roomTypes?.forEach(room => {
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
            available: data.total - data.occupied
        }));
    }, [hostels]);

    const exportToExcel = () => {
        setExportLoading(true);
        
        try {
            const wb = XLSX.utils.book_new();
            
            const summaryData = [
                ['Manager Analytics Report'],
                ['Generated:', new Date().toLocaleString()],
                ['Date Range:', `Last ${dateRange} days`],
                [],
                ['Key Metrics'],
                ['Total Hostels', hostels.length],
                ['Total Applications', filteredData.allApplications.length],
                ['Pending', filteredData.allApplications.filter(a => a.status === 'pending').length],
                ['Approved', filteredData.allApplications.filter(a => a.status === 'approved').length],
                ['Rejected', filteredData.allApplications.filter(a => a.status === 'rejected').length]
            ];
            const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
            
            const trendsData = [
                ['Date', 'Total', 'Pending', 'Approved', 'Rejected'],
                ...applicationTrends.map(t => [t.date, t.total, t.pending, t.approved, t.rejected])
            ];
            const trendsWs = XLSX.utils.aoa_to_sheet(trendsData);
            XLSX.utils.book_append_sheet(wb, trendsWs, 'Trends');
            
            const performanceData = [
                ['Hostel', 'Applications', 'Occupancy %', 'Capacity', 'Occupied'],
                ...hostelPerformance.map(h => [h.fullName, h.applications, h.occupancy, h.capacity, h.occupied])
            ];
            const performanceWs = XLSX.utils.aoa_to_sheet(performanceData);
            XLSX.utils.book_append_sheet(wb, performanceWs, 'Performance');
            
            const appsData = [
                ['Date', 'Student', 'Email', 'Hostel', 'Room', 'Semester', 'Status'],
                ...filteredData.allApplications.map(app => [
                    new Date(app.createdAt).toLocaleDateString(),
                    app.studentName,
                    app.studentId?.email || '',
                    app.hostelId?.name || '',
                    app.roomType,
                    app.semester,
                    app.status
                ])
            ];
            const appsWs = XLSX.utils.aoa_to_sheet(appsData);
            XLSX.utils.book_append_sheet(wb, appsWs, 'Applications');
            
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });
            saveAs(blob, `Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export');
        } finally {
            setExportLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Analytics & Insights</h2>
                    <p className="text-sm text-gray-600">Track performance and trends</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 text-sm"
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="60">Last 60 days</option>
                            <option value="90">Last 90 days</option>
                        </select>
                    </div>
                    <button
                        onClick={exportToExcel}
                        disabled={exportLoading}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                        <Download className="w-4 h-4" />
                        {exportLoading ? 'Exporting...' : 'Export Excel'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600 uppercase">Applications</p>
                            <p className="text-2xl font-bold">{filteredData.allApplications.length}</p>
                            <p className="text-xs text-gray-500 mt-1">Last {dateRange}d: {filteredData.applications.length}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600 uppercase">Approval Rate</p>
                            <p className="text-2xl font-bold">
                                {filteredData.allApplications.length > 0 
                                    ? ((filteredData.allApplications.filter(a => a.status === 'approved').length / filteredData.allApplications.length) * 100).toFixed(1)
                                    : 0}%
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{filteredData.allApplications.filter(a => a.status === 'approved').length} approved</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600 uppercase">Hostels</p>
                            <p className="text-2xl font-bold">{hostels.length}</p>
                            <p className="text-xs text-gray-500 mt-1">Active properties</p>
                        </div>
                        <Home className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600 uppercase">Avg Occupancy</p>
                            <p className="text-2xl font-bold">
                                {hostels.length > 0 
                                    ? (hostels.reduce((sum, h) => {
                                        const cap = h.roomTypes?.reduce((s, r) => s + r.totalCapacity, 0) || 0;
                                        const occ = h.roomTypes?.reduce((s, r) => s + (r.occupiedCapacity || 0), 0) || 0;
                                        return sum + (cap > 0 ? (occ / cap) * 100 : 0);
                                    }, 0) / hostels.length).toFixed(1)
                                    : 0}%
                            </p>
                            <p className="text-xs text-gray-500 mt-1">All hostels</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold mb-4">Application Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={applicationTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} name="Total" />
                        <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2} name="Pending" />
                        <Line type="monotone" dataKey="approved" stroke="#10B981" strokeWidth={2} name="Approved" />
                        <Line type="monotone" dataKey="rejected" stroke="#EF4444" strokeWidth={2} name="Rejected" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                dataKey="value"
                            >
                                {statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 flex justify-center gap-4">
                        {statusDistribution.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-sm">{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Room Capacity</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={roomTypeDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="occupied" fill="#10B981" name="Occupied" />
                            <Bar dataKey="available" fill="#D1D5DB" name="Available" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold mb-4">Hostel Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={hostelPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
                        <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="applications" fill="#3B82F6" name="Applications" />
                        <Bar yAxisId="right" dataKey="occupancy" fill="#10B981" name="Occupancy %" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ManagerAnalytics;
