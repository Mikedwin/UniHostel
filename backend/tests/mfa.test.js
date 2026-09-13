const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createPrivilegedMfaChallenge,
  getPrivilegedMfaCodeExpiryMinutes,
  requiresPrivilegedMfa,
  verifyPrivilegedMfaCode
} = require('../utils/mfa');

test('requiresPrivilegedMfa only applies to manager and admin accounts when enabled', () => {
  const previousEnabled = process.env.PRIVILEGED_MFA_ENABLED;

  process.env.PRIVILEGED_MFA_ENABLED = 'true';
  assert.equal(requiresPrivilegedMfa({ role: 'manager' }), true);
  assert.equal(requiresPrivilegedMfa({ role: 'admin' }), true);
  assert.equal(requiresPrivilegedMfa({ role: 'student' }), false);

  process.env.PRIVILEGED_MFA_ENABLED = 'false';
  assert.equal(requiresPrivilegedMfa({ role: 'manager' }), false);

  process.env.PRIVILEGED_MFA_ENABLED = previousEnabled;
});

test('createPrivilegedMfaChallenge creates a reusable challenge token and verifiable code', async () => {
  const previousExpiry = process.env.PRIVILEGED_MFA_CODE_EXPIRY_MINUTES;
  process.env.PRIVILEGED_MFA_CODE_EXPIRY_MINUTES = '10';

  const challenge = await createPrivilegedMfaChallenge();
  assert.match(challenge.challengeToken, /^[a-f0-9]{64}$/);
  assert.ok(challenge.state.challengeTokenHash);
  assert.ok(challenge.state.codeHash);
  assert.equal(challenge.state.failedAttempts, 0);

  const remainingMs = new Date(challenge.state.expiresAt).getTime() - Date.now();
  assert.ok(remainingMs > 8 * 60 * 1000);
  assert.ok(remainingMs <= getPrivilegedMfaCodeExpiryMinutes() * 60 * 1000);

  process.env.PRIVILEGED_MFA_CODE_EXPIRY_MINUTES = previousExpiry;
});

test('verifyPrivilegedMfaCode accepts the correct code and clears the pending challenge', async () => {
  const challenge = await createPrivilegedMfaChallenge();
  const user = {
    role: 'manager',
    privilegedMfa: { ...challenge.state }
  };

  const result = await verifyPrivilegedMfaCode(user, challenge.code);
  assert.equal(result.success, true);
  assert.equal(user.privilegedMfa, undefined);
});

test('verifyPrivilegedMfaCode tracks invalid attempts and eventually resets the login', async () => {
  const previousMaxAttempts = process.env.PRIVILEGED_MFA_MAX_ATTEMPTS;
  process.env.PRIVILEGED_MFA_MAX_ATTEMPTS = '2';

  const challenge = await createPrivilegedMfaChallenge();
  const user = {
    role: 'admin',
    privilegedMfa: { ...challenge.state }
  };

  const firstFailure = await verifyPrivilegedMfaCode(user, '000000');
  assert.equal(firstFailure.success, false);
  assert.equal(firstFailure.resetLogin, undefined);
  assert.equal(user.privilegedMfa.failedAttempts, 1);

  const secondFailure = await verifyPrivilegedMfaCode(user, '111111');
  assert.equal(secondFailure.success, false);
  assert.equal(secondFailure.resetLogin, true);
  assert.equal(secondFailure.status, 429);
  assert.equal(user.privilegedMfa, undefined);

  process.env.PRIVILEGED_MFA_MAX_ATTEMPTS = previousMaxAttempts;
});
