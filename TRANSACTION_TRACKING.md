# Transaction & Revenue Tracking System

## Overview
The Transaction & Revenue Tracking System provides comprehensive financial visibility for both Admin and Manager roles. It automatically records all successful payments and provides detailed analytics, filtering, and reporting capabilities.

## Key Features

### Automatic Transaction Recording
- **Trigger**: Transactions are automatically created when Paystack payment verification succeeds
- **Idempotency**: Duplicate transactions are prevented using payment reference as unique identifier
- **Data Captured**: Student info, hostel details, room type, semester, payment amounts, commission breakdown

### Admin Dashboard - Full Financial Visibility

#### Revenue Summary Cards
1. **Total Revenue**: System-wide revenue from all transactions
2. **Admin Commission**: Total platform earnings (configurable via `ADMIN_COMMISSION_PERCENT` in .env)
3. **Hostel Revenue**: Total earnings distributed to managers
4. **Total Transactions**: Count of successful payments

#### Semester-Based Analytics
- Revenue breakdown by First/Second Semester
- Shows total revenue, admin commission, and hostel revenue per semester
- Transaction count per semester

#### Hostel-Based Analytics
- Revenue breakdown by individual hostel
- Shows which hostels generate the most revenue
- Commission tracking per hostel
- Manager earnings per hostel

#### Transaction History Table
Displays all transactions with:
- Date of payment
- Student name and email
- Hostel name
- Manager name
- Room type
- Semester
- **Hostel Fee** (amount paid to manager)
- **Admin Commission** (platform earnings)
- **Total Amount** (student paid)
- Payment status

#### Advanced Filtering
- Filter by semester (First/Second)
- Filter by specific hostel
- Filter by specific manager
- Filter by date range (start and end date)
- Combine multiple filters

### Manager Dashboard - Restricted Financial View

#### Revenue Summary Cards
1. **Total Revenue**: Manager's earnings from their hostels only
2. **Total Transactions**: Count of payments for their hostels
3. **Average per Transaction**: Average revenue per booking

#### Semester-Based Analytics
- Revenue breakdown by semester for manager's hostels only
- Transaction count per semester

#### Transaction History Table
Displays transactions for manager's hostels with:
- Date of payment
- Student name and email
- Hostel name
- Room type
- Semester
- **Amount** (hostel fee only - NO admin commission visible)
- Payment status

