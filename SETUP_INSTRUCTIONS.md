# POS Dashboard Authentication Setup

This document provides instructions for setting up authentication in the POS Dashboard React application with Laravel API backend.

## Prerequisites

1. Laravel backend with Sanctum authentication (as described in the provided API documentation)
2. Node.js and npm installed
3. React development environment

## Installation Steps

### 1. Install Dependencies

First, install the required dependencies:

```bash
npm install axios
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following content:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

Replace `http://localhost:8000/api` with your actual Laravel API URL.

### 3. File Structure

The following files have been created/updated:

#### New Files:
- `src/services/authService.js` - Authentication service
- `src/contexts/AuthContext.js` - Authentication context
- `src/components/ProtectedRoute.js` - Route protection component
- `.env` - Environment configuration

#### Updated Files:
- `src/views/Auth/SignIn.js` - Updated with authentication logic
- `src/views/Auth/SignUp.js` - Updated with registration logic
- `src/components/Navbars/AdminNavbarLinks.js` - Added user menu and logout
- `src/layouts/Auth.js` - Added authentication redirects
- `src/index.js` - Added AuthProvider and ProtectedRoute
- `package.json` - Added axios dependency

## Features Implemented

### Authentication Features:
1. **User Registration** - Complete signup form with validation
2. **User Login** - Secure login with email/password
3. **User Logout** - Secure logout with token cleanup
4. **Route Protection** - Protected routes based on authentication status
5. **Role-based Access** - Different access levels for admin, factory, and user roles
6. **Token Management** - Automatic token handling and storage
7. **User Context** - Global authentication state management

### UI/UX Features:
1. **Loading States** - Loading indicators during authentication
2. **Error Handling** - User-friendly error messages
3. **Success Notifications** - Toast notifications for successful actions
4. **Form Validation** - Client-side validation for forms
5. **User Menu** - User profile dropdown with logout option
6. **Responsive Design** - Mobile-friendly authentication forms

## API Integration

The application integrates with the Laravel API endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

## Usage

### Starting the Application

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. The application will be available at `http://localhost:3000`

### Authentication Flow

1. **Unauthenticated users** are redirected to `/auth/signin`
2. **Registration** creates a new account and automatically logs in
3. **Login** authenticates users and redirects based on role:
   - Admin users → `/admin/dashboard`
   - Factory users → `/factory/dashboard`
   - Regular users → `/admin/dashboard`
4. **Logout** clears authentication and redirects to signin

### Role-based Access

- **Admin users** can access admin routes (`/admin/*`)
- **Factory users** can access factory routes (`/factory/*`)
- **Regular users** can access admin routes (`/admin/*`)

## Configuration

### API URL Configuration

Update the `REACT_APP_API_URL` in your `.env` file to match your Laravel backend URL.

### User Roles

The system supports three user roles:
- `admin` - Full administrative access
- `factory` - Factory-specific access
- `user` - Standard user access

## Security Features

1. **Token-based Authentication** - Uses Laravel Sanctum tokens
2. **Automatic Token Refresh** - Handles token expiration
3. **Secure Storage** - Tokens stored in localStorage
4. **Route Protection** - Unauthorized access prevention
5. **Input Validation** - Client and server-side validation

## Troubleshooting

### Common Issues:

1. **CORS Errors** - Ensure your Laravel backend has proper CORS configuration
2. **Token Expiration** - Tokens are automatically handled, but users may need to re-login
3. **API Connection** - Verify the API URL in your `.env` file
4. **Role Access** - Ensure users have the correct roles assigned

### Development Tips:

1. Check browser console for authentication errors
2. Verify network requests in browser dev tools
3. Ensure Laravel backend is running and accessible
4. Check Laravel logs for API errors

## Next Steps

1. **Email Verification** - Add email verification for new accounts
2. **Password Reset** - Implement password reset functionality
3. **Profile Management** - Add user profile editing capabilities
4. **Session Management** - Add session timeout handling
5. **Audit Logging** - Add authentication event logging

## Support

For issues or questions regarding the authentication setup, please refer to:
- Laravel Sanctum documentation
- React Context API documentation
- Chakra UI documentation
