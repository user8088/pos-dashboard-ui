# New Account Management System

## Overview

This document describes the simplified account management system for the POS backend. The system uses a streamlined approach with Cash, Bank, and Revenue accounts, removing the complexity of advance account tracking.

## Key Changes

### 1. Account Structure

**Main System Accounts** (Non-deletable):
- **Cash Account** (`CASH-001`): Main cash account for POS transactions
- **Bank Account** (`BANK-001`): Main bank account for POS transactions
- **Revenue Account** (`REV-001`): Main revenue account tracking total sales

**Custom Accounts**:
- Users can create additional accounts with `type: 'custom'`
- Custom accounts can be edited and deleted (if no transactions exist)

### 2. POS Transaction Flow

When creating an invoice/sale through POS:

1. **Select Deposit Account**: User MUST specify `deposit_account_id` - the account where the payment will be deposited (Cash, Bank, or any custom account)

2. **Payment Processing**:
   - If `paid_amount > 0`, the payment is deposited to the selected account
   - The payment amount is credited to the `deposit_account_id`

3. **Revenue Tracking**:
   - The **total sale amount** is ALWAYS credited to the Revenue account
   - This ensures total revenue is accurately tracked regardless of which account received the payment

### 3. Database Changes

**Invoices Table**:
- Added `deposit_account_id` field (foreign key to accounts table)
- Required for all new invoices

**Accounts Table**:
- Updated account `type` values: `revenue`, `cash`, `bank`, `custom`
- Removed: `advance` type

### 4. Account Operations

**Create Account**:
```json
POST /api/accounts
{
  "name": "My Custom Account",
  "type": "custom",
  "code": "CUS-001",
  "description": "Optional description"
}
```

**Edit Account**:
- Can edit name, code, description, and active status
- Cannot change type or is_default for system accounts

**Delete Account**:
- Cannot delete Cash (`CASH-001`) or Bank (`BANK-001`) accounts
- Cannot delete accounts with existing transactions
- Can delete custom accounts if they have no transactions

**Transfer Between Accounts**:
```json
POST /api/accounts/transfer
{
  "from_account_id": 1,
  "to_account_id": 2,
  "amount": 5000.00,
  "description": "Transfer to operations"
}
```

### 5. Invoice Creation API

**Request**:
```json
POST /api/invoices
{
  "customer_id": 1,
  "deposit_account_id": 2,  // REQUIRED: Account to deposit payment to
  "payment_method": "cash",
  "paid_amount": 5000.00,   // Amount paid immediately
  "items": [...],
  "discount_amount": 0,
  "hidden_costs": 0
}
```

**Processing**:
1. If `paid_amount > 0`: Credits `paid_amount` to `deposit_account_id`
2. Always credits invoice `total` to Revenue account
3. Updates customer balances if customer_id provided

### 6. Account Summary

**Endpoint**: `GET /api/accounts-summary`

**Response**:
```json
{
  "success": true,
  "data": {
    "total_revenue": "150000.00",
    "accounts_count": 5,
    "revenue_account": { "id": 1, "name": "Revenue", "balance": "150000.00" },
    "cash_account": { "id": 2, "name": "Cash", "balance": "45000.00" },
    "bank_account": { "id": 3, "name": "Bank", "balance": "105000.00" },
    "accounts": [...]
  }
}
```

## Migration & Setup

### 1. Run Migrations

```bash
php artisan migrate
```

This adds the `deposit_account_id` field to invoices table.

### 2. Seed Accounts

```bash
php artisan db:seed --class=AccountSeeder
```

This creates:
- Cash account (`CASH-001`)
- Bank account (`BANK-001`)
- Revenue account (`REV-001`) if it doesn't already exist

### 3. Update Existing Invoices

If you have existing invoices without `deposit_account_id`, you may need to backfill this field or mark them as historical records.

## Example Workflow

### Scenario: Customer makes a cash purchase

```bash
# 1. Get available accounts
GET /api/accounts
# Returns: Cash, Bank, and any custom accounts

# 2. Create invoice selecting Cash as deposit account
POST /api/invoices
{
  "customer_id": 5,
  "deposit_account_id": 2,  // Cash account ID
  "payment_method": "cash",
  "paid_amount": 1500.00,
  "items": [
    { "stock_item_id": 10, "quantity": 2, "unit_price": 750 }
  ]
}

# What happens:
# - 1500.00 credited to Cash account
# - 1500.00 credited to Revenue account
# - Customer balance updated if applicable
```

### Scenario: Customer makes a bank transfer purchase

```bash
POST /api/invoices
{
  "customer_id": 5,
  "deposit_account_id": 3,  // Bank account ID
  "payment_method": "card",
  "paid_amount": 5000.00,
  "items": [...]
}

# What happens:
# - 5000.00 credited to Bank account
# - 5000.00 credited to Revenue account
# - Customer balance updated
```

### Scenario: Create and use a custom account

