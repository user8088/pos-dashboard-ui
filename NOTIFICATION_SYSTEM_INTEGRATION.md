# Notification System Integration

## Overview
The notification system has been integrated into the POS Dashboard navbar, providing real-time alerts for important business events like transactions, rental due dates, and customer payment reminders.

## Features Implemented

### 1. Notification Service (`src/services/notificationService.js`)
A comprehensive service for managing notifications:
- **Get All Notifications**: Fetch all notifications with filters
- **Get Unread Notifications**: Get recent unread notifications (default: 10)
- **Get Unread Count**: Get count of unread notifications for badge
- **Mark as Read**: Mark individual notification as read
- **Mark All as Read**: Mark all unread notifications as read
- **Delete Notification**: Remove specific notification
- **Delete All Read**: Bulk delete read notifications
- **Get Statistics**: Notification stats by type
- **Check Due Rentals**: Manual trigger for rental due checks
- **Check Customer Dues**: Manual trigger for customer payment checks
- **Helper Functions**: 
  - `getNotificationIcon()`: Returns emoji based on type
  - `getNotificationColor()`: Returns color scheme based on type
  - `formatTime()`: Formats timestamp to relative time (e.g., "5 minutes ago")

### 2. Navbar Integration (`src/components/Navbars/AdminNavbarLinks.js`)
Updated the navbar to display real-time notifications:

#### Features:
- **🔔 Bell Icon with Badge**: Shows unread count (displays "99+" for counts over 99)
- **Auto-Refresh**: Fetches unread count every 30 seconds
- **Notification Dropdown**:
  - Header with "Mark all as read" button
  - Scrollable list of notifications (max height: 500px)
  - Loading state with spinner
  - Empty state when no notifications
  - Real-time data from backend API

- **Notification Items**:
  - Icon emoji based on notification type
  - Bold title
  - Message text
  - Relative timestamp ("5 minutes ago", "2 days ago", etc.)
  - Unread highlighting (blue background)
  - Click to mark as read

- **Notification Types** (with proper icons):
  - 🟢 **Transaction Created - Inflow** (Green up arrow)
  - 🔴 **Transaction Created - Outflow** (Red down arrow)
  - 🟠 **Rental Due Soon** (Clock icon, within 3 days)
  - 🔴 **Rental Overdue** (Warning triangle icon, past due date)
  - 🟣 **Customer Payment Due** (Credit card icon, outstanding balance)

## API Endpoints Used

All endpoints are documented in `API_DOCUMENTATION.md` (lines 431-839):

### Read Operations:
- `GET /core/notifications` - Get all notifications with filters
- `GET /core/notifications/unread` - Get unread notifications
- `GET /core/notifications/unread-count` - Get unread count
- `GET /core/notifications/{id}` - Get specific notification
- `GET /core/notifications/stats` - Get notification statistics

### Write Operations:
- `POST /core/notifications/{id}/read` - Mark as read
- `POST /core/notifications/read-all` - Mark all as read
- `DELETE /core/notifications/{id}` - Delete notification
- `DELETE /core/notifications/read/all` - Delete all read

### Trigger Operations:
- `POST /core/notifications/check/rentals` - Check for due/overdue rentals
- `POST /core/notifications/check/customers` - Check for customer payment dues

## Notification Types & Triggers

### 1. Transaction Created
**Trigger**: Automatically created when an admin creates a transaction (inflow/outflow)
**Visibility**: Admin only
**Data Includes**: Transaction title, type, amount, account name, creator

**Example:**
```
🔴 Outflow Transaction Created (Red down arrow icon)
Admin User created a outgoing transaction: Store Maintenance (PKR 2,500.00)
13 minutes ago
```

### 2. Rental Due Soon
**Trigger**: Created when rental is due within 3 days (via `/notifications/check/rentals`)
**Visibility**: All users
**Data Includes**: Item name, due date, days remaining

**Example:**
```
🟠 Rental Due Soon (Orange clock icon)
Projector rental is due in 2 day(s). Due date: 2025-10-03
2 hours ago
```

### 3. Rental Overdue
**Trigger**: Created when rental is past due date (via `/notifications/check/rentals`)
**Visibility**: All users
**Data Includes**: Item name, due date, days overdue

