# Quick Start: Testing Admin Application Intervention Module

## Access the Feature

1. **Login as Admin**:
   - Go to: https://uni-hostel-two.vercel.app/login
   - Use Manager Login option
   - Email: `1mikedwin@gmail.com`
   - Password: `GguzgpD0t5XXe0ms`

2. **Navigate to Applications Tab**:
   - Click "Admin Dashboard" in navbar
   - Click "Applications" tab (6th tab)

## Test Scenarios

### Scenario 1: View and Filter Applications
1. You should see all applications in a table
2. Try the search box - search by student name
3. Use status filter - select "Pending"
4. Use dispute filter - select "With Disputes"
5. Click "Apply Filters"

### Scenario 2: View Application Details
1. Click the eye icon (👁️) on any application
2. Modal opens showing:
   - Student information
   - Hostel information
   - Application status
   - Any admin notes
   - Dispute information (if applicable)
3. Click "Close" to exit

### Scenario 3: Approve an Application
1. Find a pending application
2. Click the green checkmark icon (✓)
3. Modal opens asking for reason
4. Enter reason: "Student meets all requirements"
5. Click "Confirm"
6. Success message appears
7. Application status changes to "Approved"
8. Check hostel room capacity - should increase by 1

### Scenario 4: Reject an Application
1. Find a pending application
2. Click the red X icon (✗)
3. Modal opens asking for reason
4. Enter reason: "Incomplete documentation"
5. Click "Confirm"
6. Success message appears
7. Application status changes to "Rejected"

### Scenario 5: Add Internal Note
1. Click the purple document icon (📄) on any application
2. Modal opens with note form
3. Enter note: "Student called to verify contact number"
4. Optionally check "Make visible to hostel manager"
5. Click "Confirm"
6. View application details to see the note

### Scenario 6: Create a Dispute
1. Click the orange warning icon (⚠️) on any application
2. Modal opens with dispute form
3. Enter dispute reason: "Payment discrepancy"
4. Enter details: "Student claims payment was made but not reflected"
5. Click "Confirm"
6. Application now shows orange "Dispute" badge
7. Filter by "With Disputes" to see it

### Scenario 7: Resolve a Dispute
1. Find an application with dispute
2. Click the orange warning icon (⚠️)
3. Modal opens with resolution form
4. Enter resolution: "Payment verified and confirmed"
5. Optionally change status (e.g., to "Approved")
6. Click "Confirm"
7. Dispute status changes to "Resolved"

### Scenario 8: Bulk Actions
1. Check the checkbox next to 2-3 applications
2. Blue toolbar appears showing selected count
3. Click "Bulk Approve" or "Bulk Reject"
4. Enter reason when prompted
5. Confirm the action
6. Success message shows how many succeeded/failed
7. All selected applications update

### Scenario 9: Override Previously Approved Application
1. Find an approved application
2. Click the red X icon to reject it
3. Enter reason: "Student withdrew application"
4. Click "Confirm"
5. Status changes to "Rejected"
6. Application shows purple "Admin Override" badge
7. Check hostel room capacity - should decrease by 1

### Scenario 10: Verify Admin Protection
1. Go to "Users" tab
2. Find an admin user (role: admin)
3. Notice delete button is disabled/hidden
4. Try to suspend - should show error
5. Admin accounts are protected

## What to Look For

### Visual Indicators
- ✅ **Green badge**: Approved status
- ❌ **Red badge**: Rejected status
- ⏳ **Yellow badge**: Pending status
- 🟣 **Purple badge**: Admin Override applied
- 🟠 **Orange badge**: Has Dispute

### Success Confirmations
- Green notification appears bottom-right
- Table refreshes automatically
- Status updates immediately
- Room capacity changes reflect

### Error Handling
- Clear error messages if action fails
- Validation prevents invalid actions
- Capacity checks prevent overbooking

## Verify Audit Trail

1. Go to "Logs" tab in Admin Dashboard
2. Look for recent entries:
   - `OVERRIDE_APPLICATION`
   - `ADD_APPLICATION_NOTE`
   - `CREATE_DISPUTE`
   - `RESOLVE_DISPUTE`
   - `BULK_APPROVE_APPLICATION`
   - `BULK_REJECT_APPLICATION`
3. Each log shows:
   - Admin who performed action
   - Timestamp
   - Details of what was done

## Check Room Capacity Updates

1. Go to "Hostels" tab
2. Find a hostel with applications
3. Note the room capacity numbers
4. Approve an application for that hostel
5. Go back to "Hostels" tab
6. Verify occupied capacity increased by 1
7. Reject a previously approved application
8. Verify occupied capacity decreased by 1

## Test on Different Devices

- Desktop browser
- Mobile browser (responsive design)
- Different screen sizes

## Common Issues & Solutions

### Issue: Can't see applications
**Solution**: Make sure you're logged in as admin and on the "Applications" tab

### Issue: Bulk actions not working
**Solution**: Ensure you've selected applications using checkboxes first

### Issue: Modal not opening
**Solution**: Refresh the page and try again

### Issue: Success message not showing
**Solution**: Check browser console for errors, may need to refresh

### Issue: Room capacity not updating
**Solution**: Refresh the hostels tab to see updated numbers

## Next Steps After Testing

1. ✅ Verify all features work as expected
2. ✅ Check audit logs are being created
3. ✅ Confirm room capacity updates correctly
4. ✅ Test bulk actions with multiple applications
5. ✅ Verify admin protection is enforced
6. ✅ Test dispute workflow end-to-end
7. ✅ Confirm notes are saved and visible

## Report Issues

If you find any bugs or unexpected behavior:
1. Note the exact steps to reproduce
2. Check browser console for errors
3. Check AdminLog for any failed actions
4. Verify database connection is stable

## Feature Highlights

✨ **Complete Control**: Admin can override any application decision
🔒 **Audit Trail**: Every action is logged with timestamp and reason
⚡ **Bulk Operations**: Process multiple applications at once
📝 **Internal Notes**: Track communication and decisions
⚠️ **Dispute Management**: Handle conflicts systematically
💰 **Refund Support**: Ready for payment integration
🛡️ **Admin Protection**: Admin accounts cannot be deleted
🔄 **Auto-Updates**: Room capacity adjusts automatically

Enjoy managing applications with full control and transparency! 🎉
