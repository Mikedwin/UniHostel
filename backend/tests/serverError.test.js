const test = require('node:test');
const assert = require('node:assert/strict');

const { buildServerErrorPayload, sendServerError } = require('../utils/serverError');

test('buildServerErrorPayload hides internal details in production', () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  const payload = buildServerErrorPayload({
    clientMessage: 'Payment verification failed',
    field: 'message',
    err: new Error('Paystack timeout')
  });

  assert.deepEqual(payload, {
    message: 'Payment verification failed'
  });

  process.env.NODE_ENV = previousNodeEnv;
});

test('buildServerErrorPayload includes development details outside production', () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'test';

  const payload = buildServerErrorPayload({
    clientMessage: 'Payment verification failed',
    field: 'message',
    developmentDetails: { upstream: 'paystack' }
  });

  assert.deepEqual(payload, {
    message: 'Payment verification failed',
    details: { upstream: 'paystack' }
  });

  process.env.NODE_ENV = previousNodeEnv;
});

test('sendServerError keeps log metadata out of the client response', () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  let statusCode;
  let responseBody;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    }
  };

  sendServerError(res, new Error('Database exploded'), {
    clientMessage: 'Internal server error',
    logExtra: {
      url: '/api/demo',
      method: 'GET'
    },
    loggerInstance: {
      error() {}
    }
  });

  assert.equal(statusCode, 500);
  assert.deepEqual(responseBody, {
    error: 'Internal server error'
  });

  process.env.NODE_ENV = previousNodeEnv;
});
