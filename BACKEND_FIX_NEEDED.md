# Backend Fix Needed for Staff Profile Loan Total

## Issue
The staff profile is showing PKR 2.00 for both outstanding loans and total amount loaned. The backend API endpoint `/api/udhaars/user/{userId}/summary` needs to ensure it returns the correct `total_amount_given` value.

## Expected Behavior
- `total_amount_given`: Should be the sum of ALL loan amounts (active, fully_paid, and cancelled loans)
- `total_remaining`: Should be the sum of only active loans' remaining amounts
- The `loans` array should include ALL loans (not just active ones) so the frontend can calculate totals if needed

## Backend Implementation - Complete Code Example

The `userSummary` method in `UdhaarController` should look like this:

```php
public function userSummary($userId)
{
    try {
        $user = User::findOrFail($userId);
        
        // Get ALL loans for this user (including fully_paid and cancelled)
        $loans = Udhaar::where('user_id', $userId)
            ->whereNull('deleted_at') // Only non-deleted loans
            ->get(); // Get ALL loans, not just active
        
        // Calculate totals
        $totalAmountGiven = $loans->sum('amount'); // Sum of ALL loan amounts
        $totalRemaining = $loans->where('status', 'active')->sum('remaining_amount'); // Only active loans
        $totalPaid = $loans->sum(function($loan) {
            return $loan->total_paid ?? ($loan->amount - $loan->remaining_amount);
        });
        
        // Count loans by status
        $activeLoans = $loans->where('status', 'active');
        $fullyPaidLoans = $loans->where('status', 'fully_paid');
        $cancelledLoans = $loans->where('status', 'cancelled');
        
        // Map all loans to response format
        $loansArray = $loans->map(function($loan) {
            return [
                'id' => $loan->id,
                'amount' => number_format($loan->amount, 2, '.', ''), // Original loan amount
                'remaining_amount' => number_format($loan->remaining_amount, 2, '.', ''),
                'total_paid' => number_format($loan->total_paid ?? ($loan->amount - $loan->remaining_amount), 2, '.', ''),
                'status' => $loan->status, // active, fully_paid, or cancelled
                'loan_date' => $loan->loan_date,
                'last_payment_date' => $loan->last_payment_date,
            ];
        })->values();
        
        return response()->json([
            'success' => true,
            'data' => [
                'user_id' => (int) $userId,
                'staff_name' => $user->name,
                'total_loans' => $loans->count(), // Total count of ALL loans
                'active_loans' => $activeLoans->count(),
                'fully_paid_loans' => $fullyPaidLoans->count(),
                'cancelled_loans' => $cancelledLoans->count(),
                'total_amount_given' => number_format($totalAmountGiven, 2, '.', ''), // Sum of ALL loan amounts
                'total_amount_paid' => number_format($totalPaid, 2, '.', ''),
                'total_remaining' => number_format($totalRemaining, 2, '.', ''), // Only active loans
                'loans' => $loansArray // ALL loans (active, fully_paid, cancelled)
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to get user loan summary: ' . $e->getMessage()
        ], 500);
    }
}
```

## Key Points

1. **Get ALL loans**: Use `Udhaar::where('user_id', $userId)->whereNull('deleted_at')->get()` - don't filter by status
2. **total_amount_given**: Sum of ALL loan amounts (active + fully_paid + cancelled)
3. **total_remaining**: Sum of only active loans' remaining amounts
4. **loans array**: Include ALL loans, not filtered by status
5. **Format amounts**: Return as strings with 2 decimal places using `number_format($amount, 2, '.', '')`

## Common Mistakes to Avoid

❌ **WRONG**: Only getting active loans
```php
$loans = Udhaar::where('user_id', $userId)
    ->where('status', 'active') // ❌ This excludes fully_paid loans!
    ->get();
```

✅ **CORRECT**: Get all loans, then filter for calculations
```php
$loans = Udhaar::where('user_id', $userId)
    ->whereNull('deleted_at')
    ->get(); // ✅ Get all loans

$totalAmountGiven = $loans->sum('amount'); // ✅ Sum all loans
$totalRemaining = $loans->where('status', 'active')->sum('remaining_amount'); // ✅ Only active for remaining
```

## Testing

After the backend fix, test with:
1. A user with multiple loans (some active, some fully paid)
2. Verify that `total_amount_given` = sum of all loan amounts
3. Verify that `total_remaining` = sum of only active loans' remaining amounts
4. Verify that the `loans` array includes all loans regardless of status

### Example Test Case:
- Loan 1: PKR 10,000 (active, remaining: PKR 2,000)
- Loan 2: PKR 5,000 (fully_paid, remaining: PKR 0)
- Loan 3: PKR 3,000 (active, remaining: PKR 3,000)

**Expected Response:**
- `total_amount_given`: "18000.00" (10,000 + 5,000 + 3,000)
- `total_remaining`: "5000.00" (2,000 + 3,000 - only active loans)
- `total_amount_paid`: "13000.00" (8,000 + 5,000 + 0)
- `loans`: Array with all 3 loans

