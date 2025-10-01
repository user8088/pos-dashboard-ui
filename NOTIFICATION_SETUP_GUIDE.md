# Notification System Quick Setup Guide

## ✅ What's Been Implemented

The notification system is now fully functional! Here's what you have:

### Notification Types
1. **Transaction Created** - Notifies admins when transactions are added
2. **Rental Due Soon** - Alerts when rentals are due within 3 days
3. **Rental Overdue** - Alerts when rentals pass their due date
4. **Customer Payment Due** - Notifies about outstanding customer balances

### API Endpoints (11 Total)
```
GET    /api/core/notifications              - List all (with filters)
GET    /api/core/notifications/unread       - Get unread only
GET    /api/core/notifications/unread-count - Get count
GET    /api/core/notifications/{id}         - Get specific
POST   /api/core/notifications/{id}/read    - Mark as read
POST   /api/core/notifications/read-all     - Mark all as read
DELETE /api/core/notifications/{id}         - Delete one
DELETE /api/core/notifications/read/all     - Delete all read
GET    /api/core/notifications/stats        - Get statistics
POST   /api/core/notifications/check/rentals   - Check rentals
POST   /api/core/notifications/check/customers - Check customers
```

## 🚀 Testing the System

### 1. Database Already Migrated ✓
The notifications table has been created automatically.

### 2. Test Transaction Notification

Create a transaction (as admin):
```bash
curl -X POST "http://localhost:8000/api/core/transactions" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Transaction",
    "type": "outflow",
    "amount": 100,
    "account_id": 1,
    "notes": "Testing notification system"
  }'
```

Check notifications:
```bash
curl -X GET "http://localhost:8000/api/core/notifications" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Test Rental Checks

```bash
# Check for due rentals
curl -X POST "http://localhost:8000/api/core/notifications/check/rentals" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# View rental notifications
curl -X GET "http://localhost:8000/api/core/notifications?type=rental_due_soon" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 4. Test Customer Dues

```bash
# Check customers with dues
curl -X POST "http://localhost:8000/api/core/notifications/check/customers" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# View customer notifications
curl -X GET "http://localhost:8000/api/core/notifications?type=customer_payment_due" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 5. Test Marking as Read

```bash
# Get unread count
curl -X GET "http://localhost:8000/api/core/notifications/unread-count" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Mark specific notification as read
curl -X POST "http://localhost:8000/api/core/notifications/1/read" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Mark all as read
curl -X POST "http://localhost:8000/api/core/notifications/read-all" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🎨 Frontend Implementation

### Step 1: Add Notification Bell in Header
```javascript
import { useState, useEffect } from 'react';

function NotificationBell() {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        fetchCount();
        const interval = setInterval(fetchCount, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);
    
    const fetchCount = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/core/notifications/unread-count', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setCount(data.unread_count);
    };
    
    return (
        <div className="notification-bell" onClick={() => window.location.href='/notifications'}>
            🔔
            {count > 0 && <span className="badge">{count}</span>}
        </div>
    );
}
```

### Step 2: Create Notifications Page
```javascript
function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    
    useEffect(() => {
        fetchNotifications();
    }, [filter]);
    
    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');
        const url = filter === 'all' 
            ? '/api/core/notifications'
            : `/api/core/notifications?type=${filter}`;
            
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setNotifications(data.data);
    };
    
    const markAsRead = async (id) => {
        const token = localStorage.getItem('token');
        await fetch(`/api/core/notifications/${id}/read`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchNotifications();
    };
    
    return (
        <div>
            <h1>Notifications</h1>
            
            {/* Filter Buttons */}
            <div className="filters">
                <button onClick={() => setFilter('all')}>All</button>
                <button onClick={() => setFilter('transaction_created')}>Transactions</button>
                <button onClick={() => setFilter('rental_due_soon')}>Rentals Due</button>
                <button onClick={() => setFilter('rental_overdue')}>Overdue</button>
                <button onClick={() => setFilter('customer_payment_due')}>Customer Dues</button>
            </div>
            
            {/* Notifications List */}
            <div className="notifications">
                {notifications.map(notif => (
                    <div 
                        key={notif.id} 
                        className={`notification ${notif.is_read ? 'read' : 'unread'}`}
                        onClick={() => markAsRead(notif.id)}
                    >
                        <h3>{notif.title}</h3>
                        <p>{notif.message}</p>
                        <small>{new Date(notif.created_at).toLocaleString()}</small>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

### Step 3: Add CSS Styling
```css
.notification-bell {
    position: relative;
    cursor: pointer;
    font-size: 24px;
}

.notification-bell .badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: red;
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 12px;
}

.notification {
    padding: 15px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background 0.2s;
}

