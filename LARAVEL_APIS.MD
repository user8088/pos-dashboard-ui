<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\SalaryStructureController;
use App\Http\Controllers\Api\ProductCategoryController;
use App\Http\Controllers\Api\SalaryPaymentController;
use App\Http\Controllers\Api\StockItemController as ApiStockItemController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes (no authentication required)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    // Authentication routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    
    // Test route to verify authentication
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // User Management Routes
    Route::apiResource('users', UserController::class);
    Route::get('/staff', [UserController::class, 'staff']);
    Route::get('/user-stats', [UserController::class, 'stats']);

    // Attendance Routes
    Route::apiResource('attendances', AttendanceController::class);
    Route::post('/attendances/bulk-mark', [AttendanceController::class, 'bulkMark']);
    Route::get('/attendances/summary/{userId}', [AttendanceController::class, 'summary']);

    // Salary Structure Routes
    Route::apiResource('salary-structures', SalaryStructureController::class);
    Route::get('/salary-structures/user/{userId}', [SalaryStructureController::class, 'getByUser']);

    // Salary Payment Routes
    Route::apiResource('salary-payments', SalaryPaymentController::class);
    // partial payments: record a transaction (also updates aggregate paid_amount/status)
    Route::post('/salary-payments/{id}/transactions', [SalaryPaymentController::class, 'markPaid']);
    Route::get('/salary-payments/{id}/transactions', [SalaryPaymentController::class, 'listTransactions']);
    Route::delete('/salary-payments/transactions/{txnId}', [SalaryPaymentController::class, 'deleteTransaction']);
    Route::post('/salary-payments/generate-monthly', [SalaryPaymentController::class, 'generateMonthly']);
    Route::get('/salary-payments/summary/{userId}', [SalaryPaymentController::class, 'summary']);

    // Product Category Routes
    Route::apiResource('product-categories', ProductCategoryController::class);

    // Stock Items Routes (JSON API)
    Route::apiResource('items', ApiStockItemController::class);

    // Units Routes (JSON API)
    Route::apiResource('units', UnitController::class);

    // POS / Invoices
    Route::apiResource('invoices', InvoiceController::class)->only(['index','show','store']);

    // Customer Module Routes
    Route::prefix('customers')->group(function () {
        Route::get('/', [CustomerController::class, 'index']);
        Route::post('/', [CustomerController::class, 'store']);
        Route::get('{customer}', [CustomerController::class, 'show']);
        Route::put('{customer}', [CustomerController::class, 'update']);
        Route::delete('{customer}', [CustomerController::class, 'destroy']);

        Route::get('{customer}/profile', [CustomerController::class, 'profile']);
        Route::post('{customer}/rate', [CustomerController::class, 'rate']);
        Route::post('{customer}/payments', [CustomerController::class, 'recordPayment']);
        Route::post('{customer}/sales', [CustomerController::class, 'createSale']);
    });
});
