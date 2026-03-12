const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Logout endpoint
router.post('/logout', auth, (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' });
  }
});

module.exports = router;
