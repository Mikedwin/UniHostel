const express = require('express');
const router = express.Router();
const axios = require('axios');
const { auth, checkRole } = require('../middleware/auth');
const User = require('../models/User');
const logger = require('../config/logger');

// Store Mobile Money details for manual payouts
router.post('/setup-momo', auth, checkRole('manager'), async (req, res) => {
  try {
    const { momoProvider, momoNumber, momoAccountName } = req.body;

    if (!momoProvider || !momoNumber || !momoAccountName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate phone number format (10 digits)
    const cleanNumber = momoNumber.replace(/\s/g, '');
    if (!/^0\d{9}$/.test(cleanNumber)) {
      return res.status(400).json({ message: 'Invalid mobile number format. Use 10 digits starting with 0' });
    }

    const manager = await User.findById(req.user.id);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    // Store Mobile Money details
    manager.momoProvider = momoProvider;
    manager.momoNumber = cleanNumber;
    manager.momoAccountName = momoAccountName;
    manager.payoutEnabled = true;
    manager.paystackSubaccountCode = `MOMO_${manager._id}`;
    await manager.save();

    logger.info(`Mobile Money details saved for manager: ${manager.email}`);
    
    res.json({ 
      message: 'Mobile Money setup successful! Your payout details have been saved.',
      info: 'When students pay, you will receive your share (97%) directly to this Mobile Money number within 24 hours.'
    });
  } catch (err) {
    logger.error('Mobile Money setup error:', err);
    res.status(500).json({ 
      message: 'Failed to setup Mobile Money. Please try again.' 
    });
  }
});

// Update Mobile Money Details
router.put('/update-momo', auth, checkRole('manager'), async (req, res) => {
  try {
    const { momoProvider, momoNumber, momoAccountName } = req.body;

    if (!momoProvider || !momoNumber || !momoAccountName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const cleanNumber = momoNumber.replace(/\s/g, '');
    if (!/^0\d{9}$/.test(cleanNumber)) {
      return res.status(400).json({ message: 'Invalid mobile number format' });
    }

    const manager = await User.findById(req.user.id);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    manager.momoProvider = momoProvider;
    manager.momoNumber = cleanNumber;
    manager.momoAccountName = momoAccountName;
    await manager.save();

    logger.info(`Mobile Money details updated for manager: ${manager.email}`);
    res.json({ message: 'Mobile Money details updated successfully!' });
  } catch (err) {
    logger.error('Mobile Money update error:', err);
    res.status(500).json({ 
      message: 'Failed to update Mobile Money details' 
    });
  }
});

// Get Manager's Mobile Money Details
router.get('/momo-details', auth, checkRole('manager'), async (req, res) => {
  try {
    const manager = await User.findById(req.user.id).select('momoProvider momoNumber momoAccountName payoutEnabled paystackSubaccountCode');
    
    res.json({
      momoProvider: manager.momoProvider || null,
      momoNumber: manager.momoNumber || null,
      momoAccountName: manager.momoAccountName || null,
      payoutEnabled: manager.payoutEnabled || false,
      hasSubaccount: !!manager.paystackSubaccountCode
    });
  } catch (err) {
    logger.error('Get MoMo details error:', err);
    res.status(500).json({ message: 'Failed to fetch Mobile Money details' });
  }
});

module.exports = router;
