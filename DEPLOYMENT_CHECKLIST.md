# Deployment Checklist

## ✅ Files Ready for Deployment

### Backend Changes
- ✅ Dynamic CORS configuration (supports production frontend URL)
- ✅ Server listens on 0.0.0.0 for Railway
- ✅ Environment variables configured (.env.example updated)

### Frontend Changes
- ✅ All API calls use dynamic API_URL from config.js
- ✅ config.js created (reads REACT_APP_API_URL)
- ✅ vercel.json created (handles client-side routing)
- ✅ .env and .env.example created

### Updated Files
1. StudentLogin.js
2. StudentRegister.js
3. ManagerLogin.js
4. ManagerRegister.js
5. HostelList.js
6. HostelDetail.js
7. StudentDashboard.js
8. ManagerDashboard.js
9. AddHostel.js
10. EditHostel.js
11. backend/server.js

## 🚀 Quick Deployment Steps

### 1. MongoDB Atlas (5 minutes)
- Create free cluster at mongodb.com/cloud/atlas
- Get connection string
- Whitelist all IPs (0.0.0.0/0)

### 2. Railway - Backend (10 minutes)
```bash
# Push to GitHub first
git init
git add .
git commit -m "Ready for deployment"
git push
```
- Deploy on railway.app from GitHub
- Set root directory: `backend`
- Add environment variables from backend/.env.example
- Get Railway URL

### 3. Vercel - Frontend (5 minutes)
- Deploy on vercel.com from GitHub
- Set root directory: `frontend`
- Add environment variable:
  - REACT_APP_API_URL = your_railway_url
- Get Vercel URL

### 4. Connect Services (2 minutes)
- Update Railway FRONTEND_URL with Vercel URL
- Redeploy both services

## 🔧 Environment Variables

### Railway (Backend)
```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/unihostel
JWT_SECRET=your_super_secret_jwt_key_12345
ADMIN_USERNAME=admin_user
ADMIN_PASSWORD=<secure_password_here>
ADMIN_EMAIL=admin@example.com
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

### Vercel (Frontend)
```
REACT_APP_API_URL=https://your-app.up.railway.app
```

## ✨ Your app is now deployment-ready!

See DEPLOYMENT.md for detailed step-by-step instructions.
