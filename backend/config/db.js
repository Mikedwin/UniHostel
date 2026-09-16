const mongoose = require('mongoose');
const logger = require('./logger');
const { validateRuntimeEnv } = require('./env');

let dbConnected = false;
let dbConnectionAttempts = 0;
const MAX_DB_RETRIES = 5;

const connectDB = async () => {
  try {
    validateRuntimeEnv();
    dbConnectionAttempts++;
    logger.info(`MongoDB connection attempt ${dbConnectionAttempts}/${MAX_DB_RETRIES}`);
    
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true,
      maxIdleTimeMS: 60000,
      family: 4
    });
    
    dbConnected = true;
    dbConnectionAttempts = 0;
    logger.info('MongoDB Connected successfully');
    console.log('MongoDB Connected');
  } catch (err) {
    logger.error(`MongoDB Connection Error (Attempt ${dbConnectionAttempts}/${MAX_DB_RETRIES}):`, err.message);
    console.log(`MongoDB Error (Attempt ${dbConnectionAttempts}/${MAX_DB_RETRIES}):`, err.message);
    
    if (dbConnectionAttempts < MAX_DB_RETRIES) {
      const retryDelay = Math.min(1000 * Math.pow(2, dbConnectionAttempts), 30000);
      logger.info(`Retrying in ${retryDelay/1000} seconds...`);
      console.log(`Retrying in ${retryDelay/1000} seconds...`);
      setTimeout(connectDB, retryDelay);
    } else {
      logger.error('Max retry attempts reached. Exiting...');
      console.log('Max retry attempts reached. Exiting...');
      process.exit(1);
    }
  }
};

mongoose.connection.on('connected', () => {
  dbConnected = true;
  logger.info('MongoDB connection established');
  console.log('MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  dbConnected = false;
  logger.warn('MongoDB disconnected. Attempting to reconnect...');
  console.log('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  dbConnected = false;
  logger.error('MongoDB connection error:', err);
  console.log('MongoDB connection error:', err.message);
});

mongoose.connection.on('reconnected', () => {
  dbConnected = true;
  logger.info('MongoDB reconnected');
  console.log('MongoDB reconnected');
});

const isDbConnected = () => dbConnected;

module.exports = {
  connectDB,
  isDbConnected
};
