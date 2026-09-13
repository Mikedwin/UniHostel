const cache = require('../services/cache');
const logger = require('../config/logger');

const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      logger.debug(`Cache HIT: ${key}`);
      return res.json(cachedResponse);
    }

    logger.debug(`Cache MISS: ${key}`);
    const originalJson = res.json.bind(res);
    
    res.json = (body) => {
      cache.set(key, body, duration);
      return originalJson(body);
    };

    next();
  };
};

module.exports = { cacheMiddleware };
