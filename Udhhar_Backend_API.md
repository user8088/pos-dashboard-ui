# Udhaar (Loan) System API Documentation

## Overview

The Udhaar system allows businesses to track loans given to staff members. This is separate from salary payments and commission, providing a complete loan management system with the ability to record loans, track repayments, and view outstanding balances.

**Base URL**: `/api`  
**Authentication**: Bearer token required

---

## Database Schema

### `udhaars` Table
- `id`: Primary key
- `user_id`: Foreign key to users table
- `amount`: Loan amount
- `loan_date`: Date loan was given
- `payment_method`: Method used (cash, bank, etc.)
- `notes`: Additional notes
- `status`: active, fully_paid, cancelled
- `remaining_amount`: Outstanding balance
- `created_at`, `updated_at`, `deleted_at` (soft delete)

### `udhaar_repayments` Table
- `id`: Primary key
- `udhaar_id`: Foreign key to udhaars table
- `amount`: Repayment amount
- `payment_date`: Date payment was made
- `payment_method`: Method used
- `notes`: Additional notes
- `created_at`, `updated_at`, `deleted_at` (soft delete)

---

## Endpoints

### 1. Create Loan (Udhaar)

**Endpoint**: `POST /api/udhaars`

**Request Body:**
```json
{
  "user_id": 1,
  "amount": 15000.00,
  "loan_date": "2024-01-15",
  "payment_method": "cash",
  "notes": "Emergency loan for medical expenses"
}
```

**Validation Rules:**
- `user_id`: required, exists in users table
- `amount`: required, numeric, min:0.01
- `loan_date`: required, date
- `payment_method`: nullable, string, max:255
- `notes`: nullable, string

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "staff": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "amount": "15000.00",
    "loan_date": "2024-01-15",
    "payment_method": "cash",
    "notes": "Emergency loan for medical expenses",
    "status": "active",
    "remaining_amount": "15000.00",
    "total_paid": "0.00",
    "created_at": "2024-01-15T10:30:00.000000Z",
    "updated_at": "2024-01-15T10:30:00.000000Z"
  },
  "message": "Loan created successfully"
}
```

---

### 2. List All Loans

**Endpoint**: `GET /api/udhaars`

**Query Parameters:**
- `user_id` (optional): Filter by staff member
- `status` (optional): Filter by status (active, fully_paid, cancelled)
- `start_date` (optional): Filter loans from this date onwards
- `end_date` (optional): Filter loans up to this date
- `page` (optional): Page number for pagination
- `per_page` (optional): Items per page (default: 15)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "staff": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "amount": "15000.00",
      "loan_date": "2024-01-15",
      "payment_method": "cash",
      "notes": "Emergency loan",
      "status": "active",
      "remaining_amount": "5000.00",
      "total_paid": "10000.00",
      "repayments_count": 3,
      "last_payment_date": "2024-03-15",
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-04-01T08:15:00.000000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 15,
    "total": 2,
    "last_page": 1
  }
}
```

---

### 3. Get Single Loan

**Endpoint**: `GET /api/udhaars/{id}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "staff": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "03001234567"
    },
    "amount": "15000.00",
    "loan_date": "2024-01-15",
    "payment_method": "cash",
    "notes": "Emergency loan for medical expenses",
    "status": "active",
    "remaining_amount": "5000.00",
    "total_paid": "10000.00",
    "created_at": "2024-01-15T10:30:00.000000Z",
    "updated_at": "2024-04-01T08:15:00.000000Z",
    "repayments": [
      {
        "id": 1,
        "udhaar_id": 1,
        "amount": "5000.00",
        "payment_date": "2024-02-01",
        "payment_method": "cash",
        "notes": "First installment",
        "created_at": "2024-02-01T10:00:00.000000Z"
      }
    ]
  }
}
```

---

### 4. Update Loan

**Endpoint**: `PUT /api/udhaars/{id}`

**Note:** Only `payment_method` and `notes` can be updated. `amount`, `loan_date`, and `user_id` are immutable after creation.

**Request Body:**
```json
{
  "notes": "Updated notes about the loan",
  "payment_method": "bank"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "amount": "15000.00",
    "loan_date": "2024-01-15",
    "payment_method": "bank",
    "notes": "Updated notes about the loan",
    "status": "active",
    "remaining_amount": "5000.00",
    "total_paid": "10000.00",
    "updated_at": "2024-04-01T09:00:00.000000Z"
  },
  "message": "Loan updated successfully"
}
```

---

### 5. Cancel/Delete Loan

**Endpoint**: `DELETE /api/udhaars/{id}`

