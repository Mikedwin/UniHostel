# 🚀 Deploy UniHostel Backend to Render.com (FREE)

## ✅ What You'll Get
- FREE hosting forever
- No credit card required
- Automatic deployments from GitHub
- HTTPS included
- Keep MongoDB, Cloudinary, JWT, Express

---

## 📋 Step-by-Step Deployment

### Step 1: Push Code to GitHub (if not already)
```bash
cd "C:\Users\user\Desktop\Hostel Hub"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Sign Up for Render.com
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (easiest)

### Step 3: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select "Hostel Hub" repository

### Step 4: Configure Service
Fill in these settings:

**Name:** `unihostel-backend`

**Region:** Choose closest to you

**Branch:** `main`

**Root Directory:** `backend`

**Runtime:** `Node`

**Build Command:** `npm install`

**Start Command:** `npm start`

**Instance Type:** `Free`

### Step 5: Add Environment Variables
Click "Advanced" → "Add Environment Variable" and add ALL these:

```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/unihostel?appName=Cluster0
JWT_SECRET=<generate_a_64_plus_character_jwt_secret>
ADMIN_USERNAME=admin_user
ADMIN_PASSWORD=<secure_password_here>
ADMIN_EMAIL=admin@example.com
NODE_ENV=production
FRONTEND_URL=https://uni-hostel-two.vercel.app
PAYSTACK_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
PAYSTACK_PUBLIC_KEY=pk_live_YOUR_PUBLIC_KEY_HERE
ADMIN_COMMISSION_PERCENT=5
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=60
AUTH_RATE_LIMIT_MAX=3
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=30
EMAIL_USER=support@example.com
EMAIL_PASSWORD=your_email_password_here
DATA_RETENTION_DAYS=730
INACTIVE_USER_DAYS=365
ARCHIVED_APPLICATION_DAYS=180
LOGIN_HISTORY_DAYS=90
CLEANUP_SCHEDULE_HOUR=2
MAX_IMAGE_SIZE_MB=5
MAX_IMAGES_PER_HOSTEL=20
ALLOWED_IMAGE_TYPES=image/jpeg,image/jpg,image/png,image/webp
CACHE_TTL_SECONDS=300
CACHE_CHECK_PERIOD=60
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
```

### Step 6: Deploy
1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. You'll get a URL like: `https://unihostel-backend.onrender.com`

### Step 7: Update Frontend
Update your frontend `.env`:
```
REACT_APP_API_URL=https://unihostel-backend.onrender.com
```

Then redeploy frontend on Vercel.

---

## ✅ Done!

Your backend is now hosted FREE on Render.com!

## 📝 Notes
- Free tier sleeps after 15 min of inactivity (first request takes 30 sec to wake up)
- Upgrade to paid ($7/month) for always-on if needed later
- Automatic deployments on every git push

## 🆘 Troubleshooting
- If deployment fails, check logs in Render dashboard
- Make sure all environment variables are added
- Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
