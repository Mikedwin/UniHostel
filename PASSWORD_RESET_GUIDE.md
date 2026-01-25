# Password Reset Testing Guide

## Setup Steps

### 1. Restart Frontend Server
The new pages need the frontend to be restarted:
```bash
cd frontend
npm start
```

### 2. Test the Flow

#### Option A: Via Login Page
1. Go to `http://localhost:3000/student-login` or `http://localhost:3000/manager-login`
2. Click "Forgot password?" link below the password field
3. Enter your email address
4. Check backend console for reset link

#### Option B: Direct URL
1. Go directly to `http://localhost:3000/forgot-password`
2. Enter your email address
3. Submit the form

### 3. Get Reset Token
After submitting email, check your **backend console/terminal** for a log like:
```
Password reset link for user@example.com: https://uni-hostel-two.vercel.app/reset-password/abc123token456
```

### 4. Use Reset Token
Copy the token from the URL and visit:
```
http://localhost:3000/reset-password/YOUR_TOKEN_HERE
```

### 5. Set New Password
- Enter new password (min 8 characters)
- Confirm password
- Submit
- You'll be redirected to login

## Troubleshooting

### "Page not found" or blank page
- **Solution**: Restart the frontend server (`npm start` in frontend folder)
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

### "Forgot password?" link not visible
- **Solution**: Check that StudentLogin.js and ManagerLogin.js were updated
- Restart frontend server

### Reset link doesn't work
- **Solution**: Make sure you're using the correct token from backend logs
- Token expires after 1 hour

### Backend errors
- **Solution**: Restart backend server (`npm run dev` in backend folder)

## API Endpoints

### Request Reset
```
POST http://localhost:5000/api/auth/forgot-password
Body: { "email": "user@example.com" }
```

### Reset Password
```
POST http://localhost:5000/api/auth/reset-password/:token
Body: { "password": "newpassword123" }
```

## Production URLs
- Forgot Password: https://uni-hostel-two.vercel.app/forgot-password
- Reset Password: https://uni-hostel-two.vercel.app/reset-password/:token

## Notes
- Currently, reset links are logged to console (no email sent yet)
- To enable email sending, configure EMAIL_* variables in backend/.env
- Tokens expire after 1 hour for security