**Rules:**
- Soft deletes the loan record
- Only allowed if no repayments have been made
- Maintains historical data

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Loan cancelled successfully"
}
```

**Error Response (422) if repayments exist:**
```json
{
  "success": false,
  "message": "Cannot cancel loan with existing repayments"
}
```

---

### 6. Record Loan Repayment

**Endpoint**: `POST /api/udhaars/{id}/repayments`

**Request Body:**
```json
{
  "amount": 5000.00,
  "payment_date": "2024-02-01",
  "payment_method": "cash",
  "notes": "First installment"
}
```

**Validation Rules:**
- `amount`: required, numeric, min:0.01, max:remaining_amount
- `payment_date`: required, date
- `payment_method`: nullable, string, max:255
- `notes`: nullable, string

**Business Logic:**
- Automatically updates `remaining_amount` on the loan
- If `remaining_amount` becomes 0 or less, sets loan `status` to 'fully_paid'
- Calculates `total_paid` as sum of all repayments

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "udhaar_id": 1,
    "amount": "5000.00",
    "payment_date": "2024-02-01",
    "payment_method": "cash",
    "notes": "First installment",
    "created_at": "2024-02-01T10:00:00.000000Z"
  },
  "message": "Repayment recorded successfully",
  "loan_status": {
    "remaining_amount": "10000.00",
    "total_paid": "5000.00",
    "status": "active"
  }
}
```

**Error Response (422) if amount exceeds remaining:**
```json
{
  "success": false,
  "message": "Cannot record repayment. Amount exceeds remaining balance."
}
```

---

### 7. List All Repayments for a Loan

**Endpoint**: `GET /api/udhaars/{id}/repayments`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "udhaar_id": 1,
      "amount": "5000.00",
      "payment_date": "2024-02-01",
      "payment_method": "cash",
      "notes": "First installment",
      "created_at": "2024-02-01T10:00:00.000000Z"
    },
    {
      "id": 2,
      "udhaar_id": 1,
      "amount": "3000.00",
      "payment_date": "2024-03-01",
      "payment_method": "bank",
      "notes": "Second installment",
      "created_at": "2024-03-01T11:00:00.000000Z"
    }
  ]
}
```

---

### 8. Update Repayment

**Endpoint**: `PUT /api/udhaars/repayments/{repaymentId}`

**Request Body:**
```json
{
  "amount": 6000.00,
  "payment_date": "2024-02-05",
  "payment_method": "bank",
  "notes": "Updated installment"
}
```

**Validation Rules:**
- `amount`: required, numeric, min:0.01
- `payment_date`: required, date
- `payment_method`: nullable, string, max:255
- `notes`: nullable, string

**Important:** Recalculates the loan's `remaining_amount` and `status` after update.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "udhaar_id": 1,
    "amount": "6000.00",
    "payment_date": "2024-02-05",
    "payment_method": "bank",
    "notes": "Updated installment",
    "updated_at": "2024-04-01T10:00:00.000000Z"
  },
  "message": "Repayment updated successfully"
}
```

---

### 9. Delete Repayment

**Endpoint**: `DELETE /api/udhaars/repayments/{repaymentId}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Repayment deleted successfully"
}
```

**Important:** Recalculates the loan's `remaining_amount` and `status` after deletion.

---

### 10. Get Loans Summary Statistics

**Endpoint**: `GET /api/udhaars/summary`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_loans": 10,
    "active_loans": 7,
    "fully_paid_loans": 3,
    "cancelled_loans": 0,
    "total_amount_given": "150000.00",
    "total_amount_paid": "75000.00",
    "total_remaining": "75000.00",
    "by_staff_member": [
      {
        "user_id": 1,
        "staff_name": "John Doe",
        "total_loans": 2,
        "total_given": "30000.00",
        "total_paid": "15000.00",
        "total_remaining": "15000.00"
      },
      {
        "user_id": 2,
        "staff_name": "Jane Smith",
        "total_loans": 1,
        "total_given": "25000.00",
        "total_paid": "0.00",
        "total_remaining": "25000.00"
      }
    ]
  }
}
```

---

### 11. Get User's Loan Summary

**Endpoint**: `GET /api/udhaars/user/{userId}/summary`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "staff_name": "John Doe",
    "total_loans": 3,
    "active_loans": 2,
    "fully_paid_loans": 1,
    "total_amount_given": "45000.00",
    "total_amount_paid": "20000.00",
    "total_remaining": "25000.00",
    "loans": [
      {
        "id": 1,
        "amount": "15000.00",
        "remaining_amount": "5000.00",
        "total_paid": "10000.00",
        "status": "active",
        "loan_date": "2024-01-15",
        "last_payment_date": "2024-03-15"
      },
      {
        "id": 2,
        "amount": "10000.00",
        "remaining_amount": "10000.00",
        "total_paid": "0.00",
        "status": "active",
        "loan_date": "2024-02-10",
        "last_payment_date": null
      }
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "amount": ["The amount must be a number."],
    "loan_date": ["The loan date field is required."]
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Loan not found"
}
```