```bash
# 1. Create custom account
POST /api/accounts
{
  "name": "Operations Account",
  "type": "custom",
  "code": "OPS-001"
}

# 2. Use it in POS
POST /api/invoices
{
  "deposit_account_id": 4,  // New Operations Account ID
  "paid_amount": 1000.00,
  "items": [...]
}
```

### Scenario: Add manual transaction (inflow)

```bash
POST /api/accounts/add-transaction
{
  "account_id": 2,  // Cash account
  "transaction_type": "inflow",
  "amount": 2500.00,
  "description": "Daily Investment",
  "transaction_date": "2021-03-27 12:30:00"
}

# What happens:
# - 2500.00 added to Cash account
# - Balance updated automatically
# - Transaction recorded
```

### Scenario: Add manual transaction (outflow)

```bash
POST /api/accounts/add-transaction
{
  "account_id": 2,  // Cash account
  "transaction_type": "outflow",
  "amount": 2500.00,
  "description": "Store Maintenance",
  "transaction_date": "2021-03-27 12:30:00"
}

# What happens:
# - 2500.00 deducted from Cash account
# - Balance updated automatically
# - Transaction recorded
```

### Scenario: Transfer money between accounts

```bash
POST /api/accounts/transfer
{
  "from_account_id": 2,     // From Cash
  "to_account_id": 3,       // To Bank
  "amount": 10000.00,
  "description": "Daily deposit to bank"
}

# What happens:
# - 10,000.00 debited from Cash
# - 10,000.00 credited to Bank
# - Two transactions created for audit trail
```

## Benefits

1. **Simplified**: No complex advance account logic
2. **Flexible**: Can use any account for deposits
3. **Accurate**: Total revenue always tracked correctly
4. **Transparent**: Clear audit trail of all transactions
5. **Scalable**: Easy to add new account types

## Manual Transactions

You can manually add **inflow** (money in) or **outflow** (money out) transactions to any account directly.

**Endpoint**: `POST /api/accounts/add-transaction`

**Request**:
```json
{
  "account_id": 2,
  "transaction_type": "inflow",  // or "outflow"
  "amount": 5000.00,
  "description": "Store Maintenance",
  "transaction_date": "2021-03-27 12:30:00"  // optional, defaults to now
}
```

**What happens**:
- **Inflow** (`transaction_type: "inflow"`): Adds money to the account (credit)
- **Outflow** (`transaction_type: "outflow"`): Removes money from the account (debit)
- Account balance is updated automatically
- Transaction is recorded for audit trail

**Response**:
```json
{
  "success": true,
  "message": "Transaction added successfully",
  "data": {
    "id": 123,
    "account_id": 2,
    "type": "credit",
    "amount": "5000.00",
    "balance_after": "50000.00",
    "description": "Store Maintenance",
    "transaction_date": "2021-03-27T12:30:00.000000Z",
    "account": {
      "id": 2,
      "name": "Cash",
      "balance": "50000.00"
    }
  }
}
```

**Validation**:
- `account_id`: required, must exist
- `transaction_type`: required, must be "inflow" or "outflow"
- `amount`: required, must be > 0
- `description`: required, max 500 characters
- `transaction_date`: optional, defaults to current time

---

## API Endpoints Summary

### Accounts
- `GET /api/accounts` - List all accounts
- `POST /api/accounts` - Create account
- `GET /api/accounts/{id}` - Get account details
- `PUT /api/accounts/{id}` - Update account
- `DELETE /api/accounts/{id}` - Delete account (if allowed)
- `POST /api/accounts/transfer` - Transfer between accounts
- `POST /api/accounts/add-transaction` - Add manual transaction (inflow/outflow)
- `GET /api/accounts/{id}/transactions` - Get account transactions
- `GET /api/accounts-summary` - Get summary with cash/bank/revenue

### Invoices
- `POST /api/invoices` - Create invoice (requires `deposit_account_id`)
- `GET /api/invoices` - List invoices
- `GET /api/invoices/{id}` - Get invoice details

## Notes

1. **Revenue Account**: Should always exist and track cumulative revenue
2. **Cash/Bank Protection**: Cannot be deleted, ensuring system integrity
3. **Transaction History**: All account transactions are recorded for audit
4. **Customer Balances**: Still tracked separately (due_balance, advance_balance) for customer management
5. **Skip Flag**: Use `skip: true` to create invoices without affecting accounts/customers

## Error Handling

- **Missing deposit_account_id**: Returns 422 validation error
- **Invalid account**: Returns 422 if account doesn't exist
- **Delete system account**: Returns 422 if trying to delete Cash/Bank
- **Delete account with transactions**: Returns 422 if account has transaction history
- **Insufficient balance**: Returns 422 if transfer amount exceeds source balance
- **Invalid transaction type**: Returns 422 if transaction_type is not "inflow" or "outflow"
- **Missing transaction fields**: Returns 422 with validation errors