.notification:hover {
    background: #f5f5f5;
}

.notification.unread {
    background: #e3f2fd;
    font-weight: bold;
}

.notification h3 {
    margin: 0 0 5px 0;
    font-size: 16px;
}

.notification p {
    margin: 0 0 5px 0;
    color: #666;
}

.notification small {
    color: #999;
    font-size: 12px;
}
```

## ⚙️ Setting Up Automated Checks

### Option 1: Laravel Scheduler (Recommended)

1. Create/edit `app/Console/Kernel.php`:
```php
protected function schedule(Schedule $schedule)
{
    // Check rentals daily at 9 AM
    $schedule->call(function () {
        Http::withToken(env('ADMIN_API_TOKEN'))
            ->post(url('/api/core/notifications/check/rentals'));
    })->dailyAt('09:00');
    
    // Check customer dues daily at 10 AM
    $schedule->call(function () {
        Http::withToken(env('ADMIN_API_TOKEN'))
            ->post(url('/api/core/notifications/check/customers'));
    })->dailyAt('10:00');
}
```

2. Add admin token to `.env`:
```env
ADMIN_API_TOKEN=your_admin_bearer_token_here
```

3. Add to server crontab:
```bash
* * * * * cd /path/to/your/project && php artisan schedule:run >> /dev/null 2>&1
```

### Option 2: Manual Button (For Testing)
```javascript
function AdminPanel() {
    const checkRentals = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/core/notifications/check/rentals', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        alert(`Checked! Due soon: ${data.rentals_due_soon}, Overdue: ${data.overdue_rentals}`);
    };
    
    const checkCustomers = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/core/notifications/check/customers', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        alert(`Found ${data.customers_with_dues} customers with outstanding payments`);
    };
    
    return (
        <div>
            <button onClick={checkRentals}>Check Rentals Now</button>
            <button onClick={checkCustomers}>Check Customer Dues Now</button>
        </div>
    );
}
```

## 📊 Notification Filters

You can filter notifications in your frontend:

```javascript
// Get only unread
const unread = await fetch('/api/core/notifications?is_read=false', {
    headers: { 'Authorization': `Bearer ${token}` }
});

// Get only transactions
const transactions = await fetch('/api/core/notifications?type=transaction_created', {
    headers: { 'Authorization': `Bearer ${token}` }
});

// Get by date range
const recent = await fetch('/api/core/notifications?from_date=2025-10-01&to_date=2025-10-31', {
    headers: { 'Authorization': `Bearer ${token}` }
});

// Combine filters
const filtered = await fetch('/api/core/notifications?type=rental_due_soon&is_read=false', {
    headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🎯 Key Features

1. **Automatic Transaction Notifications** ✓
   - Created automatically when admin adds transaction
   - No additional code needed

2. **Rental Due Alerts** ✓
   - Call `/notifications/check/rentals` to scan
   - Notifies 3 days before due date
   - Also checks for overdue rentals

3. **Customer Payment Reminders** ✓
   - Call `/notifications/check/customers` to scan
   - Finds all customers with `bill_due > 0`
   - Creates notifications for each

4. **Read/Unread Status** ✓
   - Mark individual as read
   - Mark all as read
   - Filter by read status

5. **Pagination** ✓
   - 20 items per page (configurable)
   - Full pagination data in response

6. **Statistics** ✓
   - Total, read, unread counts
   - Counts by notification type

## 📚 Documentation

- **Full API Docs**: `API_DOCUMENTATION.md` (sections 71-81)
- **Implementation Guide**: `NOTIFICATION_SYSTEM_IMPLEMENTATION.md`
- **This Quick Start**: `NOTIFICATION_SETUP_GUIDE.md`

## 🐛 Common Issues

**No notifications showing?**
- Check if you're logged in as admin
- Verify database migration ran: `php artisan migrate:status`
- Create a test transaction to generate notification

**Rental checks not finding anything?**
- Make sure you have rentals with `stock_status = 'rented'`
- Ensure rentals have `rented_till` date set
- Check dates are in correct format (YYYY-MM-DD)

**Can't mark as read?**
- Verify notification ID exists
- Check authentication token is valid
- Ensure user has permission to view the notification

## ✨ Next Steps

1. ✅ Test all endpoints with Postman/curl
2. ✅ Add notification bell to your header
3. ✅ Create notifications page
4. ✅ Set up automated checks (scheduler or manual buttons)
5. ✅ Style notifications to match your design
6. 🎨 Add sound/desktop notifications (optional)
7. 🎨 Implement real-time with WebSockets (optional)

## 🎉 You're All Set!

The notification system is fully functional and ready to use. All notifications are automatically created and managed. Just integrate the frontend components and you're done!

