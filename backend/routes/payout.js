const express = require('express');
const router = express.Router();
const axios = require('axios');
const { auth, checkRole } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');
const User = require('../models/User');
const logger = require('../config/logger');

// Create Paystack Transfer Recipient for Manager Mobile Money
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

    // Map provider to Paystack Mobile Money bank code
    const bankCodeMap = {
      'MTN': 'MTN',
      'Vodafone': 'VOD',
      'AirtelTigo': 'ATL'
    };

    const bankCode = bankCodeMap[momoProvider];
    if (!bankCode) {
      return res.status(400).json({ message: 'Invalid Mobile Money provider' });
    }

    // Create Paystack Transfer Recipient for Mobile Money
    const response = await axios.post(
      'https://api.paystack.co/transferrecipient',
      {
        type: 'mobile_money',
        name: momoAccountName,
        account_number: cleanNumber,
        bank_code: bankCode,
        currency: 'GHS'
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status) {
      manager.momoProvider = momoProvider;
      manager.momoNumber = cleanNumber;
      manager.momoAccountName = momoAccountName;
      manager.paystackSubaccountCode = response.data.data.recipient_code;
      manager.paystackSubaccountId = response.data.data.id;
      manager.payoutEnabled = true;
      await manager.save();

      logger.info(`Transfer recipient created for manager: ${manager.email}`);
      
      res.json({ 
        message: 'Mobile Money setup successful! You will receive automatic payouts after each payment.',
        recipientCode: response.data.data.recipient_code
      });
    } else {
      throw new Error(response.data.message || 'Failed to create transfer recipient');
    }
  } catch (err) {
    logger.error('Transfer recipient creation error:', err.response?.data || err.message);
    res.status(500).json({ 
      message: err.response?.data?.message || 'Failed to setup Mobile Money. Please try again.' 
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
    if (!manager || !manager.paystackSubaccountCode) {
      return res.status(404).json({ message: 'No existing Mobile Money setup found' });
    }

    // Map provider to Paystack Mobile Money bank code
    const bankCodeMap = {
      'MTN': 'MTN',
      'Vodafone': 'VOD',
      'AirtelTigo': 'ATL'
    };

    const bankCode = bankCodeMap[momoProvider];
    if (!bankCode) {
      return res.status(400).json({ message: 'Invalid Mobile Money provider' });
    }

    // Create new transfer recipient
    const response = await axios.post(
      'https://api.paystack.co/transferrecipient',
      {
        type: 'mobile_money',
        name: momoAccountName,
        account_number: cleanNumber,
        bank_code: bankCode,
        currency: 'GHS'
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status) {
      manager.momoProvider = momoProvider;
      manager.momoNumber = cleanNumber;
      manager.momoAccountName = momoAccountName;
      manager.paystackSubaccountCode = response.data.data.recipient_code;
      manager.paystackSubaccountId = response.data.data.id;
      await manager.save();

      logger.info(`Transfer recipient updated for manager: ${manager.email}`);
      res.json({ message: 'Mobile Money details updated successfully!' });
    } else {
      throw new Error(response.data.message || 'Failed to update transfer recipient');
    }
  } catch (err) {
    logger.error('Transfer recipient update error:', err.response?.data || err.message);
    res.status(500).json({ 
      message: err.response?.data?.message || 'Failed to update Mobile Money details' 
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
