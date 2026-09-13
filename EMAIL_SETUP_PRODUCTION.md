# Email Service Setup Guide - Quick Start

## Option 1: Gmail App Password (Recommended - 5 minutes)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the setup process

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "UniHostel Backend"
4. Click "Generate"
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update Environment Variables
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # Remove spaces from app password
```

### Step 4: Test Email Service
```bash
cd backend
node test-emails.js
```

---

## Option 2: SendGrid (Production-Grade - 15 minutes)

### Step 1: Create SendGrid Account
1. Go to https://signup.sendgrid.com/
2. Sign up for free tier (100 emails/day)
3. Verify your email

### Step 2: Create API Key
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name: "UniHostel Production"
4. Permissions: "Full Access"
5. Copy the API key (starts with `SG.`)

### Step 3: Update Email Service Code
Edit `backend/utils/emailService.js`:

```javascript
// Replace nodemailer config with:
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Update send function:
const sendEmail = async (to, subject, html) => {
  const msg = {
    to,
    from: process.env.EMAIL_USER,
    subject,
    html
  };
  await sgMail.send(msg);
};
```

### Step 4: Install SendGrid
```bash
cd backend
npm install @sendgrid/mail
```

### Step 5: Update Environment Variables
```env
SENDGRID_API_KEY=SG.your_api_key_here
EMAIL_USER=noreply@yourdomain.com
```

---

## Option 3: AWS SES (Enterprise - 30 minutes)

### Step 1: Set Up AWS SES
1. Go to AWS Console → SES
2. Verify your domain or email
3. Request production access (if needed)

### Step 2: Create IAM User
1. Go to IAM → Users → Add User
2. Name: "unihostel-ses"
3. Access type: Programmatic access
4. Attach policy: AmazonSESFullAccess
5. Save Access Key ID and Secret Access Key

### Step 3: Update Email Service Code
Edit `backend/utils/emailService.js`:

```javascript
const AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

const sendEmail = async (to, subject, html) => {
  const params = {
    Source: process.env.EMAIL_USER,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Html: { Data: html } }
    }
  };
  await ses.sendEmail(params).promise();
};
```

### Step 4: Install AWS SDK
```bash
cd backend
npm install aws-sdk
```

### Step 5: Update Environment Variables
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
EMAIL_USER=noreply@yourdomain.com
```

---

## Testing Email Service

### Test Script
Create `backend/test-email-quick.js`:

```javascript
require('dotenv').config();
const { sendPasswordResetEmail } = require('./utils/emailService');

(async () => {
  try {
    console.log('Sending test email...');
    await sendPasswordResetEmail('your-test-email@gmail.com', 'test-token-123');
    console.log('✅ Email sent successfully!');
  } catch (err) {
    console.error('❌ Email failed:', err.message);
  }
  process.exit(0);
})();
```

Run test:
```bash
node test-email-quick.js
```

---

## Current Email Features

Once configured, these emails will work automatically:

1. **Password Reset** - When user requests password reset
2. **Application Submitted** - When student applies for hostel
3. **Application Approved for Payment** - When manager approves
4. **Payment Success** - After successful payment
5. **Final Approval** - With access code
6. **Application Rejected** - When manager rejects
7. **New Application Notification** - To manager

---

## Troubleshooting

### Gmail "Less secure app access" Error
- Solution: Use App Password (Option 1 above)
- Gmail no longer supports "less secure apps"

### SendGrid "Sender not verified" Error
- Solution: Verify your sender email in SendGrid dashboard
- Go to Settings → Sender Authentication

### AWS SES "Email address not verified" Error
- Solution: Verify email in SES console
- Or request production access to send to any email

### "Connection timeout" Error
- Check firewall settings
- Ensure port 587 (SMTP) or 443 (API) is open
- Try different SMTP port (465 for SSL)

---

## Production Checklist

- [ ] Email service configured (Gmail/SendGrid/AWS)
- [ ] Test email sent successfully
- [ ] Update Railway environment variables
- [ ] Test password reset flow
- [ ] Test application notification emails
- [ ] Monitor email delivery logs

---

## Cost Comparison

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| Gmail | Unlimited (with limits) | Free |
| SendGrid | 100/day | $15/month (40k emails) |
| AWS SES | 62,000/month (if on EC2) | $0.10 per 1,000 emails |

**Recommendation:** 
- Development: Gmail App Password
- Production (<100 emails/day): SendGrid Free
- Production (>100 emails/day): AWS SES

---

## Quick Setup (Gmail - 5 minutes)

```bash
# 1. Get Gmail App Password (see Step 1 above)

# 2. Update .env
echo "EMAIL_USER=your-gmail@gmail.com" >> backend/.env
echo "EMAIL_PASSWORD=your-app-password" >> backend/.env

# 3. Test
cd backend
node test-emails.js

# 4. Deploy to Railway
# Add EMAIL_USER and EMAIL_PASSWORD to Railway environment variables

# Done! ✅
```
