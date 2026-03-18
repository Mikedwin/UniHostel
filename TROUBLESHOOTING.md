# Quick Troubleshooting Guide - Manager Dashboard

## Before Testing
✅ Backend running on port 5000
✅ Frontend running on port 3000
✅ MongoDB connected
✅ Logged in as Manager
✅ Browser console open (F12)

## Step-by-Step Testing

### Test 1: Approve for Payment
1. Find application with status "PENDING"
2. Click checkmark (✓) button
3. **Expected Console Output:**
   ```
   === Status Update Request ===
   Application ID: [id]
   Action: approve_for_payment
   Token exists: true
   API Endpoint: http://localhost:5000/api/applications/[id]/status
   === Response Received ===
   Status: 200
   Data: { message: "Application approved for payment", ... }
   ```
4. **Expected Result:** Status changes to "APPROVED - AWAITING PAYMENT"

### Test 2: Reject Application
1. Find application with status "PENDING"
2. Click X button
3. **Expected Console Output:**
   ```
   === Status Update Request ===
   Action: reject
   === Response Received ===
   Status: 200
   ```
4. **Expected Result:** Status changes to "REJECTED"

### Test 3: Final Approve (After Payment)
1. Find application with status "PAID - AWAITING FINAL"
2. Click "Final Approve" button
3. **Expected Result:** 
   - Status changes to "APPROVED"
   - Access code displayed
   - Room occupancy increases

## Common Errors & Quick Fixes

### ❌ "Token exists: false"
**Problem:** Not logged in or token expired
**Fix:** Logout and login again

### ❌ "API Endpoint: https://unihostel.onrender.com/..."
**Problem:** Using production API instead of local
**Fix:** 
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check `api.js` has environment detection

### ❌ "Network Error" or "No response from server"
**Problem:** Backend not running or wrong port
**Fix:**
```bash
cd backend
npm run dev
```
Check it says "Server running on port 5000"

### ❌ "Not authorized to manage this application"
**Problem:** Manager doesn't own this hostel
**Fix:** 
- Check you're logged in as the correct manager
- Verify the hostel belongs to your account

### ❌ "Can only approve pending applications"
**Problem:** Application not in correct status
**Fix:** Check current status - only PENDING can be approved for payment

### ❌ CORS Error
**Problem:** Frontend origin not allowed
**Fix:** Backend should allow `http://localhost:3000` by default
Check `backend/server.js` CORS configuration

## Backend Logs to Check

When you click approve/reject, backend should show:
```
=== Application Status Update Request ===
Application ID: [id]
Action: approve_for_payment
User ID: [manager_id]
User role: manager
Application found: [id]
Current status: pending
Manager not authorized OR
Processing approve_for_payment
Application approved for payment
```

## Quick Health Check

### Frontend Health
```javascript
// In browser console
console.log(localStorage.getItem('token') ? 'Token exists' : 'No token');
```

### Backend Health
Visit: `http://localhost:5000/api/health`
Should return: `{ status: "healthy", database: { status: "connected" } }`

### API Connection Test
```javascript
// In browser console
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log('Backend:', d))
  .catch(e => console.error('Cannot reach backend:', e));
```

## Still Not Working?

1. **Check all logs:**
   - Browser console (frontend)
   - Terminal running backend
   - Look for red error messages

2. **Verify data:**
   - Application exists in database
   - Manager owns the hostel
   - Application status is correct

3. **Test with curl:**
   ```bash
   curl -X PATCH http://localhost:5000/api/applications/[APP_ID]/status \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer [YOUR_TOKEN]" \
     -d '{"action":"approve_for_payment"}'
   ```

4. **Check MongoDB:**
   - Application document exists
   - Hostel document exists
   - Manager ID matches

## Success Indicators

✅ Console shows "=== Response Received ===" with status 200
✅ Toast notification appears
✅ Application status updates in UI
✅ Backend logs show "Application approved for payment"
✅ No red errors in console or terminal

## Need More Help?

Check these files for detailed logs:
- `backend/logs/access.log` - All HTTP requests
- `backend/logs/error.log` - Error details
- Browser DevTools → Network tab - See actual HTTP requests