#### Filtering Options
- Filter by semester
- Filter by specific hostel (from manager's listings)
- Filter by date range

**Security Note**: Managers CANNOT see:
- Admin commission amounts
- Total system revenue
- Other managers' transactions
- Financial data from other hostels

## Technical Implementation

### Database Schema

#### Transaction Model (`backend/models/Transaction.js`)
```javascript
{
  applicationId: ObjectId (ref: Application),
  studentId: ObjectId (ref: User),
  hostelId: ObjectId (ref: Hostel),
  managerId: ObjectId (ref: User),
  hostelFee: Number,
  adminCommission: Number,
  totalAmount: Number,
  roomType: String,
  semester: String,
  paymentReference: String (unique),
  paymentStatus: String (paid/refunded),
  paidAt: Date,
  refundedAt: Date,
  createdAt: Date
}
```

#### Indexes for Performance
- `applicationId` (indexed)
- `studentId` (indexed)
- `hostelId` (indexed)
- `managerId` (indexed)
- `paymentStatus` (indexed)
- `paidAt` (indexed)
- Compound indexes for common queries

### API Endpoints

#### Manager Transactions
```
GET /api/transactions/manager
Authorization: Bearer <token>
Role: manager

Query Parameters:
- semester: "First Semester" | "Second Semester"
- hostelId: ObjectId
- startDate: ISO Date
- endDate: ISO Date

Response:
{
  transactions: [...],
  summary: {
    totalRevenue: Number,
    totalTransactions: Number,
    bySemester: { ... }
  }
}
```

#### Admin Transactions
```
GET /api/transactions/admin
Authorization: Bearer <token>
Role: admin

Query Parameters:
- semester: "First Semester" | "Second Semester"
- hostelId: ObjectId
- managerId: ObjectId
- startDate: ISO Date
- endDate: ISO Date

Response:
{
  transactions: [...],
  summary: {
    totalRevenue: Number,
    totalHostelRevenue: Number,
    totalAdminCommission: Number,
    totalTransactions: Number,
    bySemester: { ... },
    byHostel: { ... }
  }
}
```

### Payment Flow Integration

#### Updated Payment Verification (`backend/routes/payment.js`)
1. Paystack webhook receives `charge.success` event
2. System verifies payment reference
3. **NEW**: Check if transaction already exists (idempotency)
4. **NEW**: Create transaction record with all financial details
5. Update application status to `paid_awaiting_final`
6. Manager can now issue final approval

#### Transaction Creation Logic
```javascript
const transaction = new Transaction({
  applicationId: application._id,
  studentId: application.studentId,
  hostelId: application.hostelId._id,
  managerId: application.hostelId.managerId,
  hostelFee: application.hostelFee,
  adminCommission: application.adminCommission,
  totalAmount: application.totalAmount,
  roomType: application.roomType,
  semester: application.semester,
  paymentReference: reference,
  paymentStatus: 'paid',
  paidAt: new Date()
});
await transaction.save();
```

## Frontend Components

### Manager Dashboard Integration
- **Location**: `frontend/src/pages/ManagerDashboard.js`
- **Component**: `ManagerTransactions` (`frontend/src/components/manager/ManagerTransactions.js`)
- **Access**: New "Transactions" tab in Manager Dashboard
- **Icon**: DollarSign icon

### Admin Dashboard Integration
- **Location**: `frontend/src/pages/AdminDashboard.js`
- **Component**: `AdminTransactions` (`frontend/src/components/admin/AdminTransactions.js`)
- **Access**: New "Transactions" tab in Admin Dashboard (positioned after Analytics)

## Usage Guide

### For Managers

1. **View Revenue**
   - Navigate to Manager Dashboard
   - Click "Transactions" tab
   - View total revenue and transaction count

2. **Filter Transactions**
   - Select semester from dropdown
   - Select specific hostel (if you have multiple)
   - Set date range
   - Click "Apply Filters"

3. **Export Data**
   - Click "Export" button (future enhancement)
   - Download transaction history as CSV/PDF

### For Admins

1. **View System-Wide Revenue**
   - Navigate to Admin Dashboard
   - Click "Transactions" tab
   - View total revenue, commission, and hostel earnings

2. **Analyze by Semester**
   - Scroll to "Revenue by Semester" section
   - Compare First vs Second Semester performance
   - View commission breakdown

3. **Analyze by Hostel**
   - Scroll to "Revenue by Hostel" section
   - Identify top-performing hostels
   - View commission per hostel

4. **Advanced Filtering**
   - Filter by semester, hostel, manager, or date range
   - Combine multiple filters for detailed analysis
   - Click "Apply Filters" to update view

## Configuration

### Admin Commission Rate
Set in `backend/.env`:
```
ADMIN_COMMISSION_PERCENT=3
```
This determines the percentage of each booking that goes to the platform.

**Example Calculation**:
- Room Price: GH₵1000
- Commission (3%): GH₵30
- Total Student Pays: GH₵1030
- Manager Receives: GH₵1000
- Admin Receives: GH₵30

## Security Features

1. **Role-Based Access Control**
   - Managers can only see their own hostel transactions
   - Admins can see all transactions
   - Students cannot access transaction endpoints

2. **Data Filtering**
   - Manager endpoint automatically filters by `managerId`
   - Admin commission hidden from manager responses
   - Sensitive financial data protected

3. **Idempotency**
   - Duplicate transactions prevented
   - Payment reference used as unique identifier
   - Safe webhook retry handling

## Future Enhancements

### Planned Features
- [ ] Export to CSV/PDF
- [ ] Refund tracking and processing
- [ ] Revenue charts and graphs
- [ ] Email notifications for new transactions
- [ ] Monthly/Yearly revenue reports
- [ ] Payment method breakdown
- [ ] Failed transaction tracking
- [ ] Dispute management integration

### Potential Improvements
- [ ] Real-time transaction updates (WebSocket)
- [ ] Automated payout scheduling
- [ ] Tax calculation and reporting
- [ ] Multi-currency support
- [ ] Invoice generation
- [ ] Payment reconciliation tools

## Troubleshooting

### Transactions Not Appearing

**Issue**: Payment successful but no transaction record

**Solutions**:
1. Check Paystack webhook is configured correctly
2. Verify `PAYSTACK_SECRET_KEY` in .env
3. Check backend logs for webhook errors
4. Ensure payment reference is unique
5. Verify application has `hostelId` populated

### Incorrect Commission Calculation

**Issue**: Commission amounts don't match expected values

**Solutions**:
1. Verify `ADMIN_COMMISSION_PERCENT` in .env
2. Check application model has correct `adminCommission` field
3. Ensure commission calculated before payment initialization
4. Review payment initialization logic in `backend/routes/payment.js`

### Manager Seeing Wrong Transactions

**Issue**: Manager sees transactions from other hostels

**Solutions**:
1. Verify JWT token contains correct user ID
2. Check transaction query filters by `managerId`
3. Ensure hostel `managerId` field is correctly set
4. Review transaction route authorization middleware

## Testing Checklist

### Manager Dashboard
- [ ] Revenue summary displays correctly
- [ ] Transactions filtered by manager's hostels only
- [ ] Admin commission NOT visible
- [ ] Semester filter works
- [ ] Hostel filter works (if multiple hostels)
- [ ] Date range filter works
- [ ] Transaction table shows correct data

### Admin Dashboard
- [ ] Total revenue includes all transactions
- [ ] Admin commission calculated correctly
- [ ] Hostel revenue calculated correctly
- [ ] Semester breakdown accurate
- [ ] Hostel breakdown accurate
- [ ] All filters work correctly
- [ ] Transaction table shows all fields including commission

### Payment Flow
- [ ] Transaction created on successful payment
- [ ] No duplicate transactions created
- [ ] All financial fields populated correctly
- [ ] Transaction appears immediately in dashboards
- [ ] Webhook handles retries gracefully

## Support

For issues or questions:
1. Check backend logs: `npm run dev` in backend folder
2. Check browser console for frontend errors
3. Verify database connection and Transaction collection
4. Review Paystack webhook logs in Paystack dashboard
5. Ensure all environment variables are set correctly

## Conclusion

The Transaction & Revenue Tracking System provides complete financial transparency for admins while maintaining appropriate privacy for managers. It automatically captures all payment data, provides powerful filtering and analytics, and maintains data integrity through idempotent transaction creation.
