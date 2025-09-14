# POS Dashboard - API Authentication Setup Guide

## Overview

This document provides complete setup instructions for implementing Laravel API authentication with React frontend using Laravel Sanctum for token-based authentication.

## Table of Contents

1. [Laravel Backend Setup](#laravel-backend-setup)
2. [React Frontend Setup](#react-frontend-setup)
3. [Authentication Flow](#authentication-flow)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [Troubleshooting](#troubleshooting)
7. [Security Considerations](#security-considerations)

---

## Laravel Backend Setup

### 1. Install Laravel Sanctum

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### 2. Configure CORS

Install CORS package:
```bash
composer require fruitcake/laravel-cors
```

Update `config/cors.php`:
```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### 3. Update Kernel.php

Update `app/Http/Kernel.php`:
```php
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

### 4. Disable CSRF for API Routes

Update `app/Http/Middleware/VerifyCsrfToken.php`:
```php
<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    protected $except = [
        'api/*',  // Exclude all API routes from CSRF verification
    ];
}
```

### 5. Create AuthController

Create `app/Http/Controllers/AuthController.php`:
```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'user_role' => 'nullable|string|in:admin,user,factory',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_role' => $request->user_role ?? 'user',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }
}
```

### 6. Update User Model

Update `app/Models/User.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'user_role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
}
```

### 7. Add Migration for user_role

Create migration:
```bash
php artisan make:migration add_user_role_to_users_table
```

Update the migration:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('user_role')->default('user')->after('email');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('user_role');
        });
    }
};
```

### 8. Setup API Routes

Update `routes/api.php`:
```php
<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Public authentication routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});
```

### 9. Environment Configuration

Update Laravel `.env`:
```env
APP_URL=http://localhost:8000
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SESSION_DRIVER=cookie
SESSION_DOMAIN=localhost
```

### 10. Run Migrations and Start Server

```bash
php artisan migrate
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan serve
```

---

## React Frontend Setup

### 1. Install Dependencies

Add axios to `package.json`:
```json
{
  "dependencies": {
    "axios": "^1.6.0"
  }
}
```

Then install:
```bash
npm install
```

### 2. Environment Configuration

Create `.env` in React project root:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

### 3. Authentication Service

Create `src/services/authService.js`:
```javascript
// Authentication service for Laravel API integration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.setupAxiosInterceptors();
  }

  // Setup axios interceptors for automatic token handling
  setupAxiosInterceptors() {
    // Request interceptor to add token to headers
    if (typeof window !== 'undefined' && window.axios) {
      window.axios.interceptors.request.use(
        (config) => {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Response interceptor to handle 401 errors
      window.axios.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response?.status === 401) {
            this.logout();
            window.location.href = '/auth/signin';
          }
          return Promise.reject(error);
        }
      );
    }
  }

  // Enhanced request method with better error handling
  async makeRequest(url, options = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    const requestOptions = {
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, requestOptions);
      
      // Get response text first
      const responseText = await response.text();
      
      // Check if response is HTML (error page)
      if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
        throw new Error(`Server returned HTML error page. Status: ${response.status}`);
      }

      // Try to parse as JSON
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Response text:', responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }

      return { response, data };
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  // Login user
  async login(email, password) {
    try {
      const { response, data } = await this.makeRequest(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        const { access_token, user } = data;
        
        // Store token in localStorage
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        
        this.token = access_token;
        
        return { success: true, user };
      } else {
        return { 
          success: false, 
          error: data.message || data.error || `Login failed with status ${response.status}` 
        };
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      let errorMessage = 'Network error. Please try again.';
      
      if (error.message.includes('CORS')) {
        errorMessage = 'CORS error. Please check your Laravel CORS configuration.';
      } else if (error.message.includes('HTML error page')) {
        errorMessage = 'Server configuration error. Please check if the Laravel API is running.';
      } else if (error.message.includes('Invalid JSON')) {
        errorMessage = 'Server returned invalid response. Please check the API endpoint.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check if the API is running at ' + API_BASE_URL;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  // Register user
  async register(name, email, password, userRole = 'user') {
    try {
      const { response, data } = await this.makeRequest(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: password,
          user_role: userRole,
        }),
      });

      if (response.ok) {
        const { access_token, user } = data;
        
        // Store token in localStorage
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        
        this.token = access_token;
        
        return { success: true, user };
      } else {
        return { 
          success: false, 
          error: data.message || data.error || `Registration failed with status ${response.status}` 
        };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      
      let errorMessage = 'Network error. Please try again.';
      
      if (error.message.includes('CORS')) {
        errorMessage = 'CORS error. Please check your Laravel CORS configuration.';
      } else if (error.message.includes('HTML error page')) {
        errorMessage = 'Server configuration error. Please check if the Laravel API is running.';
      } else if (error.message.includes('Invalid JSON')) {
        errorMessage = 'Server returned invalid response. Please check the API endpoint.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check if the API is running at ' + API_BASE_URL;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  // Logout user
  async logout() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await this.makeRequest(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Remove token and user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.token = null;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      const { response, data } = await this.makeRequest(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return { success: true, user: data.user };
      } else {
        return { 
          success: false, 
          error: data.message || data.error || `Failed to get user with status ${response.status}` 
        };
      }
    } catch (error) {
      console.error('Failed to get user:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Get stored user data
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Get token
  getToken() {
    return localStorage.getItem('token');
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
```

### 4. Protected Route Component

Create `src/components/ProtectedRoute.js`:
```javascript
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;

        if (!token || !user) {
          return <Redirect to="/auth/signin" />;
        }

        // Check if user has access to admin routes
        if (rest.path?.startsWith('/admin')) {
          if (user.user_role !== 'admin') {
            return <Redirect to="/auth/signin" />;
          }
        }

        // Check if user has access to factory routes
        if (rest.path?.startsWith('/factory')) {
          if (user.user_role !== 'factory') {
            return <Redirect to="/auth/signin" />;
          }
        }

        return <Component {...props} />;
      }}
    />
  );
};

export default ProtectedRoute;
```

### 5. Update Main Routing

Update `src/index.js`:
```javascript
import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";

import AuthLayout from "layouts/Auth.js";
import AdminLayout from "layouts/Admin.js";
import RTLLayout from "layouts/RTL.js";
import FactoryLayout from "layouts/Factory.js";
import ProtectedRoute from "components/ProtectedRoute";

ReactDOM.render(
  <HashRouter>
    <Switch>
      <Route path={`/auth`} component={AuthLayout} />
      <ProtectedRoute path={`/admin`} component={AdminLayout} />
      <ProtectedRoute path={`/factory`} component={FactoryLayout} />
      <ProtectedRoute path={`/rtl`} component={RTLLayout} />
      <Redirect from={`/`} to="/auth/signin" />
    </Switch>
  </HashRouter>,
  document.getElementById("root")
);
```

---

## Authentication Flow

### 1. User Registration/Login Process

```
1. User submits form (SignIn/SignUp component)
2. Form calls authService.login() or authService.register()
3. AuthService makes API request to Laravel backend
4. Laravel validates credentials and returns JWT token
5. AuthService stores token and user data in localStorage
6. User is redirected to appropriate dashboard based on role
7. ProtectedRoute checks localStorage for valid token and user
8. If valid, user accesses protected routes
9. If invalid, user is redirected to signin
```

### 2. Token Management

- **Storage**: Tokens are stored in localStorage
- **Validation**: ProtectedRoute checks token existence and user role
- **Expiration**: Laravel Sanctum handles token expiration
- **Cleanup**: Tokens are removed on logout or invalid responses

### 3. Role-based Access Control

```javascript
// Role-based routing
if (user.user_role === 'admin') {
  // Access to /admin/* routes
} else if (user.user_role === 'factory') {
  // Access to /factory/* routes
} else {
  // Default user access
}
```

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/test` | Test API connection | No |

### Request/Response Examples

#### Register User
```javascript
// Request
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "user_role": "admin"
}

// Response
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "user_role": "admin"
  },
  "access_token": "1|abc123...",
  "token_type": "Bearer"
}
```

#### Login User
```javascript
// Request
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

// Response
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "user_role": "admin"
  },
  "access_token": "1|abc123...",
  "token_type": "Bearer"
}
```

---

## Frontend Components

### 1. SignIn Component Structure

```javascript
// Key features:
- Form validation
- Loading states
- Error handling
- Success notifications
- Role-based redirects
- Direct authService usage (no React Context)
```

### 2. SignUp Component Structure

```javascript
// Key features:
- Password confirmation validation
- Role selection dropdown
- Form validation
- Loading states
- Error handling
- Success notifications
- Role-based redirects
```

### 3. Navigation Component Updates

```javascript
// AdminNavbarLinks.js updates:
- Direct localStorage user access
- Logout functionality
- User profile display
- No React Context dependency
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. CORS Errors
**Problem**: `Access to fetch blocked by CORS policy`

**Solution**:
- Update Laravel `config/cors.php` with specific origins
- Ensure `supports_credentials` is set correctly
- Restart Laravel server after changes

#### 2. 419 CSRF Token Mismatch
**Problem**: Getting 419 status code

**Solution**:
- Add `'api/*'` to `$except` array in `VerifyCsrfToken.php`
- Clear Laravel caches: `php artisan config:clear`

#### 3. Authentication Loops
**Problem**: Infinite redirects or state updates

**Solution**:
- Use direct localStorage access instead of React Context
- Avoid calling `setState` during render
- Use proper dependency arrays in `useEffect`

#### 4. Token Not Being Sent
**Problem**: API requests missing Authorization header

**Solution**:
- Check if token is stored in localStorage
- Verify authService is adding headers correctly
- Check network tab for request headers

#### 5. Role-based Access Issues
**Problem**: Users can't access appropriate routes

**Solution**:
- Verify user role is stored correctly
- Check ProtectedRoute role validation logic
- Ensure user_role field exists in database

### Debug Commands

```bash
# Laravel
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan route:list | grep api

# React
npm start
# Check browser console for errors
# Check Network tab for API calls
# Check Application tab for localStorage
```

---

## Security Considerations

### 1. Token Security
- Tokens stored in localStorage (consider httpOnly cookies for production)
- Tokens have expiration (managed by Laravel Sanctum)
- Tokens are cleared on logout

### 2. API Security
- CSRF protection disabled for API routes
- Rate limiting enabled
- Input validation on all endpoints
- Password hashing with bcrypt

### 3. Frontend Security
- No sensitive data in client-side code
- Proper error handling without exposing system details
- Role-based access control
- Automatic logout on token expiration

### 4. Production Recommendations
- Use HTTPS in production
- Implement refresh token mechanism
- Add request/response logging
- Set up proper CORS policies
- Use environment-specific configurations
- Implement rate limiting on frontend
- Add CSRF protection for web routes
- Consider using httpOnly cookies instead of localStorage

---

## Testing the Implementation

### 1. API Testing with cURL

```bash
# Test registration
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","password_confirmation":"password123","user_role":"admin"}'

# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test protected route
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### 2. Frontend Testing

1. Start Laravel server: `php artisan serve`
2. Start React server: `npm start`
3. Navigate to `http://localhost:3000`
4. Test registration and login flows
5. Verify role-based access control
6. Test logout functionality

---

This documentation provides a complete reference for implementing and maintaining the API authentication system. Keep this updated as the system evolves.
```

This comprehensive documentation covers everything needed to understand, implement, and maintain the API authentication system. It includes:

1. **Complete Laravel backend setup** with all necessary configurations
2. **React frontend implementation** with detailed code examples
3. **Authentication flow explanation** with step-by-step process
4. **API endpoint documentation** with request/response examples
5. **Troubleshooting guide** for common issues
6. **Security considerations** and best practices
7. **Testing procedures** for both backend and frontend

This should serve as a complete reference for future development and maintenance of the authentication system.
