const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getEmailDeliveryStatus,
  normalizeEmailPassword,
  normalizeEmailUser
} = require('../utils/emailService');

test('normalizeEmailUser trims surrounding whitespace', () => {
  assert.equal(normalizeEmailUser('  admin@example.com  '), 'admin@example.com');
});

test('normalizeEmailPassword removes whitespace from grouped app passwords', () => {
  assert.equal(normalizeEmailPassword('abcd efgh ijkl mnop'), 'abcdefghijklmnop');
});

test('getEmailDeliveryStatus reports placeholder credentials as not configured', async () => {
  const previousEmailUser = process.env.EMAIL_USER;
  const previousEmailPassword = process.env.EMAIL_PASSWORD;

  process.env.EMAIL_USER = 'admin@example.com';
  process.env.EMAIL_PASSWORD = 'your-gmail-app-password-here';

  const status = await getEmailDeliveryStatus();
  assert.equal(status.configured, false);
  assert.equal(status.verified, false);
  assert.equal(status.passwordLooksLikeAppPassword, false);

  process.env.EMAIL_USER = previousEmailUser;
  process.env.EMAIL_PASSWORD = previousEmailPassword;
});
