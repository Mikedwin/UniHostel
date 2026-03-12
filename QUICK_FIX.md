# 🚨 URGENT: MongoDB Atlas Setup (Do This Now!)

## ⚡ 2-Minute Fix to Prevent Connection Errors

### Step 1: Whitelist All IPs (CRITICAL)
1. Go to: https://cloud.mongodb.com
2. Login with your credentials
3. Click **Network Access** (left sidebar)
4. Click **+ ADD IP ADDRESS** button
5. Click **ALLOW ACCESS FROM ANYWHERE**
6. Click **Confirm**

**Why**: Railway's server IP changes, so we need to allow all IPs.

### Step 2: Verify Database User
1. Click **Database Access** (left sidebar)
2. Find user: `1mikedwin_db_user`
3. Ensure role is: **Atlas admin** or **Read and write to any database**
4. If not, click **Edit** → Change role → **Save**

### Step 3: Check Cluster Status
1. Click **Database** (left sidebar)
2. Verify cluster status shows: **Active** (green)
3. If paused, click **Resume**

**Note**: Free tier (M0) auto-pauses after 60 days of inactivity.

---

## 🔧 Railway Backend Setup

### Add Health Check
1. Go to: https://railway.app
2. Select your backend service
3. Go to **Settings** → **Health Check**
4. Set Path: `/api/health`
5. Set Timeout: `30` seconds
6. Enable **Restart on unhealthy**
7. Click **Save**

### Verify Environment Variables
Ensure these are set in Railway:
```
MONGO_URI=mongodb+srv://1mikedwin_db_user:yzIGoYtxR1SW7AXN@cluster0.paznchc.mongodb.net/unihostel?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
JWT_SECRET=uH8$mK9#pL2@nQ5*vR7&wT3!xY6^zA1%bC4+dE0-fG8~hJ2
CLOUDINARY_CLOUD_NAME=dcpqsgmso
CLOUDINARY_API_KEY=696388963616524
CLOUDINARY_API_SECRET=pjDFbwNJ71j-A4gaCXLf94jAYU4
```

---

## ✅ What We Fixed

### Backend Improvements
✅ Connection timeout: 3s → 30s (10x longer)
✅ Retry attempts: 0 → 5 (with smart delays)
✅ Connection pool: 10 → 50 (5x more connections)
✅ Auto-reconnect on disconnect
✅ Health monitoring endpoints
✅ Graceful error messages

### Frontend Improvements
✅ Error boundary for crash prevention
✅ Axios retry logic (3 attempts)
✅ User-friendly error messages
✅ Auto-retry on 503 errors

---

## 📊 Test Your Deployment

### Test Backend Health
```bash
curl https://your-railway-url.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": {
    "status": "connected",
    "connected": true
  }
}
```

### Test Frontend
1. Go to: https://uni-hostel-two.vercel.app
2. Try logging in
3. Navigate to Manager/Student dashboard
4. Should load without errors

---

## 🆘 If Still Having Issues

### Check Railway Logs
```bash
railway logs
```

Look for:
- "MongoDB Connected" ✅ Good
- "MongoDB Error" ❌ Problem
- "Retrying in X seconds" ⚠️ Temporary issue

### Common Issues & Fixes

**Issue**: "Server selection timed out"
**Fix**: Whitelist all IPs in MongoDB Atlas (Step 1 above)

**Issue**: "Authentication failed"
**Fix**: Verify database user credentials in Railway env vars

**Issue**: "Cluster is paused"
**Fix**: Resume cluster in MongoDB Atlas dashboard

---

## 💡 Pro Tips

1. **Monitor Health**: Check `/api/health` endpoint daily
2. **Check Logs**: Review Railway logs weekly
3. **Backup Data**: MongoDB Atlas auto-backups (M10+ tier)
4. **Upgrade When Ready**: M0 → M10 when you have 100+ users

---

**Need Help?** Check PRODUCTION_DEPLOYMENT.md for detailed guide.
