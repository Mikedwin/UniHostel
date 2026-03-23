const nodemailer = require('nodemailer');
const logger = require('../config/logger');

const parseTimeout = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// WARNING: Email credentials must be configured via environment variables
// Never hardcode credentials in this file - use .env file instead
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const connectionTimeout = parseTimeout(process.env.EMAIL_CONNECTION_TIMEOUT_MS, 10000);
  const greetingTimeout = parseTimeout(process.env.EMAIL_GREETING_TIMEOUT_MS, 10000);
  const socketTimeout = parseTimeout(process.env.EMAIL_SOCKET_TIMEOUT_MS, 15000);
  
  // Validate email configuration
  if (!emailUser || !emailPassword || emailPassword === 'your-gmail-app-password-here') {
    logger.warn('Email service not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env file');
    return null;
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    connectionTimeout,
    greetingTimeout,
    socketTimeout,
    auth: {
      user: emailUser,
      pass: emailPassword
    }
  });
};

const sendPasswordResetCodeEmail = async (email, name, resetCode, expiresInMinutes = 10) => {
  const transporter = createTransporter();
  if (!transporter) {
    logger.warn('Email not configured. Reset code delivery skipped', { email });
    return;
  }

  await transporter.sendMail({
    from: `"UniHostel" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your UniHostel Password Reset Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #23817A;">Reset Your Password</h2>
        <p>Hi ${name || 'there'},</p>
        <p>You requested to reset your password for your UniHostel account.</p>
        <p>Enter this code in the reset password screen:</p>
        <div style="margin: 24px 0; padding: 18px; background: #f5f5f5; border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 8px; color: #666; font-size: 14px;">Password Reset Code</p>
          <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #23817A;">${resetCode}</div>
        </div>
        <p style="color: #666; font-size: 14px;">This code expires in ${expiresInMinutes} minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      </div>
    `
  });
};

const sendVerificationEmail = async (email, name, verificationToken) => {
  const transporter = createTransporter();
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  if (!transporter) {
    logger.warn('Email not configured. Verification link:', verificationUrl);
    return false;
  }

  await transporter.sendMail({
    from: `"UniHostel" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - UniHostel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #23817A;">Verify Your Email Address</h2>
        <p>Hi ${name},</p>
        <p>Welcome to UniHostel. Please verify your email address before signing in.</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #23817A; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
        <p>Or copy this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
        <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
      </div>
    `
  });

  return true;
};

const sendPrivilegedMfaCodeEmail = async (email, name, code, expiresInMinutes = 10) => {
  const transporter = createTransporter();

  if (!transporter) {
    throw new Error('Email service is not configured for privileged MFA delivery');
  }

  await transporter.sendMail({
    from: `"UniHostel" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your UniHostel Security Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #23817A;">Security Verification Required</h2>
        <p>Hi ${name},</p>
        <p>Use the security code below to complete your UniHostel sign-in.</p>
        <div style="margin: 24px 0; padding: 18px; background: #f5f5f5; border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 8px; color: #666; font-size: 14px;">Security Code</p>
          <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #23817A;">${code}</div>
        </div>
        <p style="color: #666; font-size: 14px;">This code expires in ${expiresInMinutes} minutes.</p>
        <p style="color: #666; font-size: 14px;">If you did not try to sign in, change your password immediately.</p>
      </div>
    `
  });
};

const sendApplicationSubmittedEmail = async (studentEmail, studentName, hostelName, roomType, semester) => {
  const transporter = createTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from: `"UniHostel" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: 'Application Submitted - UniHostel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #23817A;">Application Submitted Successfully</h2>
        <p>Hi ${studentName},</p>
        <p>Your application has been submitted successfully!</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Hostel:</strong> ${hostelName}<br>
          <strong>Room Type:</strong> ${roomType}<br>
          <strong>Semester:</strong> ${semester}<br>
          <strong>Status:</strong> Pending Manager Review
        </div>
        <p>The hostel manager will review your application. You'll receive an email once they make a decision.</p>
        <p>Track your application status in your <a href="${process.env.FRONTEND_URL}/student-dashboard" style="color: #23817A;">Student Dashboard</a>.</p>
      </div>
    `
  });
};

