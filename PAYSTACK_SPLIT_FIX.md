# Paystack Split Payment Fix

## Problem
Money was not splitting between manager and admin because the code was using `split_code` (which wasn't configured) instead of `subaccount`.

## Root Causes
1. **Wrong Parameter**: Used `split_code` instead of `subaccount`
2. **Missing Environment Variable**: `PAYSTACK_SPLIT_CODE` was never defined
3. **Not Using Manager's Subaccount**: Manager's `paystackSubaccountCode` from database wasn't being used

## Solution Implemented

### Changed in `backend/routes/payment.js`:
- **Removed**: `split_code: process.env.PAYSTACK_SPLIT_CODE`
- **Added**: 
  ```javascript
  subaccount: manager.paystackSubaccountCode
  transaction_charge: Math.round(adminCommission * 100)
  ```

### How It Works Now:
1. Student pays **GH₵1,030** (GH₵1,000 hostel fee + GH₵30 admin commission)
2. Paystack receives **GH₵1,030**
3. Manager's subaccount receives **GH₵1,000** (hostel fee)
4. Admin (main account) receives **GH₵30** (commission via `transaction_charge`)

## Paystack Parameters Explained

### `subaccount`
- The manager's Paystack subaccount code (e.g., `ACCT_xxxxx`)
- This is where the hostel fee goes

### `transaction_charge`
- Amount in kobo/pesewas that goes to the main account (admin)
- This is your platform commission
- Must be in smallest currency unit (multiply by 100)

## Verification Steps

1. **Check Manager Has Subaccount**:
   ```javascript
   // In MongoDB or via API
   User.findOne({ email: 'manager@example.com' })
   // Should have: paystackSubaccountCode and payoutEnabled: true
   ```

2. **Test Payment**:
   - Student applies and pays
   - Check Paystack dashboard → Transactions
   - Should show split with subaccount

3. **Check Logs**:
   ```
   Split payment enabled with subaccount: ACCT_xxxxx
   Transaction charge (admin commission): 30
   ```

## If Split Still Not Working

### Check These:
1. **Manager has subaccount configured**:
   - `paystackSubaccountCode` is set in database
   - `payoutEnabled` is `true`

2. **Subaccount is active in Paystack**:
   - Login to Paystack Dashboard
   - Go to Settings → Subaccounts
   - Verify subaccount status is "Active"

3. **Subaccount settlement account is verified**:
   - Manager's bank account or mobile money must be verified
   - Check subaccount details in Paystack

4. **Using correct Paystack keys**:
   - Test keys for testing
   - Live keys for production

## Update Manager Subaccount

Run this script to add/update manager's subaccount:
```bash
cd backend
node update-subaccount.js
```

Or manually update in database:
```javascript
db.users.updateOne(
  { email: 'manager@example.com', role: 'manager' },
  { 
    $set: { 
      paystackSubaccountCode: 'ACCT_xxxxx',
      payoutEnabled: true 
    }
  }
)
```

## Important Notes

- **No split_code needed**: Subaccount method is simpler
- **Automatic splits**: Paystack handles the split automatically
- **Real-time settlement**: Manager gets paid according to Paystack settlement schedule
- **Admin commission**: Deducted automatically via `transaction_charge`
