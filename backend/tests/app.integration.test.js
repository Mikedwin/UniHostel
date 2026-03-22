const test = require('node:test');
const { before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

const TEST_JWT_SECRET = 'integration-test-jwt-secret-with-at-least-thirty-two-characters';

let mongoServer;
let app;
let connectDB;
let User;
let Hostel;
let Application;
let cache;
const sentEmails = [];

const createJwt = (user) => jwt.sign(
  { id: user._id.toString(), role: user.role, iat: Math.floor(Date.now() / 1000) },
  process.env.JWT_SECRET,
  { expiresIn: '30d', algorithm: 'HS256' }
);

const getCookieHeader = (setCookieHeaders = [], cookieName = 'unihostel_auth') => (
  setCookieHeaders.find((header) => header.startsWith(`${cookieName}=`))
);

const createUser = async ({
  name,
  email,
  role = 'student',
  password = 'Password123!',
  isVerified = true,
  accountStatus = 'active',
  phone = '0200000000'
} = {}) => {
  const hashedPassword = await bcrypt.hash(password, 12);
  return User.create({
    name,
    email,
    password: hashedPassword,
    role,
    isVerified,
    accountStatus,
    phone,
    tosAccepted: true,
    tosAcceptedAt: new Date(),
    privacyPolicyAccepted: true,
    privacyPolicyAcceptedAt: new Date()
  });
};

const createHostel = async (managerId, overrides = {}) => Hostel.create({
  managerId,
  name: 'Maple Lodge',
  location: 'Kumasi',
  description: 'Quiet hostel close to campus.',
  facilities: ['WiFi', 'Study Area'],
  hostelViewImage: 'https://example.com/hostel.jpg',
  roomTypes: [
    {
      type: '2 in a Room',
      price: 1200,
      gender: 'Not Specified',
      totalCapacity: 10,
      occupiedCapacity: 2,
      available: true
    }
  ],
  isAvailable: true,
  isActive: true,
  isDeleted: false,
  ...overrides
});

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  process.env.FRONTEND_URL = 'http://localhost:3000';
  process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/placeholder';
  process.env.EMAIL_USER = 'test@example.com';
  process.env.EMAIL_PASSWORD = 'integration-test-app-password';
  process.env.MAX_LOGIN_ATTEMPTS = '5';
  process.env.LOCKOUT_DURATION_MINUTES = '30';
  process.env.AUTH_RATE_LIMIT_MAX = '100';
  process.env.ADMIN_COMMISSION_PERCENT = '3';
  process.env.PAYSTACK_SECRET_KEY = 'sk_test_integration_key';
  process.env.VISITOR_TRACKING_ENABLED = 'false';
  process.env.TURNSTILE_ENABLED = 'false';
  process.env.TURNSTILE_SECRET_KEY = '';
  process.env.TURNSTILE_EXPECTED_HOSTNAME = '';

  nodemailer.createTransport = () => ({
    sendMail: async (message) => {
      sentEmails.push(message);
      return { messageId: `test-${sentEmails.length}` };
    }
  });

  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'unihostel-integration'
    }
  });

  process.env.MONGO_URI = mongoServer.getUri();

  ({ app, connectDB } = require('../server'));
  User = require('../models/User');
  Hostel = require('../models/Hostel');
  Application = require('../models/Application');
  cache = require('../services/cache');

  await connectDB();
});

