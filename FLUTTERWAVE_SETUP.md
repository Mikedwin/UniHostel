# 🚀 Flutterwave Integration Setup Guide

## ✅ What's Been Done

1. ✅ Installed Flutterwave SDK
2. ✅ Updated payment routes to support both Paystack and Flutterwave
3. ✅ Added environment variables
4. ✅ Updated frontend config

---

## 📋 Step 1: Create Flutterwave Account (10 mins)

1. Go to: https://flutterwave.com/gh/signup
2. Click **Sign Up**
3. Fill in:
   - Business Name: **UniHostel**
   - Email: **your-email@gmail.com**
   - Phone: **+233 XXX XXX XXX**
   - Password: (create strong password)
4. Verify your email
5. Complete business profile

---

## 🔑 Step 2: Get API Keys (5 mins)

### Test Keys (For Testing):
1. Login to Flutterwave Dashboard
2. Go to: **Settings** → **API Keys**
3. Copy:
   - **Public Key**: `FLWPUBK_TEST-xxxxx`
   - **Secret Key**: `FLWSECK_TEST-xxxxx`
   - **Encryption Key**: `FLWSECK_TESTxxxxx`

### Live Keys (For Production):
1. Complete KYC verification (upload documents)
2. Wait for approval (24-48 hours)
3. Go to: **Settings** → **API Keys** → **Live**
4. Copy Live keys

---

## ⚙️ Step 3: Update Environment Variables

### Backend (.env file):
```env
PAYMENT_PROVIDER=flutterwave
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-secret-key-here
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-public-key-here
FLUTTERWAVE_ENCRYPTION_KEY=FLWSECK_TESTyour-encryption-key
```

### Railway (Production):
1. Go to Railway Dashboard
2. Select your backend service
3. Go to **Variables** tab
4. Add:
   ```
   PAYMENT_PROVIDER=flutterwave
   FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxx
   FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxx
   FLUTTERWAVE_ENCRYPTION_KEY=FLWSECK_TESTxxxxx
   ```
5. Click **Deploy**

### Vercel (Frontend):
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   ```
   REACT_APP_PAYMENT_PROVIDER=flutterwave
   REACT_APP_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxx
   ```
5. Redeploy

---

## 🧪 Step 4: Test Payment (10 mins)

### Test Cards:
```
Card Number: 5531 8866 5214 2950
CVV: 564
Expiry: 09/32
PIN: 3310
OTP: 12345
```

### Test Process:
1. Login as student
2. Apply for a hostel
3. Wait for manager approval
4. Click "Pay Now"
5. Use test card above
6. Verify payment success

---

## 💰 Flutterwave Fees

**Ghana Pricing:**
- **1.4% + GHS 0.50** per transaction
- **Cheaper than Paystack!**

**Example:**
- Transaction: GHS 1,000
- Flutterwave fee: GHS 14.50
- You receive: GHS 985.50

**Comparison:**
| Provider | Fee | You Receive (GHS 1,000) |
|----------|-----|-------------------------|
| Flutterwave | 1.4% + 0.50 | GHS 985.50 |
| Paystack | 1.95% + 1.00 | GHS 979.50 |
| **Savings** | - | **GHS 6.00** |

---

## 🔄 Switch Between Providers

### To use Flutterwave:
```env
PAYMENT_PROVIDER=flutterwave
```

### To use Paystack:
```env
PAYMENT_PROVIDER=paystack
```

**That's it! No code changes needed.**

---

## 📊 Go Live Checklist

- [ ] Create Flutterwave account
- [ ] Get Test API keys
- [ ] Update Railway environment variables
- [ ] Update Vercel environment variables
- [ ] Test payment with test card
- [ ] Complete KYC verification
- [ ] Get Live API keys
- [ ] Switch to Live keys
- [ ] Test with real card (small amount)
- [ ] **GO LIVE!** 🚀

---

## 🆘 Troubleshooting

### Issue: "Invalid API keys"
**Solution**: Double-check keys in Railway/Vercel, ensure no extra spaces

### Issue: "Payment initialization failed"
**Solution**: Check Railway logs, verify PAYMENT_PROVIDER is set to "flutterwave"

### Issue: "Transaction not found"
**Solution**: Use transaction ID from Flutterwave, not reference

---

## 📞 Flutterwave Support

- **Email**: hi@flutterwavego.com
- **Phone**: +234 1 888 3881
- **Twitter**: @theflutterwave
- **Live Chat**: Available in dashboard

---

## 🎯 Next Steps

1. **Today**: Get test keys and test payment
2. **Tomorrow**: Complete KYC verification
3. **Thursday**: Get live keys and final testing
4. **Friday**: **LAUNCH!** 🎉

---

**Estimated Setup Time: 30 minutes**
**Go Live Time: 24-48 hours (KYC approval)**

Good luck! 🚀
