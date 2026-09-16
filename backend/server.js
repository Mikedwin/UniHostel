const app = require('./app');
const logger = require('./config/logger');
const { connectDB } = require('./config/db');
const { shouldExposeApiDocs } = require('./config/env');
const { scheduleDataRetentionCleanup } = require('./services/dataRetention');
const { verifyEmailTransport } = require('./utils/emailService');

const PORT = process.env.PORT || 5000;
let server = null;

const initializeRuntime = async () => {
  await connectDB();
  scheduleDataRetentionCleanup();

  if (process.env.NODE_ENV !== 'test') {
    setImmediate(() => {
      void verifyEmailTransport();
    });
  }
};

const startServer = async () => {
  await initializeRuntime();

  server = app.listen(PORT, () => {
    logger.info(`UniHostel server running on port ${PORT}`);
    console.log(`Server running on port ${PORT}`);
  });

  const handleShutdown = (signal) => {
    logger.info(`${signal} received. Closing HTTP server gracefully...`);
    if (server) {
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = {
  app,
  connectDB,
  shouldExposeApiDocs,
  startServer
};
