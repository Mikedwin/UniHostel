const cron = require('node-cron');
const User = require('../models/User');
const Application = require('../models/Application');
const Transaction = require('../models/Transaction');
const logger = require('../config/logger');

const DATA_RETENTION_DAYS = parseInt(process.env.DATA_RETENTION_DAYS) || 730;
const INACTIVE_USER_DAYS = parseInt(process.env.INACTIVE_USER_DAYS) || 365;
const ARCHIVED_APPLICATION_DAYS = parseInt(process.env.ARCHIVED_APPLICATION_DAYS) || 180;
const LOGIN_HISTORY_DAYS = parseInt(process.env.LOGIN_HISTORY_DAYS) || 90;
const CLEANUP_SCHEDULE_HOUR = parseInt(process.env.CLEANUP_SCHEDULE_HOUR) || 2;

const cleanupOldLoginHistory = async () => {
  try {
    const cutoffDate = new Date(Date.now() - LOGIN_HISTORY_DAYS * 24 * 60 * 60 * 1000);
    const result = await User.updateMany(
      { 'loginHistory.timestamp': { $lt: cutoffDate } },
      { $pull: { loginHistory: { timestamp: { $lt: cutoffDate } } } }
    );
    logger.info(`Cleaned up old login history: ${result.modifiedCount} users updated`);
    return result.modifiedCount;
  } catch (error) {
    logger.error('Error cleaning up login history:', error);
    throw error;
  }
};

const cleanupArchivedApplications = async () => {
  try {
    const cutoffDate = new Date(Date.now() - ARCHIVED_APPLICATION_DAYS * 24 * 60 * 60 * 1000);
    const result = await Application.deleteMany({
      isArchived: true,
      archivedAt: { $lt: cutoffDate }
    });
    logger.info(`Deleted old archived applications: ${result.deletedCount} applications`);
    return result.deletedCount;
  } catch (error) {
    logger.error('Error cleaning up archived applications:', error);
    throw error;
  }
};

const cleanupInactiveUnverifiedUsers = async () => {
  try {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: cutoffDate },
      role: 'student'
    });
    logger.info(`Deleted unverified inactive users: ${result.deletedCount} users`);
    return result.deletedCount;
  } catch (error) {
    logger.error('Error cleaning up inactive users:', error);
    throw error;
  }
};

const cleanupExpiredPasswordResetTokens = async () => {
  try {
    const result = await User.updateMany(
      { resetPasswordExpires: { $lt: new Date() } },
      { $unset: { resetPasswordToken: '', resetPasswordExpires: '' } }
    );
    logger.info(`Cleaned up expired password reset tokens: ${result.modifiedCount} users`);
    return result.modifiedCount;
  } catch (error) {
    logger.error('Error cleaning up password reset tokens:', error);
    throw error;
  }
};

const cleanupOldTransactions = async () => {
  try {
    const cutoffDate = new Date(Date.now() - DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const result = await Transaction.updateMany(
      { 
        createdAt: { $lt: cutoffDate },
        anonymized: { $ne: true }
      },
      { 
        $set: { 
          anonymized: true,
          anonymizedAt: new Date()
        }
      }
    );
    logger.info(`Anonymized old transactions: ${result.modifiedCount} transactions`);
    return result.modifiedCount;
  } catch (error) {
    logger.error('Error anonymizing old transactions:', error);
    throw error;
  }
};

const runDataRetentionCleanup = async () => {
  logger.info('Starting data retention cleanup...');
  const startTime = Date.now();
  
  try {
    const results = {
      loginHistory: await cleanupOldLoginHistory(),
      archivedApplications: await cleanupArchivedApplications(),
      inactiveUsers: await cleanupInactiveUnverifiedUsers(),
      passwordTokens: await cleanupExpiredPasswordResetTokens(),
      transactions: await cleanupOldTransactions()
    };
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info('Data retention cleanup completed', { duration: `${duration}s`, results });
    return results;
  } catch (error) {
    logger.error('Data retention cleanup failed:', error);
    throw error;
  }
};

const scheduleDataRetentionCleanup = () => {
  const schedule = `0 ${CLEANUP_SCHEDULE_HOUR} * * *`;
  cron.schedule(schedule, async () => {
    logger.info('Scheduled data retention cleanup triggered');
    await runDataRetentionCleanup();
  });
  logger.info(`Data retention cleanup scheduled: Daily at ${CLEANUP_SCHEDULE_HOUR}:00`);
};

module.exports = {
  runDataRetentionCleanup,
  scheduleDataRetentionCleanup,
  cleanupOldLoginHistory,
  cleanupArchivedApplications,
  cleanupInactiveUnverifiedUsers,
  cleanupExpiredPasswordResetTokens,
  cleanupOldTransactions
};