beforeEach(async () => {
  sentEmails.length = 0;
  cache.flush();

  const collections = Object.values(mongoose.connection.collections);
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

after(async () => {
  cache.flush();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
});

test('student registration creates an active account that can sign in immediately', async () => {
  const registrationPayload = {
    name: 'Ama Student',
    email: 'ama.student@example.com',
    password: 'Password123!',
    tosAccepted: true,
    privacyPolicyAccepted: true
  };

  const registrationResponse = await request(app)
    .post('/api/auth/register')
    .send(registrationPayload)
    .expect(201);

  assert.equal(registrationResponse.body.email, registrationPayload.email);
  assert.match(registrationResponse.body.message, /now sign in/i);
  assert.equal(sentEmails.length, 0);

  const registeredUser = await User.findOne({ email: registrationPayload.email });
  assert.ok(registeredUser);
  assert.equal(registeredUser.isVerified, true);
  assert.equal(registeredUser.accountStatus, 'active');

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .set('User-Agent', 'Integration Test Browser')
    .send({ email: registrationPayload.email, password: registrationPayload.password })
    .expect(200);

  assert.ok(loginResponse.body.csrfToken);
  assert.equal(loginResponse.body.user.email, registrationPayload.email);
  assert.equal(loginResponse.body.user.isVerified, true);

  const loggedInUser = await User.findById(registeredUser._id);
  assert.equal(loggedInUser.loginHistory.length, 1);
  assert.equal(loggedInUser.failedLoginAttempts, 0);
});

test('legacy student accounts are normalized on login even if they were previously unverified', async () => {
  const password = 'Password123!';

  const legacyStudent = await createUser({
    name: 'Legacy Student',
    email: 'legacy.student@example.com',
    role: 'student',
    password,
    isVerified: false,
    accountStatus: 'active'
  });

  await createUser({
    name: 'Pending Student',
    email: 'pending.student@example.com',
    role: 'student',
    password,
    isVerified: false,
    accountStatus: 'pending_verification'
  });

  const legacyLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'legacy.student@example.com', password })
    .expect(200);

  assert.ok(legacyLogin.body.csrfToken);
  assert.equal(legacyLogin.body.user.email, 'legacy.student@example.com');

  const healedStudent = await User.findById(legacyStudent._id);
  assert.equal(healedStudent.isVerified, true);

  const pendingLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'pending.student@example.com', password })
    .expect(200);

  assert.ok(pendingLogin.body.csrfToken);

  const activatedPendingStudent = await User.findOne({ email: 'pending.student@example.com' });
  assert.equal(activatedPendingStudent.isVerified, true);
  assert.equal(activatedPendingStudent.accountStatus, 'active');
});

test('login uses generic failure responses for invalid, locked, and blocked accounts', async () => {
  const email = 'generic.student@example.com';
  const password = 'Password123!';

  const user = await createUser({
    name: 'Generic Student',
    email,
    role: 'student',
    password
  });

  const unknownUserResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'unknown.student@example.com', password: 'WrongPassword123!' })
    .expect(400);

  assert.equal(unknownUserResponse.body.message, 'Invalid email or password');
  assert.equal(unknownUserResponse.body.attemptsLeft, undefined);
  assert.equal(unknownUserResponse.body.lockedUntil, undefined);

  const wrongPasswordResponse = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'WrongPassword123!' })
    .expect(400);

  assert.equal(wrongPasswordResponse.body.message, 'Invalid email or password');
  assert.equal(wrongPasswordResponse.body.attemptsLeft, undefined);
  assert.equal(wrongPasswordResponse.body.lockedUntil, undefined);

  const updatedUser = await User.findById(user._id);
  assert.equal(updatedUser.failedLoginAttempts, 1);

  updatedUser.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
  await updatedUser.save();

  const lockedResponse = await request(app)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(400);

  assert.equal(lockedResponse.body.message, 'Invalid email or password');
  assert.equal(lockedResponse.body.lockedUntil, undefined);

  updatedUser.accountLockedUntil = null;
  updatedUser.accountStatus = 'suspended';
  await updatedUser.save();

  const suspendedResponse = await request(app)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(400);

  assert.equal(suspendedResponse.body.message, 'Invalid email or password');
});

