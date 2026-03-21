const express = require('express');
const router = express.Router();
const axios = require('axios');
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Hostel = require('../models/Hostel');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { auth, checkRole } = require('../middleware/auth');
const { sendPaymentSuccessEmail } = require('../utils/emailService');
const logger = require('../config/logger');

const canAccessApplicationPayment = (user, application) => {
  if (!user || !application) return false;

  if (user.role === 'admin') {
    return true;
  }

  const studentId = application.studentId && application.studentId.toString
    ? application.studentId.toString()
    : String(application.studentId);

  return user.role === 'student' && studentId === user.id;
};

const ensureApplicationPaymentAccess = (req, res, application) => {
  if (canAccessApplicationPayment(req.user, application)) {
    return true;
  }

  res.status(403).json({ message: 'Access denied: You can only access your own payment records.' });
  return false;
};

const MAX_BATCH_STATUS_IDS = 25;

const formatPaymentStatus = (application) => ({
  applicationId: application._id,
  paymentStatus: application.paymentStatus,
  status: application.status,
  paymentReference: application.paymentReference,
  paidAt: application.paidAt,
  canPay: application.status === 'approved_for_payment' && application.paymentStatus !== 'paid'
});

const syncApplicationPaymentStatus = async (application) => {
  if (!application?.paymentReference || application.paymentStatus === 'paid') {
    return application;
  }

  try {
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${application.paymentReference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const { status } = paystackResponse.data.data;

    if (status === 'success') {
      const existingTransaction = await Transaction.findOne({ paymentReference: application.paymentReference });

      if (!existingTransaction) {
        const hostel = application.hostelId?.managerId
          ? application.hostelId
          : await Hostel.findById(application.hostelId).select('managerId');

        if (!hostel || !hostel.managerId) {
          throw new Error(`Hostel manager not found for application ${application._id}`);
        }

        const transaction = new Transaction({
          applicationId: application._id,
          studentId: application.studentId,
          hostelId: hostel._id,
          managerId: hostel.managerId,
          hostelFee: application.hostelFee,
          adminCommission: application.adminCommission,
          totalAmount: application.totalAmount,
          roomType: application.roomType,
          semester: application.semester,
          paymentReference: application.paymentReference,
          paymentStatus: 'paid',
          paidAt: new Date()
        });
        await transaction.save();
      }

      application.paymentStatus = 'paid';
      application.status = 'paid_awaiting_final';
      application.paidAt = new Date();
      await application.save();

      logger.info(`Auto-fixed payment status for application ${application._id}`);
    }
  } catch (paystackError) {
    logger.error('Paystack verification error:', paystackError.message);
  }

  return application;
};

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

    if (!ensureApplicationPaymentAccess(req, res, application)) {
      return;
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
    
    // NEW: Check if there's already a successful payment for this application
    if (application.paymentReference) {
      try {
        const existingPaymentCheck = await axios.get(
          `https://api.paystack.co/transaction/verify/${application.paymentReference}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
          }
        );
        
        if (existingPaymentCheck.data.data.status === 'success') {
          console.error('Payment already successful on Paystack but not updated in system');
          // Auto-update the payment status
          application.paymentStatus = 'paid';
          application.status = 'paid_awaiting_final';
          application.paidAt = new Date();
          await application.save();
          
          return res.status(400).json({ 
            message: 'Payment already completed for this application',
            autoFixed: true
          });
        }
      } catch (paystackError) {
        console.log('Could not verify existing payment reference:', paystackError.message);
        // Continue with new payment initialization if verification fails
      }
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
        adminCommission: adminCommission,
        hostelId: hostel._id.toString(),
        managerId: hostel.managerId.toString()
      }
    };

    // Add subaccount for automatic split if manager has one configured
    if (manager.paystackSubaccountCode && manager.payoutEnabled) {
      paymentData.subaccount = manager.paystackSubaccountCode;
      paymentData.transaction_charge = Math.round(adminCommission * 100); // Admin commission in kobo
      console.log('Split payment enabled with subaccount:', manager.paystackSubaccountCode);
      console.log('Transaction charge (admin commission):', adminCommission);
    } else {
      console.log('No subaccount configured for manager. Payment will go to main account.');
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
      splitPaymentEnabled: true
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
        if (!ensureApplicationPaymentAccess(req, res, application)) {
          return;
        }

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

// NEW: Check payment status for application (prevents duplicate payments)
router.post('/status/batch', auth, async (req, res) => {
  try {
    const applicationIds = Array.isArray(req.body.applicationIds)
      ? [...new Set(req.body.applicationIds.filter((id) => typeof id === 'string' && id.trim()))]
      : null;

    if (!applicationIds) {
      return res.status(400).json({ message: 'applicationIds must be an array of application IDs' });
    }

    if (applicationIds.length === 0) {
      return res.json({ statuses: [] });
    }

    if (applicationIds.length > MAX_BATCH_STATUS_IDS) {
      return res.status(400).json({ message: `You can only check up to ${MAX_BATCH_STATUS_IDS} applications at a time` });
    }

    const invalidId = applicationIds.find((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidId) {
      return res.status(400).json({ message: `Invalid application ID: ${invalidId}` });
    }

    const applications = await Application.find({ _id: { $in: applicationIds } })
      .populate('hostelId', 'managerId');

    if (applications.length !== applicationIds.length) {
      return res.status(404).json({ message: 'One or more applications were not found' });
    }

    const unauthorizedApplication = applications.find((application) => !canAccessApplicationPayment(req.user, application));
    if (unauthorizedApplication) {
      return res.status(403).json({ message: 'Access denied: You can only access your own payment records.' });
    }

    const syncedApplications = await Promise.all(applications.map(syncApplicationPaymentStatus));
    const statusMap = new Map(
      syncedApplications.map((application) => [application._id.toString(), formatPaymentStatus(application)])
    );

    res.json({
      statuses: applicationIds.map((applicationId) => statusMap.get(applicationId)).filter(Boolean)
    });
  } catch (error) {
    logger.error('Batch payment status check error:', error);
    res.status(500).json({ message: 'Failed to check payment statuses' });
  }
});

router.get('/status/:applicationId', auth, async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await Application.findById(applicationId).populate('hostelId', 'managerId');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (!ensureApplicationPaymentAccess(req, res, application)) {
      return;
    }

    await syncApplicationPaymentStatus(application);
    res.json(formatPaymentStatus(application));
  } catch (error) {
    logger.error('Payment status check error:', error);
    res.status(500).json({ message: 'Failed to check payment status' });
  }
});

// NEW: Admin endpoint to manually verify payment
router.post('/admin/verify-payment', auth, checkRole('admin'), async (req, res) => {
  try {
    const { applicationId, paymentReference } = req.body;
    
    if (!applicationId) {
      return res.status(400).json({ message: 'Application ID is required' });
    }
    
    const application = await Application.findById(applicationId).populate('hostelId');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const referenceToCheck = paymentReference || application.paymentReference;
    if (!referenceToCheck) {
      return res.status(400).json({ message: 'Payment reference is required' });
    }
    
    // Verify with Paystack
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${referenceToCheck}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );
    
    const { status, metadata, amount } = paystackResponse.data.data;
    
    if (status === 'success') {
      // Check if transaction already exists
      const existingTransaction = await Transaction.findOne({ paymentReference: referenceToCheck });
      
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
          paymentReference: referenceToCheck,
          paymentStatus: 'paid',
          paidAt: new Date()
        });
        await transaction.save();
      }
      
      application.paymentStatus = 'paid';
      application.status = 'paid_awaiting_final';
      application.paidAt = new Date();
      if (!application.paymentReference) {
        application.paymentReference = referenceToCheck;
      }
      await application.save();
      
      logger.info(`Admin manually verified payment for application ${applicationId}`);
      
      res.json({
        success: true,
        message: 'Payment verified and updated successfully',
        application,
        paystackAmount: amount / 100, // Convert from kobo
        applicationAmount: application.totalAmount
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not successful on Paystack',
        paystackStatus: status
      });
    }
  } catch (error) {
    logger.error('Admin payment verification error:', error);
    res.status(500).json({
      message: 'Payment verification failed',
      error: error.response?.data || error.message
    });
  }
});

module.exports = router;
