# Notification System Implementation Guide

## Overview
This document describes the comprehensive notification system implemented for the POS Dashboard Backend. The system automatically notifies admins about transactions, rental due dates, and customer payment dues.

## Features Implemented

### 1. Database Schema
- **Table:** `notifications`
- **Fields:**
  - `id`: Primary key
  - `type`: Notification type (transaction_created, rental_due_soon, rental_overdue, customer_payment_due)
  - `title`: Notification title
  - `message`: Detailed notification message
  - `data`: JSON field for additional data (amounts, IDs, etc.)
  - `is_read`: Boolean flag for read status
  - `user_id`: Foreign key to users (null for admin-wide notifications)
  - `reference_type`: Polymorphic reference type (Transaction, RentalStock, Customer)
  - `reference_id`: Polymorphic reference ID
  - `created_at`, `updated_at`: Timestamps

### 2. Notification Model
- Created `app/Models/Notification.php`
- **Scopes:**
  - `unread()`: Get unread notifications
  - `read()`: Get read notifications
  - `ofType($type)`: Filter by notification type
  - `forUser($userId)`: Get user-specific or admin-wide notifications
- **Methods:**
  - `markAsRead()`: Mark notification as read
  - `markAsUnread()`: Mark notification as unread

### 3. Notification Controller
- Created `app/Http/Controllers/NotificationController.php`
- **Endpoints:**
  - `GET /api/core/notifications` - List all with filtering and pagination
  - `GET /api/core/notifications/unread` - Get unread notifications
  - `GET /api/core/notifications/unread-count` - Get unread count
  - `GET /api/core/notifications/{id}` - Get specific notification
  - `POST /api/core/notifications/{id}/read` - Mark as read
  - `POST /api/core/notifications/read-all` - Mark all as read
  - `DELETE /api/core/notifications/{id}` - Delete notification
  - `DELETE /api/core/notifications/read/all` - Delete all read
  - `GET /api/core/notifications/stats` - Get statistics
  - `POST /api/core/notifications/check/rentals` - Check due rentals
  - `POST /api/core/notifications/check/customers` - Check customer dues

### 4. Automatic Notifications

#### Transaction Notifications
- **Trigger:** When any admin creates a transaction (inflow/outflow)
- **Recipients:** All admins (user_id = null)
- **Implementation:** Modified `TransactionController::addTransaction()`
- **Data Included:**
  - Transaction ID, title, type, amount
  - Account name
  - Creator's name

#### Rental Due Soon
- **Trigger:** Manual check via `/notifications/check/rentals`
- **Condition:** Rental due within 3 days
- **Recipients:** All admins
- **Data Included:**
  - Rental ID, item name
  - Due date, days remaining

#### Rental Overdue
- **Trigger:** Manual check via `/notifications/check/rentals`
- **Condition:** Rental past due date
- **Recipients:** All admins
- **Data Included:**
  - Rental ID, item name
  - Due date, days overdue

#### Customer Payment Due
- **Trigger:** Manual check via `/notifications/check/customers`
- **Condition:** Customer has `bill_due > 0`
- **Recipients:** All admins
- **Data Included:**
  - Customer ID, name
  - Bill due, total bill, bill paid

### 5. Filtering and Search
- **By Type:** Filter notifications by specific type
- **By Read Status:** Filter read/unread
- **By Date Range:** Filter by creation date
- **Pagination:** 20 items per page (configurable)

### 6. Security Features
- **User Isolation:** Staff users only see their own notifications
- **Admin Access:** Admins see all notifications + user-specific ones
- **Protected Routes:** All notification endpoints require authentication
- **No Duplicates:** Checks prevent duplicate notifications for same event

## API Endpoints

### List Notifications
```http
GET /api/core/notifications
Authorization: Bearer {token}
Query Parameters:
  - type: transaction_created|rental_due_soon|rental_overdue|customer_payment_due
  - is_read: true|false
  - from_date: YYYY-MM-DD
  - to_date: YYYY-MM-DD
  - per_page: number (default: 20)
  - page: number
```

### Get Unread Count
```http
GET /api/core/notifications/unread-count
Authorization: Bearer {token}
```

### Mark as Read
```http
POST /api/core/notifications/{id}/read
Authorization: Bearer {token}
```

### Mark All as Read
```http
POST /api/core/notifications/read-all
Authorization: Bearer {token}
```

### Check Rentals
```http
POST /api/core/notifications/check/rentals
Authorization: Bearer {token}
```

