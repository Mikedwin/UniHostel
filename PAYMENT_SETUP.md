# Payment Integration Setup Guide

## Overview
The payment system allows students to pay hostel fees with an automatic 10% admin commission added on top. The total amount is split between the admin and the hostel manager.

### Payment Flow Example
- **Hostel Fee**: GH₵1000 (set by manager)
- **Admin Commission**: GH₵100 (10% of hostel fee)
- **Student Pays**: GH₵1100 (total)
- **Split**: Manager receives GH₵1000, Admin receives GH₵100

## Paystack Setup (Recommended for Ghana)

### Step 1: Create Paystack Account
1. Go to https://paystack.com
2. Sign up for a free account
3. Complete business verification (required for live payments)

### Step 2: Get API Keys
1. Login to Paystack Dashboard
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy your **Public Key** and **Secret Key**
4. For testing, use **Test Keys** (starts with `pk_test_` and `sk_test_`)
5. For production, use **Live Keys** (starts with `pk_live_` and `sk_live_`)

### Step 3: Configure Backend
1. Open `backend/.env` file
2. Add your Paystack keys:
```env
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
ADMIN_COMMISSION_PERCENT=10
```

### Step 4: Configure Frontend
1. Create `.env` file in `frontend/` directory:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

2. For production (Vercel), add environment variables:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `REACT_APP_API_URL` = `https://your-backend-url.railway.app`
   - Add: `REACT_APP_PAYSTACK_PUBLIC_KEY` = `pk_live_your_live_key`

### Step 5: Configure Webhook (Important!)
1. In Paystack Dashboard, go to **Settings** → **API Keys & Webhooks**
2. Add webhook URL: `https://your-backend-url.railway.app/api/payment/webhook`
3. This allows Paystack to notify your backend when payments succeed

### Step 6: Test Payment Flow
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm start`
3. Register as a student
4. Browse hostels and click "Pay & Apply"
5. Use Paystack test cards:
   - **Success**: `4084084084084081` (any CVV, any future date)
   - **Insufficient Funds**: `5060666666666666666`
   - **Declined**: `5143010522339965`

## Changing Commission Percentage

To change the admin commission from 10% to another value:

1. Open `backend/.env`
2. Change `ADMIN_COMMISSION_PERCENT=10` to your desired percentage
3. Example: `ADMIN_COMMISSION_PERCENT=15` for 15% commission
4. Restart backend server

## Payment Features Implemented

### For Students
- See payment breakdown before applying (Hostel Fee + Platform Fee = Total)
- Secure payment via Paystack
- Payment verification page
- Application only submitted after successful payment

### For Managers
- Receive exact hostel fee amount (no deductions)
- View applications with payment status
- Only paid applications count toward room occupancy

### For Admin
- Automatic commission collection
- Track all payments in database
- View payment statistics (future feature)

## Database Schema

Applications now include payment fields:
```javascript
{
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed',
  hostelFee: Number,           // Manager's amount
  adminCommission: Number,     // Admin's commission
  totalAmount: Number,         // Student pays this
  paymentReference: String,    // Paystack reference
  paidAt: Date                 // Payment timestamp
}
```

## Troubleshooting

### Payment initialization fails
- Check if `PAYSTACK_SECRET_KEY` is set correctly in backend `.env`
- Ensure backend is running and accessible
- Check browser console for errors

### Payment verification fails
- Verify webhook URL is configured in Paystack Dashboard
- Check if `FRONTEND_URL` in backend `.env` matches your frontend URL
- Ensure payment reference is valid

### Commission not calculating correctly
- Check `ADMIN_COMMISSION_PERCENT` value in backend `.env`
- Restart backend after changing environment variables
- Verify room price is set correctly in hostel listing

## Production Deployment

### Backend (Railway)
1. Add environment variables in Railway dashboard:
   - `PAYSTACK_SECRET_KEY` = your live secret key
   - `PAYSTACK_PUBLIC_KEY` = your live public key
   - `ADMIN_COMMISSION_PERCENT` = 10
   - `FRONTEND_URL` = https://uni-hostel-two.vercel.app

### Frontend (Vercel)
1. Add environment variables in Vercel dashboard:
   - `REACT_APP_API_URL` = https://unihostel-production.up.railway.app
   - `REACT_APP_PAYSTACK_PUBLIC_KEY` = your live public key

### Important: Switch to Live Keys
Before going live, replace all test keys with live keys in both backend and frontend environment variables.

## Security Notes

- Never commit API keys to Git
- Use environment variables for all sensitive data
- Test thoroughly with test keys before using live keys
- Enable webhook signature verification (already implemented)
- Monitor Paystack dashboard for suspicious activity

## Support

For Paystack support:
- Email: support@paystack.com
- Docs: https://paystack.com/docs
- Phone: +234 1 888 3888

For UniHostel payment issues:
- Check application logs in Railway dashboard
- Verify environment variables are set correctly
- Test with Paystack test cards first