### 422 Unprocessable Entity
```json
{
  "success": false,
  "message": "Cannot record repayment. Amount exceeds remaining balance."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error. Please try again later."
}
```

---

## Model Relationships

### Udhaar Model
```php
public function user()
{
    return $this->belongsTo(User::class);
}

public function repayments()
{
    return $this->hasMany(UdhaarRepayment::class)->orderByDesc('payment_date');
}
```

### UdhaarRepayment Model
```php
public function udhaar()
{
    return $this->belongsTo(Udhaar::class);
}
```

---

## Business Logic Notes

### Loan Creation
- Set `remaining_amount` equal to `amount` initially
- Set `status` to 'active'
- Track `total_paid` as 0

### Repayment Processing
- Validate that repayment amount doesn't exceed `remaining_amount`
- Decrease `remaining_amount` by repayment amount
- Increase `total_paid` by repayment amount
- If `remaining_amount` becomes 0, set status to 'fully_paid'
- Track `last_payment_date` for quick reference

### Data Integrity
- Don't allow editing `amount`, `loan_date`, or `user_id` after creation
- Recalculate totals whenever a repayment is added/updated/deleted
- Use database transactions for repayment operations to ensure consistency

### Soft Deletes
- Only allow cancellation if no repayments exist
- Soft delete maintains historical data

### Reporting
- Calculate summary statistics in real-time from actual data
- Support filtering by date range, status, and staff member

---

## Frontend Integration Examples

### JavaScript/Fetch Example

```javascript
// Create a new loan
const createUdhaar = async (udhaarData) => {
  const response = await fetch('/api/udhaars', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      user_id: udhaarData.userId,
      amount: udhaarData.amount,
      loan_date: udhaarData.loanDate,
      payment_method: udhaarData.paymentMethod,
      notes: udhaarData.notes
    })
  });
  return await response.json();
};

// Get all loans
const getUdhaars = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`/api/udhaars${queryString ? `?${queryString}` : ''}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};

// Record a repayment
const recordRepayment = async (udhaarId, repaymentData) => {
  const response = await fetch(`/api/udhaars/${udhaarId}/repayments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      amount: repaymentData.amount,
      payment_date: repaymentData.paymentDate,
      payment_method: repaymentData.paymentMethod,
      notes: repaymentData.notes
    })
  });
  return await response.json();
};

// Get summary
const getSummary = async () => {
  const response = await fetch('/api/udhaars/summary', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};

// Get user summary
const getUserSummary = async (userId) => {
  const response = await fetch(`/api/udhaars/user/${userId}/summary`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};
```

---

## Use Cases

### Scenario 1: Record a New Loan
```bash
curl -X POST http://localhost:8000/api/udhaars \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "amount": 15000.00,
    "loan_date": "2024-01-15",
    "payment_method": "cash",
    "notes": "Emergency medical loan"
  }'
```

### Scenario 2: Record Multiple Repayments
```bash
# First repayment
curl -X POST http://localhost:8000/api/udhaars/1/repayments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000.00,
    "payment_date": "2024-02-01",
    "payment_method": "cash",
    "notes": "First installment"
  }'

# Second repayment
curl -X POST http://localhost:8000/api/udhaars/1/repayments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000.00,
    "payment_date": "2024-03-01",
    "payment_method": "bank",
    "notes": "Final payment"
  }'
```

### Scenario 3: View Active Loans for a Staff Member
```bash
curl -X GET "http://localhost:8000/api/udhaars?user_id=1&status=active" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Scenario 4: Get Overall Summary
```bash
curl -X GET http://localhost:8000/api/udhaars/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Best Practices

1. **Always use transactions** for repayment operations
2. **Validate amounts** don't exceed remaining balance
3. **Maintain audit trail** with detailed notes
4. **Use soft deletes** to preserve historical data
5. **Calculate totals dynamically** from actual data
6. **Provide clear error messages** for validation failures
7. **Filter by date ranges** for reporting
8. **Track payment methods** for accounting purposes

---

## Migration and Setup

### Run Migrations
```bash
php artisan migrate
```

This creates both `udhaars` and `udhaar_repayments` tables with proper relationships and indexes.

### Model Imports
```php
use App\Models\Udhaar;
use App\Models\UdhaarRepayment;
```

---

## Testing Checklist

- [ ] Create a new loan for a staff member
- [ ] List all loans with filters (user_id, status, date range)
- [ ] Get detailed loan information with repayments
- [ ] Update loan notes and payment method
- [ ] Record repayments (partial and full)
- [ ] Verify loan status changes to 'fully_paid' when balance reaches 0
- [ ] Update a repayment and verify loan balance recalculates
- [ ] Delete a repayment and verify loan balance recalculates
- [ ] Attempt to delete a loan with repayments (should fail)
- [ ] Get summary statistics
- [ ] Get user-specific loan summary
- [ ] Paginate through loans list
- [ ] Validate all error cases (404, 422, etc.)

