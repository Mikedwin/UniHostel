# Manager-First Approval Flow - Implementation Summary

## New Application & Payment Flow

### Flow Overview
```
Student Applies → Manager Approves for Payment → Student Pays → Manager Final Approval → Access Code Issued
```

## Detailed Step-by-Step Process

### Step 1: Student Applies (No Payment)
**What Happens:**
- Student clicks "Apply for this Room" on hostel detail page
- Fills in: Name, Contact Number, Semester
- Clicks "Submit Application"
- Application created with status: `pending`
- **NO payment page or button appears**

**Database:**
```javascript
{
  status: 'pending',
  paymentStatus: 'pending',
  hostelFee: 1000,
  adminCommission: 100,
  totalAmount: 1100
}
```

---

### Step 2: Manager Reviews & Approves for Payment
**What Happens:**
- Manager sees application in dashboard
- Manager clicks "Approve for Payment" button
- Application status changes to: `approved_for_payment`
- Student is notified (dashboard shows "Approved - Proceed to Payment")
- **Room occupancy does NOT change yet**

**API Endpoint:**
```
PATCH /api/applications/:id/status
Body: { action: 'approve_for_payment' }
```

**Database:**
```javascript
{
  status: 'approved_for_payment',
  paymentStatus: 'pending'
}
```

---

### Step 3: Student Makes Payment
**What Happens:**
- Student sees "Proceed to Payment" button in dashboard
- Clicks button → Redirected to Paystack
- Makes single payment (hostel fee + admin commission)
- Payment automatically splits:
  - Manager receives: GH₵1000
  - Admin receives: GH₵100

**API Endpoint:**
```
POST /api/payment/initialize
Body: { applicationId: 'xxx' }
```

**Database After Payment:**
```javascript
{
  status: 'paid_awaiting_final',
  paymentStatus: 'paid',
  paidAt: Date,
  paymentReference: 'UNI-xxx'
}
```

---

### Step 4: Manager Final Approval
**What Happens:**
- Manager sees "Paid - Awaiting Final Approval" in dashboard
- Manager clicks "Final Approve" button
- **NOW room occupancy increases**
- Room may become full if capacity reached
- Access code is generated

**API Endpoint:**
```
PATCH /api/applications/:id/status
Body: { action: 'final_approve' }
```

**Database:**
```javascript
{
  status: 'approved',
  paymentStatus: 'paid',
  accessCode: 'UNI-1234567890-ABC123',
  accessCodeIssuedAt: Date,
  finalApprovedAt: Date
}
```

**Room Occupancy:**
```javascript
{
  occupiedCapacity: 2, // Increased by 1
  totalCapacity: 3,
  available: true
}
```

---

### Step 5: Student Receives Access Code
**What Happens:**
- Student sees access code in dashboard
- Student can now access the room with this code
- Application status: "Approved"

---

## Application Status Flow

```
pending
  ↓ (Manager approves for payment)
approved_for_payment
  ↓ (Student pays)
paid_awaiting_final
  ↓ (Manager final approval)
approved (with access code)
```

**OR**

```
pending
  ↓ (Manager rejects)
rejected
```

---

## Key Changes from Previous System

### Before (Old System)
1. Student applies → Payment immediately
2. Manager approves → Room allocated

### After (New System)
1. Student applies → No payment
2. Manager approves for payment → Payment enabled
3. Student pays → Still no room allocation
4. Manager final approval → Room allocated + Access code

---

## Database Schema Changes

### Application Model
```javascript
{
  // Status now has 5 states instead of 3
  status: {
    type: String,
    enum: [
      'pending',                // Step 1: Awaiting manager review
      'approved_for_payment',   // Step 2: Manager approved, awaiting payment
      'paid_awaiting_final',    // Step 3: Paid, awaiting final approval
      'approved',               // Step 4: Finally approved with access code
      'rejected'                // Rejected by manager
    ]
  },
  
  // New fields
  accessCode: String,           // Generated on final approval
  accessCodeIssuedAt: Date,     // When code was issued
  finalApprovedAt: Date         // When finally approved
}
```