test('login sets an httpOnly auth cookie and cookie-authenticated writes require a CSRF token', async () => {
  const email = 'cookie.student@example.com';
  const password = 'Password123!';
  const newPassword = 'FreshPassword123!';

  const user = await createUser({
    name: 'Cookie Student',
    email,
    role: 'student',
    password
  });

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);

  const rawAuthCookie = getCookieHeader(loginResponse.headers['set-cookie']);
  assert.ok(rawAuthCookie, 'login should set the auth cookie');
  assert.match(rawAuthCookie, /HttpOnly/i);
  assert.ok(loginResponse.body.csrfToken);

  const authCookie = rawAuthCookie.split(';')[0];

  const sessionResponse = await request(app)
    .get('/api/auth/session')
    .set('Cookie', authCookie)
    .expect(200);

  assert.equal(sessionResponse.body.user.email, email);
  assert.ok(sessionResponse.body.csrfToken);

  const migratedSessionResponse = await request(app)
    .get('/api/auth/session')
    .set('Authorization', `Bearer ${createJwt(user)}`)
    .expect(200);

  assert.ok(getCookieHeader(migratedSessionResponse.headers['set-cookie']));

  await request(app)
    .post('/api/auth/change-password')
    .set('Cookie', authCookie)
    .send({ currentPassword: password, newPassword })
    .expect(403);

  const passwordChangeResponse = await request(app)
    .post('/api/auth/change-password')
    .set('Cookie', authCookie)
    .set('X-CSRF-Token', loginResponse.body.csrfToken)
    .send({ currentPassword: password, newPassword })
    .expect(200);

  assert.match(passwordChangeResponse.body.message, /password changed successfully/i);
});

test('forgot password stores a hashed reset token and accepts the emailed token for password reset', async () => {
  const originalPassword = 'Password123!';
  const newPassword = 'NewSecurePass123!';
  const email = 'reset.student@example.com';

  const user = await createUser({
    name: 'Reset Student',
    email,
    role: 'student',
    password: originalPassword
  });

  const forgotPasswordResponse = await request(app)
    .post('/api/auth/forgot-password')
    .send({ email })
    .expect(200);

  assert.match(forgotPasswordResponse.body.message, /if an account exists/i);
  assert.equal(sentEmails.length, 1);

  const resetEmail = sentEmails[0];
  const resetLinkMatch = resetEmail.html.match(/\/reset-password\/([a-f0-9]{64})/i);
  assert.ok(resetLinkMatch, 'reset email should include a raw reset token');

  const rawResetToken = resetLinkMatch[1];
  const hashedResetToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');

  const updatedUser = await User.findById(user._id);
  assert.equal(updatedUser.resetPasswordToken, hashedResetToken);
  assert.notEqual(updatedUser.resetPasswordToken, rawResetToken);
  assert.ok(updatedUser.resetPasswordExpires);

  const resetResponse = await request(app)
    .post(`/api/auth/reset-password/${rawResetToken}`)
    .send({ password: newPassword })
    .expect(200);

  assert.match(resetResponse.body.message, /password reset successful/i);

  const resetUser = await User.findById(user._id);
  assert.equal(resetUser.resetPasswordToken, undefined);
  assert.equal(resetUser.passwordResetRequired, false);
  assert.equal(resetUser.temporaryPassword, undefined);

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email, password: newPassword })
    .expect(200);

  assert.ok(loginResponse.body.csrfToken);
});

