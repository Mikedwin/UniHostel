const express = require('express');
const router = express.Router();
const { invalidateCsrfToken } = require('../middleware/csrf');
const { clearAuthCookie } = require('../utils/authCookies');

// Logout endpoint
router.post('/logout', (req, res) => {
  try {
    const csrfToken = req.headers['x-csrf-token'];

    if (csrfToken) {
      invalidateCsrfToken(csrfToken);
    }

    clearAuthCookie(res);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' });
  }
});

module.exports = router;
