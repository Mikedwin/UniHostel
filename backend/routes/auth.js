const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { invalidateCsrfToken } = require('../middleware/csrf');

// Logout endpoint - invalidate CSRF token
router.post('/logout', auth, (req, res) => {
  try {
    const csrfToken = req.headers['x-csrf-token'];
    invalidateCsrfToken(csrfToken);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' });
  }
});

module.exports = router;
