import React, { useState, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Calendar, TrendingUp, Users, Home, CheckCircle, HelpCircle } from 'lucide-react';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

const ManagerAnalytics = ({ applications, hostels }) => {
    const [dateRange, setDateRange] = useState('30');
    const [exportLoading, setExportLoading] = useState(false);

    const filteredData = useMemo(() => {
        const days = parseInt(dateRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        // Filter out archived applications for analytics
        const activeApps = applications.filter(app => !app.isArchived);
        
        return {
            applications: activeApps.filter(app => new Date(app.createdAt) >= cutoffDate),
            allApplications: activeApps
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
        const approvedForPayment = filteredData.allApplications.filter(a => a.status === 'approved_for_payment').length;
        const paidAwaiting = filteredData.allApplications.filter(a => a.status === 'paid_awaiting_final').length;
        const approved = filteredData.allApplications.filter(a => a.status === 'approved').length;
        const rejected = filteredData.allApplications.filter(a => a.status === 'rejected').length;
        
        return [
            { name: 'Pending', value: pending, color: '#F59E0B' },
            { name: 'Approved for Payment', value: approvedForPayment, color: '#3B82F6' },
            { name: 'Paid Awaiting', value: paidAwaiting, color: '#F97316' },
            { name: 'Approved', value: approved, color: '#10B981' },
            { name: 'Rejected', value: rejected, color: '#EF4444' }
        ].filter(item => item.value > 0);
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
            const summaryData = [
                ['Manager Analytics Report'],
                ['Generated:', new Date().toLocaleString()],
                ['Date Range:', `Last ${dateRange} days`],
                [''],
                ['Key Metrics'],
                ['Total Hostels', hostels.length],
                ['Total Applications', filteredData.allApplications.length],
                ['Pending', filteredData.allApplications.filter(a => a.status === 'pending').length],
                ['Approved', filteredData.allApplications.filter(a => a.status === 'approved').length],
                ['Rejected', filteredData.allApplications.filter(a => a.status === 'rejected').length]
            ];
            
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
            
            const allData = [...summaryData, [''], ['Applications'], ...appsData];
            const csv = Papa.unparse(allData);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `Analytics_${new Date().toISOString().split('T')[0]}.csv`);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export');
        } finally {
            setExportLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Simple Explanation Banner */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <HelpCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900 mb-1">How to Use This Page</h3>
                        <p className="text-sm text-blue-800">
                            This page shows you how your hostels are performing. You can see how many students applied, 
                            which hostels are full, and which rooms are popular. Use the "Export Excel" button to save all data to your computer.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Your Business Summary</h2>
                    <p className="text-sm text-gray-600">See how your hostels are doing</p>
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
                        {exportLoading ? 'Exporting...' : 'Export CSV'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600 font-semibold">TOTAL STUDENTS APPLIED</p>
                            <p className="text-3xl font-bold text-blue-600">{filteredData.allApplications.length}</p>
                            <p className="text-xs text-gray-600 mt-1">📅 Last {dateRange} days: <span className="font-semibold">{filteredData.applications.length}</span></p>
                        </div>
                        <Users className="w-10 h-10 text-blue-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">How many students want to stay in your hostels</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600 font-semibold">STUDENTS ACCEPTED</p>
                            <p className="text-3xl font-bold text-green-600">
                                {filteredData.allApplications.filter(a => a.status === 'approved').length}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">Out of {filteredData.allApplications.length} applications</p>
                        </div>
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">Students you said YES to</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600 font-semibold">YOUR HOSTELS</p>
                            <p className="text-3xl font-bold text-purple-600">{hostels.length}</p>
                            <p className="text-xs text-gray-600 mt-1">Properties you manage</p>
                        </div>
                        <Home className="w-10 h-10 text-purple-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">Total number of your hostels</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600 font-semibold">ROOMS FILLED</p>
                            <p className="text-3xl font-bold text-orange-600">
                                {hostels.length > 0 
                                    ? (hostels.reduce((sum, h) => {
                                        const cap = h.roomTypes?.reduce((s, r) => s + r.totalCapacity, 0) || 0;
                                        const occ = h.roomTypes?.reduce((s, r) => s + (r.occupiedCapacity || 0), 0) || 0;
                                        return sum + (cap > 0 ? (occ / cap) * 100 : 0);
                                    }, 0) / hostels.length).toFixed(0)
                                    : 0}%
                            </p>
                            <p className="text-xs text-gray-600 mt-1">Average across all hostels</p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-orange-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">How full your hostels are</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900">🎯 Application Status</h3>
                        <p className="text-sm text-gray-600">Where your applications stand</p>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
                        <p className="text-sm text-blue-800">
                            <span className="font-semibold">Simple:</span> Yellow = Waiting for your decision, 
                            Green = You accepted them, Red = You rejected them
                        </p>
                    </div>
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
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900">🏠 Room Availability</h3>
                        <p className="text-sm text-gray-600">Which rooms are full or empty</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-4">
                        <p className="text-sm text-green-800">
                            <span className="font-semibold">Easy:</span> Green bars = Rooms with students, 
                            Gray bars = Empty rooms. Taller bars = more rooms.
                        </p>
                    </div>
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
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">⭐ Which Hostel is Doing Best?</h3>
                    <p className="text-sm text-gray-600">Compare all your hostels</p>
                </div>
                <div className="bg-purple-50 border-l-4 border-purple-400 p-3 mb-4">
                    <p className="text-sm text-purple-800">
                        <span className="font-semibold">What this means:</span> Blue bars = How many students applied. 
                        Green bars = How full the hostel is. Taller bars = better performance.
                    </p>
                </div>
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
