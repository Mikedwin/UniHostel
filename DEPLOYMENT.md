# Deployment Guide - UniHostel

## Prerequisites
- GitHub account
- Railway account (https://railway.app)
- Vercel account (https://vercel.com)
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)

---

## Part 1: Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Cluster**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up/Login
   - Click "Build a Database" → Choose FREE tier
   - Select a cloud provider and region (closest to your users)
   - Click "Create Cluster"

2. **Configure Database Access**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)
   - Set privileges to "Read and write to any database"
   - Click "Add User"

3. **Configure Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

4. **Get Connection String**
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster.xxxxx.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Add database name at the end: `mongodb+srv://username:password@cluster.xxxxx.mongodb.net/unihostel`

---

## Part 2: Backend Deployment (Railway)

1. **Push Code to GitHub**
   ```bash
   cd "c:\Users\user\Desktop\Hostel Hub"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to https://railway.app
   - Sign up/Login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect it's a Node.js project

3. **Configure Backend Environment Variables**
   - Click on your deployed service
   - Go to "Variables" tab
   - Add these variables:
     ```
     PORT=5000
     MONGO_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_super_secret_jwt_key_12345
     ADMIN_USERNAME=1mikedwin_db_user
     ADMIN_PASSWORD=GguzgpD0t5XXe0ms
     ADMIN_EMAIL=1mikedwin@gmail.com
     NODE_ENV=production
     FRONTEND_URL=https://your-app-name.vercel.app
     ```
   - Click "Deploy" to restart with new variables

4. **Set Root Directory**
   - Go to "Settings" tab
   - Find "Root Directory"
   - Set to: `backend`
   - Click "Deploy" to restart

5. **Get Backend URL**
   - Go to "Settings" tab
   - Find "Domains" section
   - Click "Generate Domain"
   - Copy the URL (e.g., `https://your-app.up.railway.app`)
   - Save this for frontend configuration

---

## Part 3: Frontend Deployment (Vercel)

1. **Update Frontend to Use Backend URL**
   - You need to update all API calls to use the config file
   - In each page/component that makes API calls, replace:
     ```javascript
     // OLD:
     fetch('http://localhost:5000/api/...')
     
     // NEW:
     import API_URL from '../config';
     fetch(`${API_URL}/api/...`)
     ```

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Sign up/Login with GitHub
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Create React App
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `build`

3. **Configure Frontend Environment Variables**
   - In Vercel project settings
   - Go to "Environment Variables"
   - Add:
     ```
     REACT_APP_API_URL=https://your-railway-backend-url.up.railway.app
     ```
   - Click "Deploy"

4. **Update Railway Backend with Vercel URL**
   - Go back to Railway
   - Update `FRONTEND_URL` variable with your Vercel URL
   - Redeploy

---

## Part 4: Verification

1. **Test Backend**
   - Visit: `https://your-railway-url.up.railway.app/api/hostels`
   - Should return JSON (empty array or hostels)

2. **Test Frontend**
   - Visit: `https://your-vercel-url.vercel.app`
   - Try registering a new account
   - Try logging in
   - Test all features

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Check Railway logs for CORS errors

### Database Connection Failed
- Verify MongoDB Atlas connection string is correct
- Ensure IP whitelist includes 0.0.0.0/0
- Check database user has correct permissions

### 404 Errors on Refresh
- Vercel: Already configured with vercel.json
- Railway: Should work automatically

### Images Not Loading
- Large images may timeout - consider using image hosting service (Cloudinary, AWS S3)
- Or reduce image size before upload

### Build Failures
- Check Railway/Vercel logs
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

---

## Cost Considerations

- **MongoDB Atlas**: Free tier (512MB storage)
- **Railway**: Free tier ($5 credit/month, ~500 hours)
- **Vercel**: Free tier (unlimited deployments)

All services offer free tiers suitable for development and small-scale production.

---

## Post-Deployment Updates

### Update Backend
```bash
git add .
git commit -m "Update message"
git push
```
Railway auto-deploys on push.

### Update Frontend
```bash
git add .
git commit -m "Update message"
git push
```
Vercel auto-deploys on push.

---

## Important Notes

1. **Environment Variables**: Never commit .env files to GitHub
2. **Image Storage**: Consider migrating to cloud storage for production
3. **Database Backups**: Set up automated backups in MongoDB Atlas
4. **Monitoring**: Use Railway and Vercel dashboards to monitor performance
5. **Custom Domain**: Both Railway and Vercel support custom domains in free tier
