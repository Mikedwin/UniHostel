const NodeCache = require('node-cache');
const logger = require('../config/logger');

const TTL = parseInt(process.env.CACHE_TTL_SECONDS) || 300; // 5 minutes default
const CHECK_PERIOD = parseInt(process.env.CACHE_CHECK_PERIOD) || 60; // 1 minute

const cache = new NodeCache({
  stdTTL: TTL,
  checkperiod: CHECK_PERIOD,
  useClones: false
});

cache.on('set', (key) => {
  logger.debug(`Cache SET: ${key}`);
});

cache.on('del', (key) => {
  logger.debug(`Cache DEL: ${key}`);
});

cache.on('expired', (key) => {
  logger.debug(`Cache EXPIRED: ${key}`);
});

const get = (key) => {
  return cache.get(key);
};

const set = (key, value, ttl = TTL) => {
  return cache.set(key, value, ttl);
};

const del = (key) => {
  return cache.del(key);
};

const flush = () => {
  return cache.flushAll();
};

const invalidatePattern = (pattern) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(pattern));
  return cache.del(matchingKeys);
};

const getStats = () => {
  return cache.getStats();
};

module.exports = {
  get,
  set,
  del,
  flush,
  invalidatePattern,
  getStats
};
