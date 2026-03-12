# Supabase Deployment Setup

## Prerequisites
1. Install Supabase CLI: `npm install -g supabase`
2. Create Supabase account at https://supabase.com
3. Create new project and note your Project Reference ID

## Setup Steps

### 1. Login to Supabase
```bash
supabase login
```

### 2. Link Your Project
```bash
cd backend
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Update Configuration
Edit `supabase/config.toml` and replace `your-project-ref` with your actual project reference

### 4. Set Environment Variables
In Supabase Dashboard → Edge Functions → Secrets, add:
- MONGO_URI
- JWT_SECRET
- PAYSTACK_SECRET_KEY
- PAYSTACK_PUBLIC_KEY
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- FRONTEND_URL
- All other variables from your .env file

### 5. Deploy
```bash
supabase functions deploy api
```

Or run: `deploy-supabase.bat`

## Important Notes

⚠️ **Limitations:**
- Edge Functions have 10MB size limit
- Your current Express app is too large for a single function
- Cold starts on every request
- No persistent connections (MongoDB reconnects each time)

## Recommended Approach

**Option A: Hybrid (Recommended)**
- Keep MongoDB Atlas + Cloudinary
- Deploy Express backend to Render/Railway
- Use Supabase only if migrating to PostgreSQL

**Option B: Full Migration**
- Migrate MongoDB → Supabase PostgreSQL
- Rewrite all Mongoose models
- Use Supabase Auth instead of JWT
- Use Supabase Storage instead of Cloudinary
- Estimated time: 2-3 weeks

## Your Current Setup
- ✅ MongoDB Atlas (working)
- ✅ Cloudinary (working)
- ✅ Paystack (working)
- ✅ Express backend (needs hosting)

**Best solution: Deploy Express to Render (5 min setup, no code changes)**
