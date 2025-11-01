# Accounts / Expense Management API

Base: `/api` (Bearer auth required)

## Overview

The accounts module tracks revenue and expenses across multiple accounts. All sales and payments are automatically recorded to the appropriate accounts.

### Default Accounts

- **Revenue Account**: Stores all sales revenue from invoices and sales
- **Advance Account**: Stores customer advance payments

### Account Types

- `revenue`: Revenue account for sales
- `advance`: Account for customer advances
- `custom`: Custom accounts created by users

---

## List Accounts

**GET** `/api/accounts?type={type}&is_active={true|false}`

- Returns all accounts with their current balances
- Includes total revenue across all accounts

**Query Parameters:**
- `type`: Filter by account type (`revenue`, `advance`, `custom`)
- `is_active`: Filter by active status (`true` or `false`)

**Example Response:**
```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "id": 1,
        "name": "Main Revenue Account",
        "type": "revenue",
        "code": "REV-001",
        "description": "Default revenue account for all sales and payments",
        "balance": "125000.00",
        "is_default": true,
        "is_active": true,
        "created_at": "2025-10-30T10:00:00.000000Z",
        "updated_at": "2025-10-30T10:00:00.000000Z"
      },
      {
        "id": 2,
        "name": "Advance Account",
        "type": "advance",
        "code": "ADV-001",
        "description": "Default account for customer advance payments",
        "balance": "5000.00",
        "is_default": true,
        "is_active": true,
        "created_at": "2025-10-30T10:00:00.000000Z",
        "updated_at": "2025-10-30T10:00:00.000000Z"
      }
    ],
    "total_revenue": "130000.00"
  }
}
```

---

## Create Account

**POST** `/api/accounts`

**Body:**
```json
{
  "name": "Operations Account",
  "type": "custom",
  "code": "OPS-001",
  "description": "Account for operational expenses",
  "is_active": true
}
```

**Validation:**
- `name`: required, string, max 255
- `type`: optional, one of: `revenue`, `advance`, `custom` (default: `custom`)
- `code`: optional, string, max 50, unique
- `description`: optional, string, max 1000
- `is_active`: optional, boolean (default: `true`)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Account created",
  "data": {
    "id": 3,
    "name": "Operations Account",
    "type": "custom",
    "code": "OPS-001",
    "description": "Account for operational expenses",
    "balance": "0.00",
    "is_default": false,
    "is_active": true,
    "created_at": "2025-11-01T10:00:00.000000Z",
    "updated_at": "2025-11-01T10:00:00.000000Z"
  }
}
```

---

## Get Account Details

**GET** `/api/accounts/{id}`

Returns account with recent transactions (last 100).

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Main Revenue Account",
    "type": "revenue",
    "code": "REV-001",
    "balance": "125000.00",
    "transactions": [
      {
        "id": 101,
        "account_id": 1,
        "type": "credit",
        "amount": "5000.00",
        "balance_after": "125000.00",
        "reference_type": "Invoice",
        "reference_id": 12,
        "description": "Revenue from invoice INV-20251030-123",
        "transaction_date": "2025-10-30T10:30:00.000000Z"
      }
    ]
  }
}
```

---

## Update Account

**PUT** `/api/accounts/{id}`

**Body:**
```json
{
  "name": "Updated Account Name",
  "code": "NEW-001",
  "description": "Updated description",
  "is_active": false
}
```

**Validation:**
- `name`: optional, string, max 255
- `code`: optional, string, max 50, unique (excluding current account)
- `description`: optional, string, max 1000
- `is_active`: optional, boolean

**Note:** Cannot update `type` or `is_default` for default accounts.

---

## Delete Account

**DELETE** `/api/accounts/{id}`

**Rules:**
- Cannot delete default accounts (`is_default: true`)
- Cannot delete accounts with existing transactions

**Success Response (200):**
```json
{
  "success": true,
  "message": "Account deleted"
}
```

---

## Transfer Between Accounts

**POST** `/api/accounts/transfer`

Transfer funds from one account to another.

**Body:**
```json
{
  "from_account_id": 1,
  "to_account_id": 2,
  "amount": 5000.00,
  "description": "Transfer to operations account",
  "transaction_date": "2025-11-01T10:00:00Z"
}
```

**Validation:**
- `from_account_id`: required, exists in accounts
- `to_account_id`: required, exists in accounts, must be different from `from_account_id`
- `amount`: required, numeric, min 0.01
- `description`: optional, string, max 1000
- `transaction_date`: optional, date (defaults to now)

**Rules:**
- Source account must have sufficient balance
- Creates two transactions: debit from source, credit to destination
- Both account balances are updated automatically

**Success Response (201):**
```json
{
  "success": true,
  "message": "Transfer completed",
  "data": {
    "from_account": {
      "id": 1,
      "name": "Main Revenue Account",
      "balance": "120000.00"
    },
    "to_account": {
      "id": 2,
      "name": "Advance Account",
      "balance": "10000.00"
    }
  }
}
```

