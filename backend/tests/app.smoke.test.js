const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-with-at-least-thirty-two-characters';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/unihostel-test';
process.env.TURNSTILE_ENABLED = 'false';
process.env.TURNSTILE_SECRET_KEY = '';
process.env.TURNSTILE_EXPECTED_HOSTNAME = '';

const { app, shouldExposeApiDocs } = require('../server');

test('GET / returns API metadata', async () => {
  const response = await request(app)
    .get('/')
    .expect(200);

  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.documentation, '/api-docs');
});

test('shouldExposeApiDocs disables docs in production unless explicitly enabled', () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDocsFlag = process.env.ENABLE_API_DOCS_IN_PRODUCTION;

  process.env.NODE_ENV = 'production';
  delete process.env.ENABLE_API_DOCS_IN_PRODUCTION;
  assert.equal(shouldExposeApiDocs(), false);

  process.env.ENABLE_API_DOCS_IN_PRODUCTION = 'true';
  assert.equal(shouldExposeApiDocs(), true);

  process.env.NODE_ENV = previousNodeEnv;

  if (typeof previousDocsFlag === 'undefined') {
    delete process.env.ENABLE_API_DOCS_IN_PRODUCTION;
  } else {
    process.env.ENABLE_API_DOCS_IN_PRODUCTION = previousDocsFlag;
  }
});

test('GET /api-docs returns 404 in production when docs are disabled', async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDocsFlag = process.env.ENABLE_API_DOCS_IN_PRODUCTION;

  process.env.NODE_ENV = 'production';
  delete process.env.ENABLE_API_DOCS_IN_PRODUCTION;

  const response = await request(app)
    .get('/api-docs')
    .expect(404);

  assert.equal(response.body.error, 'Not found');

  process.env.NODE_ENV = previousNodeEnv;

  if (typeof previousDocsFlag === 'undefined') {
    delete process.env.ENABLE_API_DOCS_IN_PRODUCTION;
  } else {
    process.env.ENABLE_API_DOCS_IN_PRODUCTION = previousDocsFlag;
  }
});

test('CORS allows the configured frontend origin and blocks unrelated preview origins', async () => {
  const allowedOrigin = 'https://uni-hostel-two.vercel.app';
  const allowedResponse = await request(app)
    .get('/')
    .set('Origin', allowedOrigin)
    .expect(200);

  assert.equal(allowedResponse.headers['access-control-allow-origin'], allowedOrigin);
  assert.equal(allowedResponse.headers['access-control-allow-credentials'], 'true');

  const blockedResponse = await request(app)
    .get('/')
    .set('Origin', 'https://preview-attacker.vercel.app')
    .expect(200);

  assert.equal(blockedResponse.headers['access-control-allow-origin'], undefined);
});

test('GET /api/health reports unhealthy when runtime has not started the database connection', async () => {
  const response = await request(app)
    .get('/api/health')
    .expect(503);

  assert.equal(response.body.status, 'unhealthy');
  assert.equal(response.body.database.connected, false);
});

test('GET /api/hostels fails fast with 503 when the database is unavailable', async () => {
  const response = await request(app)
    .get('/api/hostels')
    .expect(503);

  assert.equal(response.body.retryAfter, 5);
});

test('POST /api/payment/initialize requires authentication', async () => {
  const response = await request(app)
    .post('/api/payment/initialize')
    .send({ applicationId: '507f1f77bcf86cd799439011' })
    .expect(401);

  assert.match(response.body.message, /authentication token|access denied/i);
});

test('POST /api/payment/status/batch requires authentication', async () => {
  const response = await request(app)
    .post('/api/payment/status/batch')
    .send({ applicationIds: ['507f1f77bcf86cd799439011'] })
    .expect(401);

  assert.match(response.body.message, /authentication token|access denied/i);
});

test('POST /api/visitors/track accepts pageview payloads without authentication', async () => {
  const response = await request(app)
    .post('/api/visitors/track')
    .set('User-Agent', 'Node Test Browser')
    .send({ path: '/support' })
    .expect(202);

  assert.equal(typeof response.body.tracked, 'boolean');
});

test('GET /api/admin/analytics/locations requires authentication', async () => {
  const response = await request(app)
    .get('/api/admin/analytics/locations')
    .expect(401);

  assert.match(response.body.message, /authentication token|access denied/i);
});