**Example:**
```
🔴 Rental Overdue (Red warning triangle icon)
Conference Room rental is 3 day(s) overdue. Was due: 2025-09-28
1 day ago
```

### 4. Customer Payment Due
**Trigger**: Created when customer has outstanding balance (via `/notifications/check/customers`)
**Visibility**: All users
**Data Includes**: Customer name, amount due, total bill, paid amount

**Example:**
```
🟣 Customer Payment Due (Purple credit card icon)
Jane Doe has an outstanding balance of PKR 17.50
3 days ago
```

## Role-Based Notification Access

### Admin Users:
- ✅ See all notifications (global notifications + assigned ones)
- ✅ Transaction notifications
- ✅ Rental notifications
- ✅ Customer payment notifications

### Staff Users:
- ✅ See notifications assigned to them
- ✅ Rental notifications
- ✅ Customer payment notifications
- ❌ Transaction notifications (admin-only feature)

## User Experience Features

### 1. Unread Badge
- Red circular badge on bell icon
- Shows count of unread notifications
- Displays "99+" for counts over 99
- Hides when count is 0

### 2. Auto-Refresh
- Unread count refreshes every 30 seconds
- Keeps users updated without manual refresh
- Minimal API calls for performance

### 3. Visual Indicators
- Unread notifications have light blue background
- Read notifications have transparent background
- Hover effect for better interaction
- Emoji icons for quick visual identification

### 4. Icon System
- **Transaction Inflow**: Green up arrow icon (FaArrowUp)
- **Transaction Outflow**: Red down arrow icon (FaArrowDown)
- **Rental Due Soon**: Orange clock icon (FaClock)
- **Rental Overdue**: Red warning triangle (FaExclamationTriangle)
- **Customer Payment**: Purple credit card icon (CreditIcon)
- Icons displayed in bordered boxes with proper spacing

### 5. Currency Formatting
- All amounts displayed in PKR (Pakistani Rupees)
- Format: `PKR 2,500.00`
- Automatically replaces dollar signs from backend
- Consistent formatting across all notification types

### 6. Actions
- Click notification to mark as read
- "Mark all as read" button in header
- Scrollable list for many notifications
- Loading spinner during fetch
- Blue dot indicator for unread items

### 7. Time Formatting
Smart relative time display:
- "Just now" - less than 1 minute
- "5 minutes ago" - less than 60 minutes
- "2 hours ago" - less than 24 hours
- "3 days ago" - less than 7 days
- Absolute date - 7+ days old

## Automated Notification Checks

For rental and customer payment notifications, you need to trigger checks. You can:

### Option 1: Manual Trigger (Frontend Button)
Add a button in admin dashboard to manually check:

```javascript
const checkAllDues = async () => {
  await notificationService.checkDueRentals();
  await notificationService.checkCustomerDues();
  toast({ title: "Checks completed", status: "success" });
};
```

### Option 2: Backend Scheduled Task (Recommended)
Set up Laravel cron jobs in `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    // Check rentals daily at 9 AM
    $schedule->command('notifications:check-rentals')->dailyAt('09:00');
    
    // Check customer dues daily at 10 AM
    $schedule->command('notifications:check-customers')->dailyAt('10:00');
}
```

### Option 3: Frontend Auto-Check on Dashboard Load
Add to main dashboard component:

```javascript
useEffect(() => {
  if (isAdmin) {
    notificationService.checkDueRentals();
    notificationService.checkCustomerDues();
  }
}, []);
```

## Files Created/Modified

### Created:
- `src/services/notificationService.js` - Notification API service with helper functions
- `NOTIFICATION_SYSTEM_INTEGRATION.md` - This documentation

### Modified:
- `src/components/Navbars/AdminNavbarLinks.js` - Integrated real notification system

## Testing Checklist

### Basic Functionality:
- [ ] Bell icon displays in navbar
- [ ] Unread count badge shows when notifications exist
- [ ] Badge hides when count is 0
- [ ] Clicking bell opens notification dropdown
- [ ] Notifications display with correct icons
- [ ] Relative time formatting works correctly

