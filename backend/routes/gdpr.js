const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Application = require('../models/Application');
const Hostel = require('../models/Hostel');
const logger = require('../config/logger');

// Export user data (GDPR compliance)
router.get('/export-data', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const data = { user };

    if (user.role === 'student') {
      data.applications = await Application.find({ studentId: req.user.id }).populate('hostelId', 'name location').lean();
    } else if (user.role === 'manager') {
      data.hostels = await Hostel.find({ managerId: req.user.id }).lean();
      const hostelIds = data.hostels.map(h => h._id);
      data.applications = await Application.find({ hostelId: { $in: hostelIds } }).populate('studentId', 'name email').lean();
    }

    logger.info(`Data export requested by user: ${user.email}`);
    res.json(data);
  } catch (err) {
    logger.error('Data export error:', err);
    res.status(500).json({ message: 'Failed to export data' });
  }
});

// Request account deletion (GDPR compliance)
router.delete('/delete-account', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts cannot be deleted' });
    }

    if (user.role === 'manager') {
      const hostels = await Hostel.find({ managerId: req.user.id });
      if (hostels.length > 0) {
        return res.status(400).json({ message: 'Cannot delete account with active hostel listings. Please remove all hostels first.' });
      }
    }

    if (user.role === 'student') {
      const pendingApps = await Application.find({ studentId: req.user.id, status: { $in: ['pending', 'approved_for_payment', 'paid_awaiting_final'] } });
      if (pendingApps.length > 0) {
        return res.status(400).json({ message: 'Cannot delete account with pending applications. Please cancel them first.' });
      }
    }

    await User.findByIdAndDelete(req.user.id);
    logger.info(`Account deleted: ${user.email}`);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    logger.error('Account deletion error:', err);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

module.exports = router;