test('turnstile can protect register, login, and forgot-password flows when enabled', async () => {
  const previousTurnstileEnabled = process.env.TURNSTILE_ENABLED;
  const previousTurnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  const previousTurnstileHostname = process.env.TURNSTILE_EXPECTED_HOSTNAME;
  const originalFetch = global.fetch;

  process.env.TURNSTILE_ENABLED = 'true';
  process.env.TURNSTILE_SECRET_KEY = 'turnstile-secret-key';
  process.env.TURNSTILE_EXPECTED_HOSTNAME = 'localhost';

  global.fetch = async (_url, options = {}) => {
    const params = new URLSearchParams(options.body);
    const responseToken = params.get('response');

    const actionByToken = {
      'register-token': 'register',
      'login-token': 'login',
      'forgot-token': 'forgot_password'
    };

    return {
      ok: true,
      json: async () => ({
        success: true,
        action: actionByToken[responseToken],
        hostname: 'localhost'
      })
    };
  };

  const missingRegisterToken = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Turnstile Student',
      email: 'turnstile.student@example.com',
      password: 'Password123!',
      tosAccepted: true,
      privacyPolicyAccepted: true
    })
    .expect(400);

  assert.match(missingRegisterToken.body.message, /security check/i);

  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Turnstile Student',
      email: 'turnstile.student@example.com',
      password: 'Password123!',
      tosAccepted: true,
      privacyPolicyAccepted: true,
      turnstileToken: 'register-token'
    })
    .expect(201);

  assert.match(registerResponse.body.message, /now sign in/i);

  const missingLoginToken = await request(app)
    .post('/api/auth/login')
    .send({ email: 'turnstile.student@example.com', password: 'Password123!' })
    .expect(400);

  assert.match(missingLoginToken.body.message, /security check/i);

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'turnstile.student@example.com',
      password: 'Password123!',
      turnstileToken: 'login-token'
    })
    .expect(200);

  assert.ok(loginResponse.body.csrfToken);

  const missingForgotToken = await request(app)
    .post('/api/auth/forgot-password')
    .send({ email: 'turnstile.student@example.com' })
    .expect(400);

  assert.match(missingForgotToken.body.message, /security check/i);

  const forgotPasswordResponse = await request(app)
    .post('/api/auth/forgot-password')
    .send({
      email: 'turnstile.student@example.com',
      turnstileToken: 'forgot-token'
    })
    .expect(200);

  assert.match(forgotPasswordResponse.body.message, /if an account exists/i);

  global.fetch = originalFetch;
  process.env.TURNSTILE_ENABLED = previousTurnstileEnabled;
  process.env.TURNSTILE_SECRET_KEY = previousTurnstileSecret;
  process.env.TURNSTILE_EXPECTED_HOSTNAME = previousTurnstileHostname;
});

test('legacy security-question password reset endpoints are disabled', async () => {
  const resetVerifyResponse = await request(app)
    .post('/api/auth/reset-verify')
    .send({ email: 'anyone@example.com' })
    .expect(410);

  assert.match(resetVerifyResponse.body.message, /no longer available/i);

  const resetWithSecurityResponse = await request(app)
    .post('/api/auth/reset-with-security')
    .send({ userId: new mongoose.Types.ObjectId().toString(), securityAnswer: 'guess', newPassword: 'Password123!' })
    .expect(410);

  assert.match(resetWithSecurityResponse.body.message, /forgot password/i);
});

test('public hostel listing returns only active available hostels with manager names', async () => {
  const manager = await createUser({
    name: 'Manager One',
    email: 'manager.one@example.com',
    role: 'manager'
  });

  await createHostel(manager._id, {
    name: 'Maple Lodge',
    location: 'Kumasi'
  });

  await createHostel(manager._id, {
    name: 'Hidden Hostel',
    location: 'Accra',
    isDeleted: true
  });

  await createHostel(manager._id, {
    name: 'Closed Hostel',
    location: 'Cape Coast',
    isAvailable: false
  });

  const response = await request(app)
    .get('/api/hostels?search=Maple')
    .expect(200);

  assert.equal(response.body.length, 1);
  assert.equal(response.body[0].name, 'Maple Lodge');
  assert.equal(response.body[0].managerId.name, 'Manager One');
  assert.equal(response.body[0].location, 'Kumasi');
});

