const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const cache = require('../services/cache');

// Get cache statistics (Admin only)
router.get('/stats', auth, checkRole('admin'), (req, res) => {
  const stats = cache.getStats();
  res.json({
    hits: stats.hits,
    misses: stats.misses,
    keys: stats.keys,
    ksize: stats.ksize,
    vsize: stats.vsize,
    hitRate: stats.hits > 0 ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2) + '%' : '0%'
  });
});

// Clear cache (Admin only)
router.post('/clear', auth, checkRole('admin'), (req, res) => {
  cache.flush();
  res.json({ message: 'Cache cleared successfully' });
});

module.exports = router;
