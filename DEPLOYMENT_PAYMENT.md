# Deployment Instructions - Payment System

## ✅ COMPLETED: Code Implementation
All payment code is now implemented and ready to deploy!

## 🔑 STEP 1: Get Paystack API Keys

1. Go to **https://paystack.com** and sign up
2. Login to Paystack Dashboard
3. Navigate to **Settings → API Keys & Webhooks**
4. Copy your **Test Keys** (for testing):
   - Test Secret Key: `sk_test_xxxxx...`
   - Test Public Key: `pk_test_xxxxx...`

## 🚀 STEP 2: Deploy Backend to Railway

### Option A: Update via Railway Dashboard
1. Go to https://railway.app
2. Open your **unihostel-production** project
3. Click on your backend service
4. Go to **Variables** tab
5. Add these new variables:

```
PAYSTACK_SECRET_KEY=sk_test_your_actual_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_actual_key_here
ADMIN_COMMISSION_PERCENT=10
```

6. Click **Deploy** (Railway will auto-redeploy)

### Option B: Update via Railway CLI
```bash
cd backend
railway variables set PAYSTACK_SECRET_KEY=sk_test_your_actual_key_here
railway variables set PAYSTACK_PUBLIC_KEY=pk_test_your_actual_key_here
railway variables set ADMIN_COMMISSION_PERCENT=10
```

## 🌐 STEP 3: Deploy Frontend to Vercel

### Option A: Update via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Open your **uni-hostel** project
3. Go to **Settings → Environment Variables**
4. Add this new variable:

```
Name: REACT_APP_PAYSTACK_PUBLIC_KEY
Value: pk_test_your_actual_key_here
Environment: Production, Preview, Development (select all)
```

5. Go to **Deployments** tab
6. Click **...** on latest deployment → **Redeploy**

### Option B: Update via Vercel CLI
```bash
cd frontend
vercel env add REACT_APP_PAYSTACK_PUBLIC_KEY
# Paste: pk_test_your_actual_key_here
# Select: Production, Preview, Development
vercel --prod
```

## 🔗 STEP 4: Configure Paystack Webhook

1. Go to Paystack Dashboard
2. Navigate to **Settings → API Keys & Webhooks**
3. Scroll to **Webhook URL** section
4. Add this URL:
```
https://unihostel-production.up.railway.app/api/payment/webhook
```
5. Click **Save**

## 🧪 STEP 5: Test Payment Flow

### Test with Test Keys (Development)
1. Go to https://uni-hostel-two.vercel.app
2. Register as a student
3. Browse hostels
4. Click **"Pay & Apply"** on any room
5. Use Paystack test card:
   - Card Number: `4084084084084081`
   - CVV: `123`
   - Expiry: Any future date (e.g., `12/25`)
   - PIN: `1234`
6. Complete payment
7. Verify application appears in Student Dashboard

### Test Cards (Paystack)
- ✅ **Success**: `4084084084084081`
- ❌ **Insufficient Funds**: `5060666666666666666`
- ❌ **Declined**: `5143010522339965`

## 🔴 STEP 6: Go Live (When Ready)

### Switch to Live Keys
1. Complete Paystack business verification
2. Get Live Keys from Paystack Dashboard:
   - Live Secret Key: `sk_live_xxxxx...`
   - Live Public Key: `pk_live_xxxxx...`

### Update Railway (Backend)
```
PAYSTACK_SECRET_KEY=sk_live_your_live_key_here
PAYSTACK_PUBLIC_KEY=pk_live_your_live_key_here
```

### Update Vercel (Frontend)
```
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key_here
```

### Update Webhook URL (if changed)
Make sure webhook URL in Paystack points to your production backend.

## 📊 Current Configuration

### Backend (Railway)
- URL: https://unihostel-production.up.railway.app
- New Routes:
  - `POST /api/payment/initialize` - Start payment
  - `GET /api/payment/verify/:reference` - Verify payment
  - `POST /api/payment/webhook` - Paystack callback

### Frontend (Vercel)
- URL: https://uni-hostel-two.vercel.app
- New Pages:
  - `/payment/verify` - Payment verification page
- Updated Pages:
  - `/hostels/:id` - Now shows "Pay & Apply" button

### Database (MongoDB Atlas)
- New Application fields:
  - `paymentStatus` - pending/paid/refunded/failed
  - `hostelFee` - Manager's amount
  - `adminCommission` - Admin's 10%
  - `totalAmount` - Student pays this
  - `paymentReference` - Paystack reference
  - `paidAt` - Payment timestamp

## 💰 Payment Flow

1. **Student sees**: Hostel Fee (GH₵1000) + Platform Fee (GH₵100) = Total (GH₵1100)
2. **Student pays**: GH₵1100 via Paystack
3. **System splits**:
   - Manager receives: GH₵1000
   - Admin receives: GH₵100
4. **Application created** with "paid" status
5. **Manager approves/rejects** the paid application

## 🔧 Troubleshooting

### Payment button doesn't work
- Check browser console for errors
- Verify `REACT_APP_PAYSTACK_PUBLIC_KEY` is set in Vercel
- Ensure frontend is redeployed after adding env variable

### Payment verification fails
- Check Railway logs for errors
- Verify webhook URL is correct in Paystack
- Ensure `PAYSTACK_SECRET_KEY` is set in Railway

### Wrong commission amount
- Check `ADMIN_COMMISSION_PERCENT` in Railway
- Default is 10% (student pays 10% extra)
- Change value and redeploy to update

## 📝 Quick Commands

### Local Development
```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd frontend
npm start
```

### Check Railway Logs
```bash
railway logs
```

### Redeploy Vercel
```bash
cd frontend
vercel --prod
```

## ✅ Checklist

- [ ] Get Paystack test keys
- [ ] Add keys to Railway environment variables
- [ ] Add public key to Vercel environment variables
- [ ] Configure webhook URL in Paystack
- [ ] Test payment with test card
- [ ] Verify application appears in dashboard
- [ ] (Later) Switch to live keys for production

## 🆘 Support

- **Paystack Issues**: support@paystack.com
- **Paystack Docs**: https://paystack.com/docs
- **Test Cards**: https://paystack.com/docs/payments/test-payments

---

**Status**: ✅ Code is ready. Just add your Paystack keys and deploy!
