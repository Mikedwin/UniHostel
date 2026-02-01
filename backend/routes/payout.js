const express = require('express');
const router = express.Router();
const axios = require('axios');
const { auth, checkRole } = require('../middleware/auth');
const User = require('../models/User');
const logger = require('../config/logger');

// Create Paystack Subaccount
const createPaystackSubaccount = async (businessName, accountNumber, bankCode, percentageCharge) => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/subaccount',
      {
        business_name: businessName,
        settlement_bank: bankCode,
        account_number: accountNumber,
        percentage_charge: percentageCharge
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.data;
  } catch (error) {
    logger.error('Paystack subaccount creation error:', error.response?.data);
    throw error;
  }
};

// Get bank code from Mobile Money provider
const getBankCode = (provider) => {
  const bankCodes = {
    'MTN': 'MTN',
    'Vodafone': 'VDF',
    'AirtelTigo': 'ATL'
  };
  return bankCodes[provider] || 'MTN';
};

// Store Mobile Money details and create Paystack subaccount
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

    // Create Paystack subaccount
    logger.info(`Creating Paystack subaccount for manager: ${manager.email}`);
    
    const commissionPercent = parseFloat(process.env.ADMIN_COMMISSION_PERCENT) || 10;
    const bankCode = getBankCode(momoProvider);
    
    try {
      const subaccount = await createPaystackSubaccount(
        momoAccountName,
        cleanNumber,
        bankCode,
        commissionPercent // Platform takes this percentage
      );
      
      // Store subaccount details
      manager.momoProvider = momoProvider;
      manager.momoNumber = cleanNumber;
      manager.momoAccountName = momoAccountName;
      manager.payoutEnabled = true;
      manager.paystackSubaccountCode = subaccount.subaccount_code;
      await manager.save();

      logger.info(`Paystack subaccount created: ${subaccount.subaccount_code}`);
      
      res.json({ 
        message: 'Mobile Money setup successful! Automatic payouts enabled.',
        info: `When students pay, you automatically receive ${100 - commissionPercent}% directly to your Mobile Money within 24 hours.`,
        subaccountCode: subaccount.subaccount_code
      });
    } catch (paystackError) {
      logger.error('Paystack API error:', paystackError.response?.data);
      
      // If subaccount creation fails, still save details for manual processing
      manager.momoProvider = momoProvider;
      manager.momoNumber = cleanNumber;
      manager.momoAccountName = momoAccountName;
      manager.payoutEnabled = false;
      await manager.save();
      
      return res.status(500).json({ 
        message: 'Mobile Money details saved, but automatic payout setup failed. Contact support.',
        error: paystackError.response?.data?.message || 'Paystack API error'
      });
    }
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
