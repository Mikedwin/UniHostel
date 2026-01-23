# ⚡ Quick Credential Rotation Checklist

## 🔴 URGENT - Complete in 20 Minutes

### ✅ Step 1: MongoDB Password (5 min)
- [ ] Go to https://cloud.mongodb.com/
- [ ] Database Access → Edit user `1mikedwin_db_user`
- [ ] Autogenerate new password
- [ ] Copy password
- [ ] Update `MONGO_URI` in `.env`

### ✅ Step 2: Paystack Keys (3 min)
- [ ] Go to https://dashboard.paystack.com/
- [ ] Settings → API Keys & Webhooks
- [ ] Regenerate Secret Key
- [ ] Copy new Secret Key and Public Key
- [ ] Update `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY` in `.env`

### ✅ Step 3: Admin Password (1 min)
- [ ] Generate strong password (20+ characters)
- [ ] Update `ADMIN_PASSWORD` in `.env`

### ✅ Step 4: Update Deployments (5 min)
- [ ] Update environment variables in backend hosting
- [ ] Update environment variables in frontend hosting (Vercel)
- [ ] Redeploy both frontend and backend

### ✅ Step 5: Test Everything (3 min)
- [ ] Test login
- [ ] Test hostel creation
- [ ] Test payment flow
- [ ] Verify no errors

### ✅ Step 6: Secure Git (3 min)
- [ ] Verify `.env` is in `.gitignore`
- [ ] Never commit `.env` again
- [ ] Consider removing from Git history (optional)

---

## 📝 Quick Commands

### Generate Strong Password:
```bash
node -e "console.log(require('crypto').randomBytes(24).toString('base64'))"
```

### Check if .env is tracked:
```bash
git ls-files | grep .env
```

### Add .env to .gitignore:
```bash
echo "backend/.env" >> .gitignore
git add .gitignore
git commit -m "Ensure .env is ignored"
```

---

## ⚠️ CRITICAL REMINDER

Your credentials are exposed in:
1. This chat conversation
2. Possibly Git history
3. Any screenshots or logs

**Rotating credentials makes the exposed ones useless.**

---

**Time Required:** 20 minutes  
**Priority:** CRITICAL  
**Status:** ⚠️ DO NOW
