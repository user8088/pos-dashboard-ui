# User Management Integration

## Overview
This document describes the user management system integrated into the POS Dashboard, including role-based access control (RBAC) for admin and staff users.

## Features Implemented

### 1. User Management Service (`src/services/userService.js`)
A dedicated service for handling all user management operations:
- **Get All Users**: Fetch list of all users in the system
- **Get User by ID**: Retrieve specific user details
- **Create User**: Add new users (admin only)
- **Update User**: Modify existing user information
- **Delete User**: Remove users from system
- **Get User Statistics**: Dashboard statistics (total users, admin count, staff count, recent users)
- **Role Verification**: Check if current user is admin

### 2. User Management Screen (`src/views/Dashboard/UserManagement/index.js`)
A complete admin-only interface for managing system users:

#### Features:
- **Statistics Dashboard**: Display cards showing:
  - Total Users
  - Admin Users count
  - Staff Users count
  - Recent Users (last 30 days)

- **User Table**: 
  - View all users with name, email, role, and creation date
  - Search and filter capabilities
  - Responsive design for mobile/tablet/desktop

- **Create User Modal**:
  - Name (required)
  - Email (required, unique)
  - Password (required, min 8 characters)
  - Role selection (Admin/Staff)
  - Role description tooltips

- **Edit User Modal**:
  - Update name and email
  - Change user role
  - Optional password update (leave blank to keep existing)
  - Prevention of last admin demotion/deletion

- **Delete User**:
  - Confirmation dialog
  - Protection against self-deletion
  - Protection against deleting last admin

## Role-Based Access Control (RBAC)

### Admin Role
Full system access including:
- ✅ User Management (create, edit, delete users)
- ✅ Expense Management (accounts, revenue, allocations, transfers)
- ✅ Transactions
- ✅ All stock, rental, customer operations
- ✅ Sales & Manufacturing analytics

### Staff Role
Limited access:
- ✅ Stock Management
- ✅ Customer Management
- ✅ Rental Management
- ✅ Sales Analytics
- ❌ User Management (completely hidden)
- ❌ Expense Management (completely hidden)
- ❌ Transactions (no access)

## Implementation Details

### 1. Route Configuration (`src/routes.js`)
Added user management route with `adminOnly` flag:
```javascript
{
  path: "/user-management",
  name: "User Management",
  icon: <PersonIcon color="inherit" />,
  component: UserManagement,
  layout: "/admin",
  adminOnly: true,  // Only admins can access
}
```

Also marked other admin-only routes:
- Expenses & Cashflow (`adminOnly: true`)

### 2. Sidebar Filtering (`src/components/Sidebar/SidebarContent.js`)
Enhanced sidebar to:
- Check current user's role from localStorage
- Filter out admin-only routes for staff users
- Hide entire menu categories if all items are restricted
- Provide seamless UX with no broken links

Key logic:
```javascript
// Filter admin-only routes for staff users
if (prop.adminOnly && !isAdmin) {
  return null;
}
```

### 3. Protected Route Enhancement (`src/components/ProtectedRoute.js`)
Updated to enforce route-level access control:
- Check for valid authentication token
- Verify user role for admin-only routes
- Redirect staff users trying to access admin routes to dashboard
- Log access attempts for debugging

```javascript
// Check if route requires admin access
if (adminOnly && user.user_role !== 'admin') {
  return <Redirect to="/admin/dashboard" />;
}
```

### 4. Layout Integration (`src/layouts/Admin.js`)
Modified route generation to:
- Use `ProtectedRoute` component for all admin routes
- Pass `adminOnly` prop to routes that require it
- Ensure consistent access control across all pages

## API Integration

All user management operations connect to Laravel backend API:

### Endpoints Used:
- `GET /api/core/users` - Get all users
- `GET /api/core/users/{id}` - Get user by ID
- `POST /api/core/users` - Create new user
- `PUT /api/core/users/{id}` - Update user
- `DELETE /api/core/users/{id}` - Delete user
- `GET /api/core/users/stats` - Get user statistics

