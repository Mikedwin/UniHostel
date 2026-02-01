const express = require('express');
const router = express.Router();
const axios = require('axios');
const Application = require('../models/Application');
const Hostel = require('../models/Hostel');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');
const { sendPaymentSuccessEmail } = require('../utils/emailService');
const logger = require('../config/logger');

// Step 4: Initialize payment (only for approved_for_payment applications)
router.post('/initialize', auth, async (req, res) => {
  try {
    console.log('=== PAYMENT INITIALIZATION START ===');
    console.log('Request body:', req.body);
    console.log('User ID:', req.user.id);
    
    const { applicationId } = req.body;

    if (!applicationId) {
      console.error('No applicationId provided');
      return res.status(400).json({ message: 'Application ID is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      console.error('User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User found:', user.email);

    const application = await Application.findById(applicationId).populate('hostelId');
    if (!application) {
      console.error('Application not found:', applicationId);
      return res.status(404).json({ message: 'Application not found' });
    }
    console.log('Application found:', application._id);
    console.log('Application status:', application.status);
    console.log('Payment status:', application.paymentStatus);
    
    if (application.status !== 'approved_for_payment') {
      console.error('Invalid application status:', application.status);
      return res.status(400).json({ message: 'Application must be approved by manager before payment' });
    }
    
    if (application.paymentStatus === 'paid') {
      console.error('Application already paid');
      return res.status(400).json({ message: 'Application already paid' });
    }

    const hostel = application.hostelId;
    if (!hostel) {
      console.error('Hostel not found for application');
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    const { totalAmount, hostelFee, adminCommission } = application;
    console.log('Payment amounts:', { totalAmount, hostelFee, adminCommission });
    
    // Validate payment amounts
    if (!totalAmount || totalAmount <= 0) {
      console.error('Invalid total amount:', totalAmount);
      return res.status(400).json({ 
        message: 'Invalid payment amount. Please contact support.',
        debug: { totalAmount, hostelFee, adminCommission }
      });
    }

    // Get manager's subaccount for split payment
    const manager = await User.findById(hostel.managerId);
    if (!manager) {
      console.error('Manager not found:', hostel.managerId);
      return res.status(404).json({ message: 'Hostel manager not found' });
    }
    
    const paymentData = {
      email: user.email,
      amount: Math.round(totalAmount * 100), // Convert to kobo and ensure integer
      currency: 'GHS', // Ghana Cedis
      reference: `UNI-${application._id}-${Date.now()}`,
      callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
      channels: ['card', 'mobile_money'],
      metadata: {
        applicationId: application._id.toString(),
        hostelName: hostel.name,
        roomType: application.roomType,
        semester: application.semester,
        hostelFee: hostelFee,
        adminCommission: adminCommission
      }
    };

    // Add split payment if manager has valid Paystack subaccount
    if (manager.paystackSubaccountCode && manager.payoutEnabled && manager.paystackSubaccountCode.startsWith('ACCT_')) {
      paymentData.subaccount = manager.paystackSubaccountCode;
      console.log('Split payment enabled for manager:', manager.email, 'Subaccount:', manager.paystackSubaccountCode);
    } else {
      console.log('No valid subaccount - payment goes to main account');
    }

    console.log('Calling Paystack API...');
    console.log('Payment data:', JSON.stringify(paymentData, null, 2));
    
    // Initialize Paystack payment
    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );
    
    console.log('Paystack response status:', paystackResponse.status);
    console.log('Paystack response data:', paystackResponse.data);

    application.paymentReference = paystackResponse.data.data.reference;
    await application.save();
    console.log('Payment reference saved:', application.paymentReference);

    console.log('=== PAYMENT INITIALIZATION SUCCESS ===');
    res.json({
      applicationId: application._id,
      authorizationUrl: paystackResponse.data.data.authorization_url,
      reference: paystackResponse.data.data.reference,
      email: user.email,
      totalAmount,
      hostelFee,
      adminCommission,
      splitPaymentEnabled: !!(manager.paystackSubaccountCode && manager.paystackSubaccountCode.startsWith('ACCT_'))
    });
  } catch (error) {
    console.error('=== PAYMENT INITIALIZATION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.response) {
      console.error('Paystack error response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    res.status(500).json({ 
      message: 'Payment initialization failed', 
      error: error.message,
      details: error.response?.data,
      hint: 'Check Railway logs for detailed error information'
    });
  }
});

// Step 5: Verify payment
router.get('/verify/:reference', auth, async (req, res) => {
  try {
    const { reference } = req.params;

    // Verify with Paystack
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const { status, metadata } = paystackResponse.data.data;

    if (status === 'success') {
      const application = await Application.findById(metadata.applicationId).populate('hostelId');
      if (application) {
        const existingTransaction = await Transaction.findOne({ paymentReference: reference });
        
        if (!existingTransaction) {
          const transaction = new Transaction({
            applicationId: application._id,
            studentId: application.studentId,
            hostelId: application.hostelId._id,
            managerId: application.hostelId.managerId,
            hostelFee: application.hostelFee,
            adminCommission: application.adminCommission,
            totalAmount: application.totalAmount,
            roomType: application.roomType,
            semester: application.semester,
            paymentReference: reference,
            paymentStatus: 'paid',
            paidAt: new Date()
          });
          await transaction.save();
        }
        
        application.paymentStatus = 'paid';
        application.status = 'paid_awaiting_final';
        application.paidAt = new Date();
        await application.save();

        const student = await User.findById(application.studentId);
        try {
          await sendPaymentSuccessEmail(
            student.email,
            student.name,
            application.hostelId.name,
            application.roomType,
            application.totalAmount,
            reference
          );
        } catch (emailErr) {
          logger.error('Payment email notification error:', emailErr);
        }

        res.json({ 
          success: true, 
          message: 'Payment verified successfully. Awaiting final manager approval.',
          application 
        });
      } else {
        res.status(404).json({ message: 'Application not found' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
});

// Webhook for Paystack
router.post('/webhook', async (req, res) => {
  try {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash === req.headers['x-paystack-signature']) {
      const event = req.body;

      if (event.event === 'charge.success') {
        const { metadata, reference } = event.data;
        
        const application = await Application.findById(metadata.applicationId).populate('hostelId');
        if (application && application.paymentStatus === 'pending') {
          // Check if transaction already exists (idempotency)
          const existingTransaction = await Transaction.findOne({ paymentReference: reference });
          
          if (!existingTransaction) {
            // Create transaction record
            const transaction = new Transaction({
              applicationId: application._id,
              studentId: application.studentId,
              hostelId: application.hostelId._id,
              managerId: application.hostelId.managerId,
              hostelFee: application.hostelFee,
              adminCommission: application.adminCommission,
              totalAmount: application.totalAmount,
              roomType: application.roomType,
              semester: application.semester,
              paymentReference: reference,
              paymentStatus: 'paid',
              paidAt: new Date()
            });
            await transaction.save();
          }
          
          application.paymentStatus = 'paid';
          application.status = 'paid_awaiting_final';
          application.paidAt = new Date();
          await application.save();
          
          // Send payment success email
          const student = await User.findById(application.studentId);
          try {
            await sendPaymentSuccessEmail(
              student.email,
              student.name,
              application.hostelId.name,
              application.roomType,
              application.totalAmount,
              reference
            );
          } catch (emailErr) {
            logger.error('Webhook payment email error:', emailErr);
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

module.exports = router;