### Check Customers
```http
POST /api/core/notifications/check/customers
Authorization: Bearer {token}
```

## Frontend Integration

### Display Unread Count in Header
```javascript
// In your app header/navbar component
import { useState, useEffect } from 'react';

function NotificationBadge() {
    const [unreadCount, setUnreadCount] = useState(0);
    
    useEffect(() => {
        fetchUnreadCount();
        
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);
    
    const fetchUnreadCount = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/core/notifications/unread-count', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setUnreadCount(data.unread_count);
    };
    
    return (
        <div className="notification-bell">
            <BellIcon />
            {unreadCount > 0 && (
                <span className="badge">{unreadCount}</span>
            )}
        </div>
    );
}
```

### Notification Dropdown
```javascript
function NotificationDropdown() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const fetchNotifications = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch('/api/core/notifications/unread?limit=5', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setNotifications(data.data);
        setLoading(false);
    };
    
    const markAsRead = async (notificationId) => {
        const token = localStorage.getItem('token');
        await fetch(`/api/core/notifications/${notificationId}/read`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchNotifications(); // Refresh list
    };
    
    return (
        <div className="notification-dropdown">
            <h3>Notifications</h3>
            {loading ? (
                <div>Loading...</div>
            ) : notifications.length === 0 ? (
                <div>No new notifications</div>
            ) : (
                <ul>
                    {notifications.map(notif => (
                        <li key={notif.id} onClick={() => markAsRead(notif.id)}>
                            <div className="title">{notif.title}</div>
                            <div className="message">{notif.message}</div>
                            <div className="time">{new Date(notif.created_at).toLocaleString()}</div>
                        </li>
                    ))}
                </ul>
            )}
            <a href="/notifications">View All</a>
        </div>
    );
}
```

