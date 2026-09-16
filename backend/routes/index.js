const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const hostelRoutes = require('./hostel.routes');
const applicationRoutes = require('./application.routes');
const adminRoutes = require('./admin');
const paymentRoutes = require('./payment');
const transactionRoutes = require('./transactions');
const waitlistRoutes = require('./waitlist');
const visitorRoutes = require('./visitors');
const payoutRoutes = require('./payout');
const gdprRoutes = require('./gdpr');
const backupRoutes = require('./backup');
const dataRetentionRoutes = require('./dataRetention');
const cacheRoutes = require('./cache');

const { auth } = require('../middleware/auth');
const { waitlistLimiter } = require('../config/security');

// Mount routes
router.use('/auth', authRoutes);
router.use('/hostels', hostelRoutes);
router.use('/applications', applicationRoutes);
router.use('/admin', adminRoutes);
router.use('/payment', paymentRoutes);
router.use('/transactions', auth, transactionRoutes);
router.use('/waitlist', waitlistLimiter, waitlistRoutes);
router.use('/visitors', visitorRoutes);
router.use('/payout', payoutRoutes);
router.use('/gdpr', gdprRoutes);
router.use('/backup', backupRoutes);
router.use('/data-retention', dataRetentionRoutes);
router.use('/cache', cacheRoutes);

module.exports = router;