---

## API Endpoints

### Student Endpoints
```
POST /api/applications
- Submit application (Step 1)
- No payment required

POST /api/payment/initialize
- Initialize payment (Step 3)
- Requires: applicationId
- Only works if status = 'approved_for_payment'

GET /api/applications/student
- View all applications with status and access codes
```

### Manager Endpoints
```
PATCH /api/applications/:id/status
- Approve for payment: { action: 'approve_for_payment' }
- Reject: { action: 'reject' }
- Final approve: { action: 'final_approve' }

GET /api/applications/manager
- View all applications for managed hostels
```

---

## Frontend Changes

### HostelDetail Page
- **Removed**: Payment breakdown, "Pay & Apply" button
- **Added**: Simple "Apply for this Room" button
- **Behavior**: Submits application, redirects to dashboard

### StudentDashboard Page (Needs Update)
- **Show status badges**:
  - Pending: Yellow badge
  - Approved for Payment: Blue badge with "Proceed to Payment" button
  - Paid Awaiting Final: Orange badge
  - Approved: Green badge with access code display
  - Rejected: Red badge

### ManagerDashboard Page (Needs Update)
- **Show action buttons based on status**:
  - Pending: "Approve for Payment" | "Reject"
  - Approved for Payment: "Waiting for student payment..."
  - Paid Awaiting Final: "Final Approve" button
  - Approved: Show access code
  - Rejected: No actions

---

## Room Occupancy Logic

### When Occupancy Changes
- **Increases**: Only on final approval (Step 4)
- **Decreases**: Never (unless admin manually resets)

### When Room Becomes Full
- After final approval, if `occupiedCapacity >= totalCapacity`
- Room status changes to `available: false`
- Students can still apply (over-application allowed)
- Manager cannot final approve if room is full

---

## Access Code Format
```
UNI-{timestamp}-{random6chars}
Example: UNI-1704067200000-A3B9C2
```

---

## Testing Checklist

### Student Flow
- [ ] Apply for room without payment
- [ ] See "Pending" status in dashboard
- [ ] After manager approval, see "Proceed to Payment" button
- [ ] Click payment button, complete payment
- [ ] See "Paid - Awaiting Final Approval" status
- [ ] After final approval, see access code

### Manager Flow
- [ ] See pending applications
- [ ] Click "Approve for Payment"
- [ ] See "Approved for Payment" status
- [ ] After student pays, see "Paid - Awaiting Final Approval"
- [ ] Click "Final Approve"
- [ ] See access code generated
- [ ] Verify room occupancy increased

### Edge Cases
- [ ] Cannot pay before manager approval
- [ ] Cannot final approve before payment
- [ ] Cannot final approve if room is full
- [ ] Access code is unique
- [ ] Room occupancy only changes on final approval

---

## Migration Notes

### Existing Applications
- Old applications with status "approved" remain unchanged
- New flow only applies to new applications
- No data migration needed

### Backward Compatibility
- All existing features remain intact
- Browse hostels, view details, manager dashboard all work as before
- Only application submission and approval flow changed

---

## Next Steps (Frontend Updates Needed)

1. **Update StudentDashboard.js**
   - Add "Proceed to Payment" button for `approved_for_payment` status
   - Display access code for `approved` status
   - Show appropriate status badges

2. **Update ManagerDashboard.js**
   - Add "Approve for Payment" button for `pending` status
   - Add "Final Approve" button for `paid_awaiting_final` status
   - Display access codes for approved applications
   - Update status display logic

3. **Update PaymentVerify.js**
   - Update success message to mention "awaiting final approval"

---

## Benefits of New Flow

1. **Manager Control**: Manager decides who can pay before money is collected
2. **No Wasted Payments**: Students only pay after manager approval
3. **Better Capacity Management**: Room allocation happens after payment confirmation
4. **Access Control**: Unique access codes for each approved student
5. **Audit Trail**: Clear status progression for tracking
