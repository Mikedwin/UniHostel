const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getExpectedTurnstileHostname,
  isTurnstileEnabled,
  verifyTurnstileToken
} = require('../utils/turnstile');

test('isTurnstileEnabled follows the env flag', () => {
  const previousTurnstileEnabled = process.env.TURNSTILE_ENABLED;

  process.env.TURNSTILE_ENABLED = 'false';
  assert.equal(isTurnstileEnabled(), false);

  process.env.TURNSTILE_ENABLED = 'true';
  assert.equal(isTurnstileEnabled(), true);

  process.env.TURNSTILE_ENABLED = previousTurnstileEnabled;
});

test('getExpectedTurnstileHostname derives production hostname from FRONTEND_URL when not explicitly set', () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousFrontendUrl = process.env.FRONTEND_URL;
  const previousExpectedHostname = process.env.TURNSTILE_EXPECTED_HOSTNAME;

  process.env.NODE_ENV = 'production';
  process.env.FRONTEND_URL = 'https://uni-hostel-two.vercel.app';
  delete process.env.TURNSTILE_EXPECTED_HOSTNAME;

  assert.equal(getExpectedTurnstileHostname(), 'uni-hostel-two.vercel.app');

  process.env.NODE_ENV = previousNodeEnv;
  process.env.FRONTEND_URL = previousFrontendUrl;
  process.env.TURNSTILE_EXPECTED_HOSTNAME = previousExpectedHostname;
});

test('verifyTurnstileToken validates returned action and hostname when enabled', async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousTurnstileEnabled = process.env.TURNSTILE_ENABLED;
  const previousTurnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  const previousExpectedHostname = process.env.TURNSTILE_EXPECTED_HOSTNAME;
  const originalFetch = global.fetch;

  process.env.NODE_ENV = 'test';
  process.env.TURNSTILE_ENABLED = 'true';
  process.env.TURNSTILE_SECRET_KEY = 'turnstile-secret';
  process.env.TURNSTILE_EXPECTED_HOSTNAME = 'localhost';

  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      success: true,
      action: 'login',
      hostname: 'localhost'
    })
  });

  const validResponse = await verifyTurnstileToken({
    token: 'turnstile-token',
    remoteIp: '127.0.0.1',
    expectedAction: 'login'
  });

  assert.equal(validResponse.success, true);

  const invalidActionResponse = await verifyTurnstileToken({
    token: 'turnstile-token',
    remoteIp: '127.0.0.1',
    expectedAction: 'register'
  });

  assert.equal(invalidActionResponse.success, false);
  assert.match(invalidActionResponse.message, /security verification failed/i);

  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      success: true,
      action: 'login',
      hostname: 'unexpected-host.example'
    })
  });

  const invalidHostnameResponse = await verifyTurnstileToken({
    token: 'turnstile-token',
    remoteIp: '127.0.0.1',
    expectedAction: 'login'
  });

  assert.equal(invalidHostnameResponse.success, false);
  assert.match(invalidHostnameResponse.message, /security verification failed/i);

  global.fetch = originalFetch;
  process.env.NODE_ENV = previousNodeEnv;
  process.env.TURNSTILE_ENABLED = previousTurnstileEnabled;
  process.env.TURNSTILE_SECRET_KEY = previousTurnstileSecret;
  process.env.TURNSTILE_EXPECTED_HOSTNAME = previousExpectedHostname;
});