### Authentication:
All requests include Bearer token in Authorization header:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
}
```

## Security Features

### Frontend Protection:
1. **Route Guards**: ProtectedRoute component blocks unauthorized access
2. **UI Filtering**: Admin-only menu items hidden from staff users
3. **Component-Level Checks**: UserManagement component verifies admin role on mount
4. **Action Prevention**: Disable delete button for current user's own account

### Backend Protection (as per API docs):
1. **Laravel Sanctum Authentication**: All endpoints require valid token
2. **Admin Middleware**: User management endpoints check for admin role
3. **Business Logic Protection**:
   - Cannot delete own account
   - Cannot delete/demote last admin
   - Email uniqueness validation
   - Password strength requirements (min 8 characters)

## Usage Instructions

### For Administrators:

#### Option 1: User Management Page (Recommended)
1. **Navigate to User Management**:
   - Click "User Management" in the sidebar (visible only to admins)

2. **View User Statistics**:
   - Dashboard shows total users, admin/staff breakdown, and recent additions

3. **Add New User**:
   - Click "Add New User" button
   - Fill in name, email, password, and select role
   - Click "Add User" to create

4. **Edit Existing User**:
   - Click "Edit" button on any user row
   - Update information as needed
   - Leave password blank to keep existing password
   - Click "Update User" to save changes

5. **Delete User**:
   - Click delete icon on any user row (except your own)
   - Confirm deletion in popup dialog
   - Note: Cannot delete the last admin user

#### Option 2: SignUp Page (Alternative)
1. **Navigate to Sign Up**:
   - Click "Sign Up" under "ACCOUNT PAGES" in the sidebar (visible only to admins)
   - Or navigate directly to `/admin/signup`

2. **Create New User**:
   - Fill in full name, email, and password (min 8 characters)
   - Select role (Admin or Staff)
   - Click "CREATE USER"
   - Form will reset after successful creation
   - You remain logged in as admin

3. **Navigate to User Management**:
   - Click "Go to User Management" button at the bottom of the form

### For Staff Users:
- User Management menu item is not visible
- Attempting to access `/admin/user-management` via URL will redirect to dashboard
- Focus remains on operational tasks (stock, customers, rentals, sales)

## Files Modified/Created

### Created:
- `src/services/userService.js` - User management API service
- `src/views/Dashboard/UserManagement/index.js` - User management UI component
- `USER_MANAGEMENT_INTEGRATION.md` - This documentation

### Modified:
- `src/routes.js` - Added user management route with adminOnly flag, moved signup to admin layout
- `src/views/Auth/SignUp.js` - Converted to admin-only user creation page
- `src/factoryRoutes.js` - Added adminOnly flag to expense management
- `src/components/Sidebar/SidebarContent.js` - Added role-based filtering
- `src/components/ProtectedRoute.js` - Added admin-only route protection
- `src/layouts/Admin.js` - Updated route generation to use ProtectedRoute

### Important Changes:
**SignUp Page (`/admin/signup`):**
- Now only accessible from within the admin dashboard
- Requires admin authentication
- Admin stays logged in when creating new users (token is preserved)
- Simplified UI without social login options
- Role selection limited to "Admin" and "Staff"
- Form resets after successful user creation
- Link to User Management page for easy navigation

## Testing Checklist

### As Admin User:
- [ ] Can see "User Management" in sidebar
- [ ] Can access `/admin/user-management`
- [ ] Can view user statistics
- [ ] Can view all users in table
- [ ] Can create new users (both admin and staff)
- [ ] Can edit user information
- [ ] Can change user roles
- [ ] Cannot delete own account (button disabled)
- [ ] Cannot delete if last admin
- [ ] Can see "Expenses & Cashflow" in sidebar
- [ ] Can see "Sign Up" under "ACCOUNT PAGES" in sidebar
- [ ] Can access `/admin/signup` for creating new users
- [ ] SignUp page shows admin-only message
- [ ] Admin remains logged in after creating new users via signup
- [ ] Signup form resets after successful user creation

### As Staff User:
- [ ] Cannot see "User Management" in sidebar
- [ ] Redirected when accessing `/admin/user-management` via URL
- [ ] Cannot see "Sign Up" in sidebar
- [ ] Redirected when accessing `/admin/signup` via URL
- [ ] Cannot see "Expenses & Cashflow" in sidebar
- [ ] Can access all non-admin features normally
- [ ] Dashboard loads correctly
- [ ] Stock management accessible
- [ ] Customer management accessible
- [ ] Rental management accessible
- [ ] Sales analytics accessible

### Error Handling:
- [ ] Network errors show appropriate toast messages
- [ ] Validation errors display clearly
- [ ] Duplicate email shows validation error
- [ ] Short passwords rejected
- [ ] Last admin protection shows clear error message
- [ ] Self-deletion prevented with clear message

## Future Enhancements

Potential improvements for user management:
1. **User Search**: Add search/filter functionality for large user lists
2. **Bulk Operations**: Select multiple users for bulk actions
3. **User Permissions**: Granular permission system beyond admin/staff
4. **Activity Logs**: Track user actions and changes
5. **Password Reset**: Admin can force password reset for users
6. **User Status**: Active/Inactive/Suspended status management
7. **Email Verification**: Send verification emails to new users
8. **Two-Factor Authentication**: Enhanced security for admin accounts

## API Documentation Reference

For complete API endpoint documentation, see `API_DOCUMENTATION.md` sections:
- **User Management Endpoints (Admin Only)**: Lines 184-429
- **Authentication Endpoints**: Lines 36-182
- **Role-Based Access Control**: Lines 15-32

## Support

For issues or questions:
1. Check console logs for authentication/authorization errors
2. Verify Laravel backend is running and accessible
3. Ensure user has valid token in localStorage
4. Check API_DOCUMENTATION.md for endpoint details
5. Review error messages in toast notifications

