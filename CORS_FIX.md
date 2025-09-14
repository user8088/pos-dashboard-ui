# Fix CORS Error in Laravel

## The Problem
You're getting this CORS error because:
1. Your requests use `credentials: 'include'`
2. Your Laravel CORS config likely uses wildcard `*` for allowed origins
3. Browsers don't allow wildcards when credentials are included

## Solution 1: Update Laravel CORS Configuration (Recommended)

### 1. Update `config/cors.php`:

```php
<?php

return [
    /*
     * You can enable CORS for 1 or multiple paths.
     * Example: ['api/*']
     */
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    /*
     * Matches the request method. `[*]` allows all methods.
     */
    'allowed_methods' => ['*'],

    /*
     * Matches the request origin. Wildcards can be used, eg `*.mydomain.com`
     * IMPORTANT: Don't use '*' when credentials are included
     */
    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001', // Add other ports if needed
    ],

    /*
     * Patterns that can be used with `preg_match`
     */
    'allowed_origins_patterns' => [],

    /*
     * Sets the Access-Control-Allow-Headers response header.
     */
    'allowed_headers' => ['*'],

    /*
     * Sets the Access-Control-Expose-Headers response header.
     */
    'exposed_headers' => [],

    /*
     * Sets the Access-Control-Max-Age response header.
     */
    'max_age' => 0,

    /*
     * Sets the Access-Control-Allow-Credentials header.
     */
    'supports_credentials' => true,
];
```

### 2. Update your Laravel `.env`:

```env
# Add these to your Laravel .env file
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SESSION_DOMAIN=localhost
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 3. Clear Laravel caches:

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

## Solution 2: Alternative - Disable Credentials (Simpler)

If you're using token-based authentication only (no sessions), you can remove the credentials requirement:

### Update your AuthService (already done above):

The updated AuthService I provided removes `credentials: 'include'` from regular API calls, which should resolve the CORS issue.

## Solution 3: Quick Test - Disable CORS Temporarily

For testing purposes only, you can temporarily disable CORS in Laravel by adding this to your `routes/api.php`:

```php
// TEMPORARY - Only for testing
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

**Warning:** Don't use this in production!

## Recommended Steps:

1. **Use Solution 1** - Update your Laravel CORS configuration
2. **Restart your Laravel server** after making changes
3. **Test the connection** using the API test component

## Testing the Fix:

After updating the CORS configuration, test with curl:

```bash
# Test CORS with preflight request
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:8000/api/auth/login

# Should return CORS headers including:
# Access-Control-Allow-Origin: http://localhost:3000
```

## Alternative: Use Laravel Sanctum SPA Authentication

If you want to use Laravel Sanctum's SPA authentication (which requires CSRF cookies), follow this setup:

### 1. Update `config/sanctum.php`:

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:3000,::1',
    Sanctum::currentApplicationUrlWithPort()
))),
```

### 2. Add CSRF cookie route:

```php
// routes/web.php
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set']);
});
```

### 3. Use session-based authentication in your API routes:

```php
// routes/api.php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});
```

But for your use case, **Solution 1 (updating CORS config) is the simplest and most effective**.