### Interactions:
- [ ] Clicking notification marks it as read
- [ ] Background changes from blue to transparent when read
- [ ] Unread count decreases when marking as read
- [ ] "Mark all as read" button works
- [ ] Toast notification appears after marking all as read
- [ ] Empty state shows when no notifications

### Auto-Refresh:
- [ ] Unread count updates every 30 seconds
- [ ] New notifications appear without page refresh
- [ ] Count badge updates automatically

### Notification Types:
- [ ] Transaction notifications appear (admin only)
- [ ] Rental due soon notifications appear
- [ ] Rental overdue notifications appear
- [ ] Customer payment due notifications appear
- [ ] Correct emoji icons for each type

### Role-Based Access:
- [ ] Admin sees all notification types
- [ ] Staff sees appropriate notifications (not transactions)
- [ ] Global notifications (user_id = null) visible to admins
- [ ] User-specific notifications visible to assigned user

## Usage Instructions

### For End Users:

1. **View Notifications**:
   - Look at the bell icon in the navbar
   - Red badge shows unread count
   - Click bell to open notification dropdown

2. **Read Notifications**:
   - Click any notification to mark it as read
   - Unread notifications have light blue background
   - Read notifications have white background

3. **Mark All as Read**:
   - Click "Mark all as read" button in dropdown header
   - All unread notifications will be marked as read
   - Success toast will confirm action

4. **Auto-Updates**:
   - Unread count refreshes every 30 seconds
   - No need to manually refresh page

### For Administrators:

1. **Transaction Notifications**:
   - Automatically created when you create transactions
   - All admins receive these notifications
   - Shows transaction details

2. **Manual Checks** (Optional):
   - Trigger rental checks to find due/overdue items
   - Trigger customer checks to find outstanding payments
   - Use API endpoints or set up cron jobs

3. **Managing Notifications**:
   - Click to mark individual as read
   - Use "Mark all as read" for bulk action
   - Notifications auto-refresh in background

## API Response Examples

### Unread Count Response:
```json
{
  "success": true,
  "unread_count": 5
}
```

### Unread Notifications Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "transaction_created",
      "title": "Outflow Transaction Created",
      "message": "Admin User created a outgoing transaction: Store Maintenance ($2500)",
      "data": { ... },
      "is_read": false,
      "created_at": "2025-10-01T09:30:00.000000Z"
    }
  ]
}
```

## Future Enhancements

Potential improvements:
1. **Push Notifications**: Browser push notifications for important alerts
2. **Sound Alerts**: Optional sound when new notification arrives
3. **Notification Center Page**: Full-page view of all notifications with advanced filtering
4. **Mark as Unread**: Ability to mark read notifications as unread
5. **Delete Individual**: Delete button on each notification
6. **Categories/Filters**: Filter by notification type in dropdown
7. **Priority Levels**: High/medium/low priority notifications
8. **Action Buttons**: Quick action buttons (e.g., "View Customer", "View Rental")
9. **Desktop Notifications**: System-level notifications
10. **Notification Preferences**: User settings for which notifications to receive

## Troubleshooting

### Notifications Not Showing:
1. Check if user is authenticated (token in localStorage)
2. Verify backend API is running and accessible
3. Check browser console for errors
4. Ensure notifications exist in database

### Unread Count Not Updating:
1. Check browser console for API errors
2. Verify auto-refresh interval is running
3. Check if API endpoint returns correct count

### Mark as Read Not Working:
1. Check network tab for API response
2. Verify user has permission to mark as read
3. Check if notification ID is valid

## Support

For issues or questions:
1. Check console logs for API errors
2. Verify backend endpoints in API_DOCUMENTATION.md (lines 431-839)
3. Test API endpoints directly with cURL or Postman
4. Check notification data structure in database
5. Review error messages in toast notifications

## Summary

The notification system is now fully integrated with:
- ✅ Real-time notification display
- ✅ Unread count badge
- ✅ Auto-refresh every 30 seconds
- ✅ Mark as read functionality
- ✅ Beautiful, intuitive UI
- ✅ Role-based access control
- ✅ Multiple notification types
- ✅ Relative time formatting

Users will now stay informed about important business events directly from the navbar! 🔔

