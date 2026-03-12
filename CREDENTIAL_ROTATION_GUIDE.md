# 🔐 URGENT: Credential Rotation Guide

## ⚠️ YOUR CREDENTIALS ARE EXPOSED - ROTATE IMMEDIATELY

Your `.env` file contains sensitive credentials that are visible in this conversation. Follow these steps **RIGHT NOW** to secure your platform.

---

## Step 1: Rotate MongoDB Password (5 minutes)

### Instructions:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in with your account
3. Click **Database Access** in the left sidebar
4. Find user: `1mikedwin_db_user`
5. Click **Edit** (pencil icon)
6. Click **Edit Password**
7. Click **Autogenerate Secure Password** (recommended)
8. **COPY THE NEW PASSWORD** - you won't see it again!
9. Click **Update User**

### Update Your .env File:
```env
MONGO_URI=mongodb+srv://1mikedwin_db_user:NEW_PASSWORD_HERE@cluster0.paznchc.mongodb.net/unihostel?retryWrites=true&w=majority&appName=Cluster0
```

**Replace `NEW_PASSWORD_HERE` with the password you copied.**

---

## Step 2: Rotate Paystack API Keys (3 minutes)

### Instructions:
1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Log in with your account
3. Click **Settings** → **API Keys & Webhooks**
4. Under **Test Keys** section:
   - Click **Regenerate Secret Key**
   - Confirm regeneration
   - **COPY THE NEW SECRET KEY** immediately
   - Copy the Public Key (it may have changed)

### Update Your .env File:
```env
PAYSTACK_SECRET_KEY=sk_test_NEW_SECRET_KEY_HERE
PAYSTACK_PUBLIC_KEY=pk_test_NEW_PUBLIC_KEY_HERE
```

**Replace with the new keys you copied.**

---

## Step 3: Change Admin Password (1 minute)

### Generate Strong Password:
Use this command to generate a secure password:
```bash
node -e "console.log(require('crypto').randomBytes(24).toString('base64'))"
```

Or use a password manager to generate a 20+ character password.

### Update Your .env File:
```env
ADMIN_PASSWORD=YOUR_NEW_STRONG_PASSWORD_HERE
```

---

## Step 4: Update Frontend Config (2 minutes)

### Update Paystack Public Key in Frontend:
1. Go to your Vercel dashboard
2. Select your project: `uni-hostel-two`
3. Go to **Settings** → **Environment Variables**
4. Find `REACT_APP_PAYSTACK_PUBLIC_KEY`
5. Click **Edit**
6. Paste your new Paystack Public Key
7. Click **Save**
8. Redeploy your frontend

---

## Step 5: Update Backend Deployment (3 minutes)

### If using Railway/Render/Heroku:
1. Go to your backend hosting dashboard
2. Find **Environment Variables** or **Config Vars**
3. Update these variables:
   - `MONGO_URI` (with new password)
   - `PAYSTACK_SECRET_KEY` (new secret key)
   - `ADMIN_PASSWORD` (new password)
4. Save and redeploy

### If using Vercel for backend:
1. Go to Vercel dashboard
2. Select backend project
3. Go to **Settings** → **Environment Variables**
4. Update the variables above
5. Redeploy

---

## Step 6: Remove .env from Git History (5 minutes)

### ⚠️ CRITICAL: Your .env file may be in Git history

Run these commands in your project directory:

```bash
# Remove .env from Git history
git filter-branch --force --index-filter \
"git rm --cached --ignore-unmatch backend/.env" \
--prune-empty --tag-name-filter cat -- --all

# Force push to remote (WARNING: This rewrites history)
git push origin --force --all

# Clean up
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**Alternative (Safer):** If you don't want to rewrite history:
1. Rotate all credentials (Steps 1-3)
2. The old credentials in Git history become useless
3. Just ensure `.env` is in `.gitignore` going forward

---

## Step 7: Verify Security (2 minutes)

### Test Your Application:
1. Try logging in to your app
2. Try creating a hostel (as manager)
3. Try making a payment (as student)
4. Check if everything works

### If Something Breaks:
- **MongoDB Connection Error**: Check MONGO_URI is correct
- **Payment Error**: Check Paystack keys are correct
- **Admin Login Error**: Check ADMIN_PASSWORD is correct

---

## Step 8: Update .env.example (1 minute)

Make sure your `.env.example` doesn't contain real credentials:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=generate_strong_random_secret_here
ADMIN_USERNAME=admin_username
ADMIN_PASSWORD=strong_admin_password
ADMIN_EMAIL=admin@example.com
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app

# Payment Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
ADMIN_COMMISSION_PERCENT=3
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] MongoDB connection works with new password
- [ ] Paystack payments work with new keys
- [ ] Admin can login with new password
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` has no real credentials
- [ ] Backend deployment has new environment variables
- [ ] Frontend deployment has new Paystack public key
- [ ] Application works end-to-end

---

## Security Best Practices Going Forward

### 1. Never Commit .env Files
```bash
# Verify .env is ignored
git status

# If .env shows up, add to .gitignore
echo "backend/.env" >> .gitignore
git add .gitignore
git commit -m "Ensure .env is ignored"
```

### 2. Use Environment Variables in Production
- Store secrets in hosting platform (Vercel, Railway, etc.)
- Never hardcode credentials in code
- Use different credentials for dev/staging/production

### 3. Rotate Credentials Regularly
- MongoDB password: Every 90 days
- API keys: Every 180 days
- JWT secret: Every 365 days

### 4. Monitor for Breaches
- Enable MongoDB Atlas alerts
- Monitor Paystack transaction logs
- Set up error alerts in your app

---

## Emergency Contacts

**If credentials were compromised:**
- MongoDB Support: https://support.mongodb.com/
- Paystack Support: support@paystack.com
- Check for unauthorized transactions immediately

---

## Estimated Time: 20 minutes total

**Priority: CRITICAL - Do this NOW before continuing development**

---

**Last Updated:** December 2024  
**Status:** ⚠️ URGENT ACTION REQUIRED
