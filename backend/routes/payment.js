const express = require('express');
const router = express.Router();
const axios = require('axios');
const Application = require('../models/Application');
const Hostel = require('../models/Hostel');
const { auth } = require('../middleware/auth');

// Step 4: Initialize payment (only for approved_for_payment applications)
router.post('/initialize', auth, async (req, res) => {
  try {
    const { applicationId } = req.body;

    const application = await Application.findById(applicationId).populate('hostelId');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    
    // Check if application is approved for payment
    if (application.status !== 'approved_for_payment') {
      return res.status(400).json({ message: 'Application must be approved by manager before payment' });
    }
    
    // Check if already paid
    if (application.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Application already paid' });
    }

    const hostel = application.hostelId;
    const { totalAmount, hostelFee, adminCommission } = application;

    // Initialize Paystack payment
    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: req.user.email,
        amount: totalAmount * 100, // Paystack uses kobo (pesewas)
        reference: `UNI-${application._id}`,
        callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
        metadata: {
          applicationId: application._id.toString(),
          hostelName: hostel.name,
          roomType: application.roomType,
          semester: application.semester,
          hostelFee,
          adminCommission
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update application with payment reference
    application.paymentReference = paystackResponse.data.data.reference;
    await application.save();

    res.json({
      applicationId: application._id,
      authorizationUrl: paystackResponse.data.data.authorization_url,
      reference: paystackResponse.data.data.reference,
      totalAmount,
      hostelFee,
      adminCommission
    });
  } catch (error) {
    console.error('Payment initialization error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Payment initialization failed', error: error.message });
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
      // Update application payment status
      const application = await Application.findById(metadata.applicationId);
      if (application) {
        application.paymentStatus = 'paid';
        application.status = 'paid_awaiting_final'; // Step 5: Awaiting final approval
        application.paidAt = new Date();
        await application.save();

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
        const { metadata } = event.data;
        
        const application = await Application.findById(metadata.applicationId);
        if (application && application.paymentStatus === 'pending') {
          application.paymentStatus = 'paid';
          application.status = 'paid_awaiting_final';
          application.paidAt = new Date();
          await application.save();
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