test('student application flow supports create, active listing, archive, and archived listing', async () => {
  const manager = await createUser({
    name: 'Manager Two',
    email: 'manager.two@example.com',
    role: 'manager'
  });
  const student = await createUser({
    name: 'Kojo Student',
    email: 'kojo.student@example.com',
    role: 'student'
  });
  const hostel = await createHostel(manager._id, {
    name: 'Unity Hostel'
  });

  const studentToken = createJwt(student);

  const applicationResponse = await request(app)
    .post('/api/applications')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      hostelId: hostel._id.toString(),
      roomType: '2 in a Room',
      semester: 'First Semester',
      studentName: 'Kojo Student',
      contactNumber: '0551234567'
    })
    .expect(201);

  assert.equal(applicationResponse.body.status, 'pending');
  assert.equal(applicationResponse.body.hostelFee, 1200);
  assert.equal(applicationResponse.body.adminCommission, 36);
  assert.equal(applicationResponse.body.totalAmount, 1236);

  const activeApplications = await request(app)
    .get('/api/applications/student')
    .set('Authorization', `Bearer ${studentToken}`)
    .expect(200);

  assert.equal(activeApplications.body.length, 1);
  assert.equal(activeApplications.body[0].hostelId.name, 'Unity Hostel');
  assert.equal(activeApplications.body[0].isArchived, false);

  const applicationId = applicationResponse.body._id;

  const archiveResponse = await request(app)
    .patch(`/api/applications/${applicationId}/archive`)
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ archive: true })
    .expect(200);

  assert.match(archiveResponse.body.message, /archived/i);
  assert.equal(archiveResponse.body.application.isArchived, true);

  const archivedApplications = await request(app)
    .get('/api/applications/student?archived=true')
    .set('Authorization', `Bearer ${studentToken}`)
    .expect(200);

  assert.equal(archivedApplications.body.length, 1);
  assert.equal(archivedApplications.body[0]._id, applicationId);
  assert.equal(archivedApplications.body[0].isArchived, true);
});

test('payment batch status returns the student statuses and blocks access to another student application', async () => {
  const manager = await createUser({
    name: 'Manager Three',
    email: 'manager.three@example.com',
    role: 'manager'
  });
  const student = await createUser({
    name: 'Efua Student',
    email: 'efua.student@example.com',
    role: 'student'
  });
  const otherStudent = await createUser({
    name: 'Other Student',
    email: 'other.student@example.com',
    role: 'student'
  });
  const hostel = await createHostel(manager._id, {
    name: 'Scholars Hostel'
  });

  const ownedApplication = await Application.create({
    hostelId: hostel._id,
    studentId: student._id,
    roomType: '2 in a Room',
    semester: 'First Semester',
    studentName: 'Efua Student',
    contactNumber: '0240000000',
    status: 'approved_for_payment',
    paymentStatus: 'pending',
    hostelFee: 1200,
    adminCommission: 36,
    totalAmount: 1236
  });

  const foreignApplication = await Application.create({
    hostelId: hostel._id,
    studentId: otherStudent._id,
    roomType: '2 in a Room',
    semester: 'Second Semester',
    studentName: 'Other Student',
    contactNumber: '0201111111',
    status: 'approved_for_payment',
    paymentStatus: 'pending',
    hostelFee: 1200,
    adminCommission: 36,
    totalAmount: 1236
  });

  const studentToken = createJwt(student);

  const ownedStatusResponse = await request(app)
    .post('/api/payment/status/batch')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ applicationIds: [ownedApplication._id.toString()] })
    .expect(200);

  assert.equal(ownedStatusResponse.body.statuses.length, 1);
  assert.equal(ownedStatusResponse.body.statuses[0].applicationId, ownedApplication._id.toString());
  assert.equal(ownedStatusResponse.body.statuses[0].status, 'approved_for_payment');
  assert.equal(ownedStatusResponse.body.statuses[0].paymentStatus, 'pending');
  assert.equal(ownedStatusResponse.body.statuses[0].canPay, true);

  const unauthorizedResponse = await request(app)
    .post('/api/payment/status/batch')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ applicationIds: [foreignApplication._id.toString()] })
    .expect(403);

  assert.match(unauthorizedResponse.body.message, /own payment records/i);
});