---

## Get Account Transactions

**GET** `/api/accounts/{id}/transactions?per_page=50`

Returns paginated list of transactions for an account.

**Query Parameters:**
- `per_page`: Number of transactions per page (default: 50)

**Example Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 101,
        "account_id": 1,
        "type": "credit",
        "amount": "5000.00",
        "balance_after": "125000.00",
        "reference_type": "Invoice",
        "reference_id": 12,
        "description": "Revenue from invoice INV-20251030-123",
        "from_account_id": null,
        "to_account_id": null,
        "transaction_date": "2025-10-30T10:30:00.000000Z",
        "created_at": "2025-10-30T10:30:00.000000Z"
      }
    ],
    "total": 1
  }
}
```

---

## Get Accounts Summary

**GET** `/api/accounts-summary`

Returns summary of all accounts with total revenue.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "total_revenue": "130000.00",
    "accounts_count": 3,
    "revenue_account": {
      "id": 1,
      "name": "Main Revenue Account",
      "type": "revenue",
      "balance": "125000.00"
    },
    "advance_account": {
      "id": 2,
      "name": "Advance Account",
      "type": "advance",
      "balance": "5000.00"
    },
    "accounts": [
      {
        "id": 1,
        "name": "Main Revenue Account",
        "type": "revenue",
        "balance": "125000.00"
      },
      {
        "id": 2,
        "name": "Advance Account",
        "type": "advance",
        "balance": "5000.00"
      },
      {
        "id": 3,
        "name": "Operations Account",
        "type": "custom",
        "balance": "0.00"
      }
    ]
  }
}
```

---

## Automatic Account Recording

The system automatically records transactions to accounts:

### Invoice Revenue
- When an invoice is created (if `skip: false`), the total amount is credited to the **revenue account**
- Invoice revenue is recorded as: `"Revenue from invoice {invoice_number}"`

### Sale Revenue
- When a sale is created, the total amount is credited to the **revenue account**
- Sale revenue is recorded as: `"Revenue from sale #{sale_id}"`

### Customer Payments
- **Advance payments**: Credited to **advance account**
- **Standalone payments** (not for invoices): Credited to **revenue account**
- Payments on invoices are NOT double-counted (revenue already recorded when invoice created)

### Payment Reference Types
- `Invoice`: Transaction from invoice creation
- `Sale`: Transaction from sale creation
- `CustomerTransaction`: Transaction from customer payment
- `AccountTransfer`: Transaction from account-to-account transfer

---

## Frontend Usage Examples

### Create a New Account
```ts
await fetch('/api/accounts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Operations Account',
    type: 'custom',
    code: 'OPS-001',
    description: 'Account for operational expenses'
  })
});
```

### Transfer Funds Between Accounts
```ts
await fetch('/api/accounts/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    from_account_id: 1,
    to_account_id: 2,
    amount: 5000.00,
    description: 'Monthly allocation to operations'
  })
});
```

### Get Accounts Summary
```ts
const response = await fetch('/api/accounts-summary', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
const data = await response.json();
console.log('Total Revenue:', data.data.total_revenue);
console.log('Accounts:', data.data.accounts);
```

---

## Database Structure

### accounts Table
- `id`: Primary key
- `name`: Account name
- `type`: Account type (`revenue`, `advance`, `custom`)
- `code`: Unique account code (optional)
- `description`: Account description
- `balance`: Current account balance
- `is_default`: Whether this is a default account
- `is_active`: Whether account is active
- `timestamps`

### account_transactions Table
- `id`: Primary key
- `account_id`: Foreign key to accounts
- `type`: Transaction type (`credit` or `debit`)
- `amount`: Transaction amount
- `balance_after`: Account balance after this transaction
- `reference_type`: Type of related entity (Invoice, Sale, CustomerTransaction, AccountTransfer)
- `reference_id`: ID of related entity
- `description`: Transaction description
- `from_account_id`: Source account for transfers (nullable)
- `to_account_id`: Destination account for transfers (nullable)
- `transaction_date`: When the transaction occurred
- `timestamps`

---

## Setup

After running migrations, seed the default accounts:

```bash
php artisan db:seed --class=AccountSeeder
```

Or add to `DatabaseSeeder`:
```php
$this->call([
    AccountSeeder::class,
]);
```

---

## Notes

1. **Default Accounts**: Cannot be deleted or have their type changed
2. **Balance Calculation**: Account balances are automatically updated when transactions occur
3. **Total Revenue**: Sum of all active account balances
4. **Transfer Audit**: All transfers create two transactions (debit and credit) for audit trail
5. **Automatic Recording**: Revenue is automatically recorded when invoices/sales are created (unless `skip: true`)