### Full Notifications Page
```javascript
function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [filters, setFilters] = useState({ is_read: false });
    const [pagination, setPagination] = useState({});
    
    useEffect(() => {
        fetchNotifications();
    }, [filters]);
    
    const fetchNotifications = async (page = 1) => {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({ ...filters, page });
        const response = await fetch(`/api/core/notifications?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setNotifications(data.data);
        setPagination(data.pagination);
    };
    
    const markAllAsRead = async () => {
        const token = localStorage.getItem('token');
        await fetch('/api/core/notifications/read-all', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchNotifications();
    };
    
    const deleteNotification = async (id) => {
        const token = localStorage.getItem('token');
        await fetch(`/api/core/notifications/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchNotifications();
    };
    
    return (
        <div className="notifications-page">
            <div className="header">
                <h1>Notifications</h1>
                <button onClick={markAllAsRead}>Mark All as Read</button>
            </div>
            
            <div className="filters">
                <select onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                    <option value="">All Types</option>
                    <option value="transaction_created">Transactions</option>
                    <option value="rental_due_soon">Rentals Due Soon</option>
                    <option value="rental_overdue">Overdue Rentals</option>
                    <option value="customer_payment_due">Customer Payments</option>
                </select>
                
                <select onChange={(e) => setFilters({ ...filters, is_read: e.target.value })}>
                    <option value="">All</option>
                    <option value="false">Unread</option>
                    <option value="true">Read</option>
                </select>
            </div>
            
            <div className="notifications-list">
                {notifications.map(notif => (
                    <div 
                        key={notif.id} 
                        className={`notification-item ${notif.is_read ? 'read' : 'unread'}`}
                    >
                        <div className="type-badge">{notif.type}</div>
                        <div className="content">
                            <h3>{notif.title}</h3>
                            <p>{notif.message}</p>
                            <span className="time">{new Date(notif.created_at).toLocaleString()}</span>
                        </div>
                        <div className="actions">
                            {!notif.is_read && (
                                <button onClick={() => markAsRead(notif.id)}>Mark Read</button>
                            )}
                            <button onClick={() => deleteNotification(notif.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
            
            {pagination.last_page > 1 && (
                <div className="pagination">
                    {/* Pagination controls */}
                </div>
            )}
        </div>
    );
}
```

### Notification Icon by Type
```javascript
function NotificationIcon({ type }) {
    const icons = {
        'transaction_created': '💰',
        'rental_due_soon': '⏰',
        'rental_overdue': '⚠️',
        'customer_payment_due': '💳'
    };
    
    return <span className="notification-icon">{icons[type] || '🔔'}</span>;
}
```

## Setting Up Automated Checks

### Option 1: Laravel Scheduler (Recommended)

1. Edit `app/Console/Kernel.php`:
```php
<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\Http;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        // Check rentals every day at 9 AM
        $schedule->call(function () {
            $adminToken = env('ADMIN_TOKEN'); // Store in .env
            Http::withToken($adminToken)
                ->post(config('app.url') . '/api/core/notifications/check/rentals');
        })->dailyAt('09:00');
        
        // Check customer dues every day at 10 AM
        $schedule->call(function () {
            $adminToken = env('ADMIN_TOKEN');
            Http::withToken($adminToken)
                ->post(config('app.url') . '/api/core/notifications/check/customers');
        })->dailyAt('10:00');
    }
}
```

2. Add to your server's crontab:
```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

### Option 2: Manual Button in Frontend
```javascript
function AdminDashboard() {
    const checkRentals = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/core/notifications/check/rentals', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        alert(`Found ${data.rentals_due_soon} due soon, ${data.overdue_rentals} overdue`);
    };
    
    const checkCustomers = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/core/notifications/check/customers', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        alert(`Found ${data.customers_with_dues} customers with dues`);
    };
    
    return (
        <div>
            <button onClick={checkRentals}>Check Rentals</button>
            <button onClick={checkCustomers}>Check Customer Dues</button>
        </div>
    );
}
```

### Option 3: External Cron Job
Set up a cron job to call the endpoints directly:
```bash
# Check rentals daily at 9 AM
0 9 * * * curl -X POST "http://yourapi.com/api/core/notifications/check/rentals" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Check customers daily at 10 AM
0 10 * * * curl -X POST "http://yourapi.com/api/core/notifications/check/customers" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Files Created/Modified

### New Files:
- `database/migrations/2025_10_01_091444_create_notifications_table.php`
- `app/Models/Notification.php`
- `app/Http/Controllers/NotificationController.php`
- `NOTIFICATION_SYSTEM_IMPLEMENTATION.md`

### Modified Files:
- `routes/api.php` - Added notification routes
- `app/Http/Controllers/Core/TransactionController.php` - Added notification creation
- `API_DOCUMENTATION.md` - Added comprehensive notification documentation

## Testing

### Test Transaction Notification
```bash
# Create a transaction (as admin)
curl -X POST "http://localhost:8000/api/core/transactions" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Transaction",
    "type": "outflow",
    "amount": 100,
    "account_id": 1,
    "notes": "Testing notification"
  }'

# Check notifications
curl -X GET "http://localhost:8000/api/core/notifications" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Test Rental Checks
```bash
# Check rentals
curl -X POST "http://localhost:8000/api/core/notifications/check/rentals" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# View notifications
curl -X GET "http://localhost:8000/api/core/notifications?type=rental_due_soon" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Test Customer Dues
```bash
# Check customers
curl -X POST "http://localhost:8000/api/core/notifications/check/customers" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# View notifications
curl -X GET "http://localhost:8000/api/core/notifications?type=customer_payment_due" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Best Practices

1. **Polling Interval:** Fetch unread count every 30-60 seconds in your frontend
2. **Real-time Updates:** Consider implementing WebSockets for instant notifications
3. **Notification Cleanup:** Regularly delete old read notifications to keep database clean
4. **Mark as Read:** Automatically mark as read when user views notification details
5. **Batch Actions:** Provide "Mark All as Read" and "Delete All Read" options
6. **Sound Alerts:** Add sound notifications for important alerts (optional)
7. **Desktop Notifications:** Use browser notification API for desktop alerts (optional)

## Future Enhancements

Consider implementing:
- WebSocket/Pusher integration for real-time notifications
- Email notifications for critical alerts
- SMS notifications for urgent issues
- Notification preferences (allow users to choose what to be notified about)
- Notification groups/categories
- Snooze functionality
- In-app notification sound settings
- Push notifications for mobile apps

## Troubleshooting

### Notifications Not Creating
- Check database migration ran successfully
- Verify user has admin role for transaction notifications
- Check API endpoint permissions

### Duplicate Notifications
- Check logic prevents duplicates based on reference_id and is_read status
- Clear old notifications before running checks again

### Performance Issues
- Add database indexes (already included in migration)
- Implement pagination properly
- Consider caching unread count

## Support

All endpoints are documented in `API_DOCUMENTATION.md`. For implementation examples, refer to this guide.

