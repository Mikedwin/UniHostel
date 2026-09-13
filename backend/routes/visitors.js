const express = require('express');
const { recordVisitorEvent } = require('../middleware/trackVisitor');

const router = express.Router();

const normalizeTrackedPath = (value) => {
  if (typeof value !== 'string') return '';

  const trimmed = value.trim();
  if (!trimmed) return '';

  return trimmed.startsWith('/') ? trimmed.slice(0, 500) : `/${trimmed}`.slice(0, 500);
};

router.post('/track', async (req, res) => {
  const path = normalizeTrackedPath(req.body?.path);

  if (!path) {
    return res.status(400).json({ message: 'A valid path is required for visitor tracking.' });
  }

  const sessionId = typeof req.body?.sessionId === 'string'
    ? req.body.sessionId.trim().slice(0, 120)
    : undefined;

  const pageTitle = typeof req.body?.pageTitle === 'string'
    ? req.body.pageTitle.trim().slice(0, 200)
    : undefined;

  const referrer = typeof req.body?.referrer === 'string'
    ? req.body.referrer.trim().slice(0, 500)
    : undefined;

  try {
    await recordVisitorEvent(req, {
      url: path,
      method: 'PAGEVIEW',
      eventType: 'pageview',
      source: 'frontend-spa',
      sessionId,
      pageTitle,
      referrer
    });

    res.status(202).json({ tracked: true });
  } catch (error) {
    console.error('Visitor pageview tracking failed:', error);
    res.status(202).json({ tracked: false });
  }
});

module.exports = router;
