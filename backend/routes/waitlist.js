const express = require('express');
const router = express.Router();
const Waitlist = require('../models/Waitlist');
const { auth, checkRole } = require('../middleware/auth');
const logger = require('../config/logger');

// POST /api/waitlist/join - Public join endpoint
router.post('/join', async (req, res) => {
  try {
    const { name, email, phone, source } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const cleanPhone = phone.trim();
    if (cleanPhone.length < 8) {
      return res.status(400).json({ message: 'Please provide a valid phone number' });
    }

    // Check if already on waitlist
    const existing = await Waitlist.findOne({ email: cleanEmail });
    if (existing) {
      const totalCount = await Waitlist.countDocuments();
      return res.status(200).json({
        success: true,
        alreadyJoined: true,
        message: "You're already on the UniHostel waitlist! We will notify you the moment early access opens.",
        position: totalCount
      });
    }

    // Create new waitlist entry
    const newEntry = new Waitlist({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      source: source || 'website'
    });

    await newEntry.save();
    const position = await Waitlist.countDocuments();

    logger.info(`New waitlist signup: ${cleanEmail} (Position #${position})`);

    return res.status(201).json({
      success: true,
      message: 'Congratulations! You have been added to the UniHostel waitlist.',
      position
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        alreadyJoined: true,
        message: "You're already on the UniHostel waitlist! We will notify you soon."
      });
    }

    logger.error('Waitlist join error:', error);
    return res.status(500).json({ message: 'Failed to join waitlist. Please try again later.' });
  }
});

// GET /api/waitlist - Admin view list with search & pagination
router.get('/', auth, checkRole('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search ? req.query.search.trim() : '';

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Waitlist.countDocuments(filter);
    const totalAll = await Waitlist.countDocuments();
    const entries = await Waitlist.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      success: true,
      total,
      totalAll,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      entries
    });
  } catch (error) {
    logger.error('Waitlist fetch error:', error);
    return res.status(500).json({ message: 'Server error fetching waitlist' });
  }
});

// GET /api/waitlist/export - Admin export to CSV
router.get('/export', auth, checkRole('admin'), async (req, res) => {
  try {
    const entries = await Waitlist.find().sort({ createdAt: -1 });

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const text = String(str).replace(/"/g, '""');
      return `"${text}"`;
    };

    const header = ['ID', 'Full Name', 'Email', 'Phone Number', 'Status', 'Source', 'Date Joined'];
    const rows = entries.map((e, index) => [
      index + 1,
      escapeCsv(e.name),
      escapeCsv(e.email),
      escapeCsv(e.phone),
      escapeCsv(e.status),
      escapeCsv(e.source),
      escapeCsv(new Date(e.createdAt).toLocaleString())
    ]);

    const csvContent = [
      header.join(','),
      ...rows.map(r => r.join(','))
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="unihostel-waitlist-${Date.now()}.csv"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    logger.error('Waitlist export error:', error);
    return res.status(500).json({ message: 'Server error exporting waitlist' });
  }
});

// DELETE /api/waitlist/:id - Admin delete entry
router.delete('/:id', auth, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Waitlist.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Waitlist entry not found' });
    }

    return res.json({ success: true, message: 'Waitlist entry deleted successfully' });
  } catch (error) {
    logger.error('Waitlist delete error:', error);
    return res.status(500).json({ message: 'Server error deleting waitlist entry' });
  }
});

module.exports = router;
