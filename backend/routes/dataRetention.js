const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const { runDataRetentionCleanup } = require('../services/dataRetention');
const logger = require('../config/logger');
const { sendServerError } = require('../utils/serverError');

// Manual trigger for data retention cleanup (Admin only)
router.post('/cleanup', auth, checkRole('admin'), async (req, res) => {
  try {
    logger.info(`Manual data retention cleanup triggered by admin: ${req.user.id}`);
    const results = await runDataRetentionCleanup();
    res.json({ 
      success: true, 
      message: 'Data retention cleanup completed',
      results 
    });
  } catch (error) {
    return sendServerError(res, error, {
      field: 'message',
      clientMessage: 'Data retention cleanup failed',
      logMessage: 'Manual data retention cleanup failed',
      extra: {
        success: false
      }
    });
  }
});

module.exports = router;
