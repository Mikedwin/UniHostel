# Manager Dashboard Access Fix

## Problem
Cannot access the manager dashboard with your email and password because:
1. No manager account exists in the database with your credentials
2. Frontend was using hardcoded localhost URLs instead of environment configuration

## Solutions Applied

### 1. Fixed Frontend API Configuration
- Updated `Login.js` to use `API_URL` from config instead of hardcoded localhost
- Updated `Register.js` to use `API_URL` from config instead of hardcoded localhost

### 2. Created Admin Initialization Script
- Created `backend/initAdmin.js` to automatically create a manager account from .env variables
- Added `init-admin` script to backend package.json

## How to Fix Your Access Issue

### Option 1: Create Admin Account via Script (RECOMMENDED)

1. Open terminal in the backend folder:
   ```bash
   cd "c:\Users\user\Desktop\Hostel Hub\backend"
   ```

2. Run the admin initialization script:
   ```bash
   npm run init-admin
   ```

3. You should see:
   ```
   ✅ Admin manager account created successfully!
   Email: 1mikedwin@gmail.com
   Role: manager
   ```

4. Now you can login with:
   - Email: `1mikedwin@gmail.com`
   - Password: `GguzgpD0t5XXe0ms`

### Option 2: Register Manually via Frontend

1. Go to your webapp registration page
2. Fill in the form:
   - Name: Your name
   - Email: `1mikedwin@gmail.com`
   - Password: `GguzgpD0t5XXe0ms`
   - Role: Select "Hostel Manager / Landlord"
3. Click Register
4. You'll be automatically logged in and redirected to the manager dashboard

## For Production Deployment

### Update Frontend Environment Variable

If your backend is deployed (e.g., on Railway), update the frontend .env:

```env
REACT_APP_API_URL=https://your-backend-url.up.railway.app
```

Then rebuild and redeploy the frontend.

### Run Init Script on Production

After deploying backend to Railway:

1. Go to Railway dashboard
2. Open your service
3. Go to "Settings" → "Deploy"
4. Add a one-time command: `npm run init-admin`
5. Or connect via Railway CLI and run it manually

## Verification Steps

1. **Check if admin exists:**
   - Run `npm run init-admin` again
   - If account exists, you'll see: "Admin account already exists"

2. **Test login:**
   - Go to login page
   - Enter email: `1mikedwin@gmail.com`
   - Enter password: `GguzgpD0t5XXe0ms`
   - Should redirect to Manager Dashboard

3. **Verify manager features:**
   - Should see "List New Hostel" button
   - Should see "Incoming Applications" section
   - Should see "My Listings" section

## Troubleshooting

### "User does not exist" error
- Run `npm run init-admin` to create the account
- Or register manually via the frontend

### "Invalid credentials" error
- Double-check the password in your .env file
- Ensure no extra spaces in the password

### CORS errors
- Make sure backend is running
- Check that FRONTEND_URL in backend .env matches your frontend URL
- For local development: `http://localhost:3000`
- For production: Your Vercel URL

### Still can't access after creating account
- Clear browser cache and localStorage
- Try in incognito/private window
- Check browser console for errors

## Important Notes

1. **Security**: Change the default password in production!
2. **Environment Variables**: Never commit .env files to GitHub
3. **Multiple Managers**: You can create multiple manager accounts by registering via the frontend
4. **Database**: The admin account is stored in MongoDB with role='manager'
