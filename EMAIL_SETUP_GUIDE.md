# Email Setup Guide for Password Reset

## Gmail App Password Setup

To send password reset emails, you need a Gmail App Password:

### Steps:

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/security

2. **Enable 2-Step Verification** (if not already enabled)
   - Click "2-Step Verification"
   - Follow the setup process

3. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "UniHostel"
   - Click "Generate"
   - Copy the 16-character password

4. **Update .env File**
   ```
   EMAIL_USER=1mikedwin@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  (paste the app password here)
   ```

5. **Restart Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

## Testing

1. Go to forgot password page
2. Enter your email
3. Check your inbox for reset email
4. Click the link or copy the token

## Troubleshooting

**No email received?**
- Check spam folder
- Verify EMAIL_USER and EMAIL_PASSWORD in .env
- Make sure 2-Step Verification is enabled
- Restart backend server after updating .env

**"Less secure app access" error?**
- Use App Password instead (see steps above)
- Don't use your regular Gmail password

## Alternative: Use Different Email Service

If you prefer not to use Gmail, update `backend/utils/emailService.js`:

### SendGrid Example:
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
```

### AWS SES Example:
```javascript
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });
```

## Current Status

✅ Email service integrated
⚠️ Needs Gmail App Password to be configured
📧 Falls back to console logging if not configured
