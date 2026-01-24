const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { auth, checkRole } = require('../middleware/auth');
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Application = require('../models/Application');
const Transaction = require('../models/Transaction');

// Manual backup endpoint - Admin only
router.get('/export', auth, checkRole('admin'), async (req, res) => {
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      users: await User.find().select('-password').lean(),
      hostels: await Hostel.find().lean(),
      applications: await Application.find().lean(),
      transactions: await Transaction.find().lean()
    };

    const backupDir = path.join(__dirname, '../backups/manual');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filename = `backup-${Date.now()}.json`;
    const filepath = path.join(backupDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  } catch (err) {
    console.error('Backup error:', err);
    res.status(500).json({ error: 'Backup failed' });
  }
});

module.exports = router;
