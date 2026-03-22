const test = require('node:test');
const { before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
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
  process.env.ADMIN_COMMISSION_PERCENT = '3';
  process.env.PAYSTACK_SECRET_KEY = 'sk_test_integration_key';
  process.env.VISITOR_TRACKING_ENABLED = 'false';

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

test('student registration requires verification before login and succeeds after verification', async () => {
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

  assert.equal(registrationResponse.body.verificationRequired, true);
  assert.equal(registrationResponse.body.email, registrationPayload.email);
  assert.equal(sentEmails.length, 1);

  const registeredUser = await User.findOne({ email: registrationPayload.email });
  assert.ok(registeredUser);
  assert.equal(registeredUser.isVerified, false);
  assert.equal(registeredUser.accountStatus, 'pending_verification');
  assert.ok(registeredUser.verificationToken);

  const blockedLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: registrationPayload.email, password: registrationPayload.password })
    .expect(403);

  assert.equal(blockedLogin.body.verificationRequired, true);

  const verifyResponse = await request(app)
    .get(`/api/auth/verify-email/${registeredUser.verificationToken}`)
    .expect(200);

  assert.match(verifyResponse.body.message, /verified successfully/i);

  const verifiedUser = await User.findById(registeredUser._id);
  assert.equal(verifiedUser.isVerified, true);
  assert.equal(verifiedUser.accountStatus, 'active');
  assert.equal(verifiedUser.verificationToken, undefined);

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .set('User-Agent', 'Integration Test Browser')
    .send({ email: registrationPayload.email, password: registrationPayload.password })
    .expect(200);

  assert.ok(loginResponse.body.token);
  assert.equal(loginResponse.body.user.email, registrationPayload.email);
  assert.equal(loginResponse.body.user.isVerified, true);

  const loggedInUser = await User.findById(registeredUser._id);
  assert.equal(loggedInUser.loginHistory.length, 1);
  assert.equal(loggedInUser.failedLoginAttempts, 0);
});

test('legacy active student accounts can log in while pending verification accounts stay blocked', async () => {
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

  assert.ok(legacyLogin.body.token);
  assert.equal(legacyLogin.body.user.email, 'legacy.student@example.com');

  const healedStudent = await User.findById(legacyStudent._id);
  assert.equal(healedStudent.isVerified, true);

  const pendingLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'pending.student@example.com', password })
    .expect(403);

  assert.equal(pendingLogin.body.verificationRequired, true);
  assert.match(pendingLogin.body.message, /verify your email/i);
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
