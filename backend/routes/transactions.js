const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { auth, checkRole } = require('../middleware/auth');

// Manager: Get transactions for their hostels only
router.get('/manager', auth, checkRole('manager'), async (req, res) => {
  try {
    const { semester, startDate, endDate, hostelId } = req.query;
    
    const query = { managerId: req.user.id };
    
    if (semester) query.semester = semester;
    if (hostelId) query.hostelId = hostelId;
    if (startDate || endDate) {
      query.paidAt = {};
      if (startDate) query.paidAt.$gte = new Date(startDate);
      if (endDate) query.paidAt.$lte = new Date(endDate);
    }
    
    const transactions = await Transaction.find(query)
      .populate('studentId', 'name email')
      .populate('hostelId', 'name location')
      .select('-adminCommission -managerId') // Hide admin commission from manager
      .sort({ paidAt: -1 })
      .lean();
    
    // Calculate summary (only hostel fees, no admin commission)
    const summary = {
      totalRevenue: transactions.reduce((sum, t) => sum + t.hostelFee, 0),
      totalTransactions: transactions.length,
      bySemester: {}
    };
    
    transactions.forEach(t => {
      if (!summary.bySemester[t.semester]) {
        summary.bySemester[t.semester] = { count: 0, revenue: 0 };
      }
      summary.bySemester[t.semester].count++;
      summary.bySemester[t.semester].revenue += t.hostelFee;
    });
    
    res.json({ transactions, summary });
  } catch (err) {
    console.error('Manager transactions error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all transactions with full details
router.get('/admin', auth, checkRole('admin'), async (req, res) => {
  try {
    const { semester, startDate, endDate, hostelId, managerId } = req.query;
    
    const query = {};
    
    if (semester) query.semester = semester;
    if (hostelId) query.hostelId = hostelId;
    if (managerId) query.managerId = managerId;
    if (startDate || endDate) {
      query.paidAt = {};
      if (startDate) query.paidAt.$gte = new Date(startDate);
      if (endDate) query.paidAt.$lte = new Date(endDate);
    }
    
    const transactions = await Transaction.find(query)
      .populate('studentId', 'name email')
      .populate('hostelId', 'name location')
      .populate('managerId', 'name email')
      .sort({ paidAt: -1 })
      .lean();
    
    // Calculate comprehensive summary
    const summary = {
      totalRevenue: transactions.reduce((sum, t) => sum + t.totalAmount, 0),
      totalHostelRevenue: transactions.reduce((sum, t) => sum + t.hostelFee, 0),
      totalAdminCommission: transactions.reduce((sum, t) => sum + t.adminCommission, 0),
      totalTransactions: transactions.length,
      bySemester: {},
      byHostel: {}
    };
    
    transactions.forEach(t => {
      // By semester
      if (!summary.bySemester[t.semester]) {
        summary.bySemester[t.semester] = { 
          count: 0, 
          totalRevenue: 0, 
          hostelRevenue: 0, 
          adminCommission: 0 
        };
      }
      summary.bySemester[t.semester].count++;
      summary.bySemester[t.semester].totalRevenue += t.totalAmount;
      summary.bySemester[t.semester].hostelRevenue += t.hostelFee;
      summary.bySemester[t.semester].adminCommission += t.adminCommission;
      
      // By hostel
      const hostelKey = t.hostelId?._id?.toString() || 'unknown';
      if (!summary.byHostel[hostelKey]) {
        summary.byHostel[hostelKey] = {
          hostelName: t.hostelId?.name || 'Unknown',
          count: 0,
          totalRevenue: 0,
          hostelRevenue: 0,
          adminCommission: 0
        };
      }
      summary.byHostel[hostelKey].count++;
      summary.byHostel[hostelKey].totalRevenue += t.totalAmount;
      summary.byHostel[hostelKey].hostelRevenue += t.hostelFee;
      summary.byHostel[hostelKey].adminCommission += t.adminCommission;
    });
    
    res.json({ transactions, summary });
  } catch (err) {
    console.error('Admin transactions error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