const sendApplicationApprovedForPaymentEmail = async (studentEmail, studentName, hostelName, roomType, totalAmount) => {
  const transporter = createTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from: `"UniHostel" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: 'Application Approved - Payment Required - UniHostel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #23817A;">🎉 Application Approved!</h2>
        <p>Hi ${studentName},</p>
        <p>Great news! Your application for <strong>${hostelName}</strong> has been approved by the manager.</p>
        <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
          <strong>Hostel:</strong> ${hostelName}<br>
          <strong>Room Type:</strong> ${roomType}<br>
          <strong>Total Amount:</strong> GH₵${totalAmount}
        </div>
        <p><strong>Next Step:</strong> Complete your payment to secure your room.</p>
        <a href="${process.env.FRONTEND_URL}/student-dashboard" style="display: inline-block; padding: 12px 24px; background-color: #23817A; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Pay Now</a>
        <p style="color: #666; font-size: 14px;">Payment must be completed to finalize your booking.</p>
      </div>
    `
  });
};

const sendPaymentSuccessEmail = async (studentEmail, studentName, hostelName, roomType, totalAmount, reference) => {
  const transporter = createTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from: `"UniHostel" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: 'Payment Successful - UniHostel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #23817A;">✅ Payment Received</h2>
        <p>Hi ${studentName},</p>
        <p>Your payment has been processed successfully!</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Hostel:</strong> ${hostelName}<br>
          <strong>Room Type:</strong> ${roomType}<br>
          <strong>Amount Paid:</strong> GH₵${totalAmount}<br>
          <strong>Reference:</strong> ${reference}<br>
          <strong>Status:</strong> Awaiting Final Approval
        </div>
        <p>The manager will now provide final approval and your access code.</p>
        <p>You'll receive another email once your booking is confirmed.</p>
      </div>
    `
  });
};

const sendFinalApprovalEmail = async (studentEmail, studentName, hostelName, roomType, accessCode) => {
  const transporter = createTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from: `"UniHostel" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: 'Booking Confirmed - Access Code - UniHostel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #23817A;">🎉 Booking Confirmed!</h2>
        <p>Hi ${studentName},</p>
        <p>Congratulations! Your booking has been confirmed.</p>
        <div style="background: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
          <strong>Hostel:</strong> ${hostelName}<br>
          <strong>Room Type:</strong> ${roomType}<br><br>
          <div style="background: white; padding: 15px; border-radius: 5px; text-align: center;">
            <strong style="font-size: 18px; color: #23817A;">Your Access Code:</strong><br>
            <span style="font-size: 24px; font-weight: bold; color: #333; letter-spacing: 2px;">${accessCode}</span>
          </div>
        </div>
        <p><strong>Important:</strong> Present this access code when you arrive at the hostel.</p>
        <p>Keep this email safe for your records.</p>
        <p>Welcome to your new home! 🏠</p>
      </div>
    `
  });
};

const sendApplicationRejectedEmail = async (studentEmail, studentName, hostelName, roomType) => {
  const transporter = createTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from: `"UniHostel" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: 'Application Update - UniHostel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #23817A;">Application Update</h2>
        <p>Hi ${studentName},</p>
        <p>Thank you for your interest in <strong>${hostelName}</strong>.</p>
        <p>Unfortunately, your application for the ${roomType} has not been approved at this time.</p>
        <p>Don't worry! There are many other great hostels available.</p>
        <a href="${process.env.FRONTEND_URL}/hostels" style="display: inline-block; padding: 12px 24px; background-color: #23817A; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Browse Other Hostels</a>
      </div>
    `
  });
};

const sendNewApplicationNotificationToManager = async (managerEmail, managerName, studentName, hostelName, roomType) => {
  const transporter = createTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from: `"UniHostel" <${process.env.EMAIL_USER}>`,
    to: managerEmail,
    subject: 'New Application Received - UniHostel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #23817A;">📋 New Application</h2>
        <p>Hi ${managerName},</p>
        <p>You have received a new application for your hostel.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Student:</strong> ${studentName}<br>
          <strong>Hostel:</strong> ${hostelName}<br>
          <strong>Room Type:</strong> ${roomType}
        </div>
        <p>Please review and approve or reject this application.</p>
        <a href="${process.env.FRONTEND_URL}/manager-dashboard" style="display: inline-block; padding: 12px 24px; background-color: #23817A; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Review Application</a>
      </div>
    `
  });
};

module.exports = { 
  sendPrivilegedMfaCodeEmail,
  sendVerificationEmail,
  sendPasswordResetCodeEmail,
  sendApplicationSubmittedEmail,
  sendApplicationApprovedForPaymentEmail,
  sendPaymentSuccessEmail,
  sendFinalApprovalEmail,
  sendApplicationRejectedEmail,
  sendNewApplicationNotificationToManager
};
