const logger = require('../config/logger');

const parseHostelPayload = (req, res, next) => {
  try {
    if (req.body?.payload) {
      req.hostelPayload = typeof req.body.payload === 'string' ? JSON.parse(req.body.payload) : req.body.payload;
    } else {
      const payload = { ...(req.body || {}) };
      if (typeof payload.roomTypes === 'string') {
        try { payload.roomTypes = JSON.parse(payload.roomTypes); } catch (_) {}
      }
      if (typeof payload.facilities === 'string') {
        try { payload.facilities = JSON.parse(payload.facilities); } catch (_) {}
      }
      if (typeof payload.hostelImages === 'string') {
        try { payload.hostelImages = JSON.parse(payload.hostelImages); } catch (_) {}
      }
      req.hostelPayload = payload;
    }

    next();
  } catch (error) {
    logger.warn('Invalid hostel payload received', { error: error.message });
    res.status(400).json({ message: 'Invalid hostel payload format' });
  }
};

module.exports = {
  parseHostelPayload
};
