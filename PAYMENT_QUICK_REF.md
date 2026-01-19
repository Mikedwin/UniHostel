# Payment System - Quick Reference

## What Changed

### Payment Model: "Commission on Top"
- Student pays: **Hostel Fee + Admin Commission**
- Example: GH₵1000 hostel + GH₵100 commission (10%) = **GH₵1100 total**
- Manager receives: GH₵1000 (full hostel fee)
- Admin receives: GH₵100 (commission)

## Files Modified

### Backend
1. **`.env`** - Added Paystack keys and commission percentage
2. **`models/Application.js`** - Added payment tracking fields
3. **`routes/payment.js`** - NEW: Payment initialization, verification, webhook
4. **`server.js`** - Integrated payment routes
5. **`package.json`** - Added axios dependency

### Frontend
1. **`src/config.js`** - Added Paystack public key config
2. **`src/pages/HostelDetail.js`** - Changed "Apply" to "Pay & Apply" with payment breakdown
3. **`src/pages/PaymentVerify.js`** - NEW: Payment verification page
4. **`src/App.js`** - Added payment verification route
5. **`.env.example`** - NEW: Environment variables template

### Documentation
1. **`PAYMENT_SETUP.md`** - Complete setup guide
2. **`PAYMENT_QUICK_REF.md`** - This file

## How It Works

### Student Flow
1. Student browses hostels
2. Clicks "Pay & Apply" on a room
3. Sees payment breakdown:
   - Hostel Fee: GH₵1000
   - Platform Fee (10%): GH₵100
   - **Total: GH₵1100**
4. Fills application form
5. Clicks "Pay GH₵1100 & Apply"
6. Redirected to Paystack payment page
7. Completes payment with card/mobile money
8. Redirected back to verification page
9. Application submitted with "paid" status

### Manager Flow
- Receives applications with payment status
- Only paid applications count toward room occupancy
- Approves/rejects paid applications
- Receives full hostel fee (no deductions)

### Admin Flow
- Automatically receives 10% commission on all payments
- Can track payments in database
- Can adjust commission percentage in `.env`

## Quick Setup (Development)

1. **Get Paystack Test Keys**
   - Sign up at https://paystack.com
   - Copy test keys from dashboard

2. **Backend Setup**
   ```bash
   cd backend
   # Edit .env and add:
   PAYSTACK_SECRET_KEY=sk_test_xxxxx
   PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
   ADMIN_COMMISSION_PERCENT=10
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   # Create .env file:
   echo "REACT_APP_API_URL=http://localhost:5000" > .env
   echo "REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx" >> .env
   npm start
   ```

4. **Test Payment**
   - Use test card: `4084084084084081`
   - Any CVV, any future expiry date

## Production Deployment

### Railway (Backend)
Add environment variables:
- `PAYSTACK_SECRET_KEY` = sk_live_xxxxx
- `PAYSTACK_PUBLIC_KEY` = pk_live_xxxxx
- `ADMIN_COMMISSION_PERCENT` = 10

### Vercel (Frontend)
Add environment variables:
- `REACT_APP_PAYSTACK_PUBLIC_KEY` = pk_live_xxxxx

### Paystack Dashboard
Add webhook URL:
- `https://your-backend.railway.app/api/payment/webhook`

## Changing Commission

Edit `backend/.env`:
```env
ADMIN_COMMISSION_PERCENT=15  # Change to 15%
```
Restart backend. All new payments will use 15% commission.

## API Endpoints

### POST `/api/payment/initialize`
Initialize payment for application
- Headers: `Authorization: Bearer <token>`
- Body: `{ hostelId, roomType, semester, studentName, contactNumber }`
- Returns: `{ authorizationUrl, reference, totalAmount, hostelFee, adminCommission }`

### GET `/api/payment/verify/:reference`
Verify payment status
- Headers: `Authorization: Bearer <token>`
- Returns: `{ success, message, application }`

### POST `/api/payment/webhook`
Paystack webhook (called automatically)
- Validates signature
- Updates application payment status

## Database Fields

Application model now includes:
```javascript
{
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed',
  hostelFee: 1000,              // Manager's amount
  adminCommission: 100,         // Admin's 10%
  totalAmount: 1100,            // Student pays
  paymentReference: 'UNI-xxx',  // Paystack ref
  paidAt: Date                  // Payment time
}
```

## Testing

### Test Cards (Paystack)
- **Success**: 4084084084084081
- **Insufficient Funds**: 5060666666666666666
- **Declined**: 5143010522339965

### Test Flow
1. Register as student
2. Browse hostels
3. Click "Pay & Apply"
4. Use test card above
5. Verify payment success
6. Check student dashboard for application

## Troubleshooting

**Payment button not working?**
- Check browser console for errors
- Verify Paystack public key in frontend `.env`
- Ensure backend is running

**Payment verification fails?**
- Check webhook URL in Paystack dashboard
- Verify `FRONTEND_URL` in backend `.env`
- Check Railway logs for errors

**Wrong commission amount?**
- Check `ADMIN_COMMISSION_PERCENT` in backend `.env`
- Restart backend after changing
- Clear browser cache

## Next Steps (Optional Enhancements)

1. **Payment History Page** - Show all student payments
2. **Manager Payout Dashboard** - Track earnings
3. **Admin Analytics** - Total commission collected
4. **Refund System** - Handle cancellations
5. **Multiple Payment Methods** - Add mobile money, bank transfer
6. **Payment Receipts** - Email confirmation to students

## Support

- Paystack Docs: https://paystack.com/docs
- Paystack Support: support@paystack.com
- Test Environment: Use test keys for development
- Live Environment: Switch to live keys for production
