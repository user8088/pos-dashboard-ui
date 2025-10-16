# Payment-Only Transactions Guide

## Overview

The customer purchase system now supports **payment-only transactions**, allowing you to record payments against customer dues or advance payments without creating any inventory changes. This is useful for:

- Recording advance payments from customers
- Applying payments against existing customer dues
- Creating payment-only transactions for credit balances
- Flexible payment handling without tied inventory

## Endpoint

**POST** `/api/core/customer/{id}/purchase`

All payment-only transactions use the same endpoint as regular purchases. The key difference is that `items` is now **optional**.

## What Changed

### Before
- `items` was **required**
- Every purchase had to include inventory items
- Could not record standalone payments

### Now
- `items` is **optional**
- Can record payments without any inventory changes
- Can record advance payments, partial payments, or full settlements
- Same purchase record is created for audit/history
- Customer totals are properly updated
- Revenue transaction is created for the paid amount

## How It Works

### Request Format

When making a payment-only transaction, simply omit the `items` array:

```json
{
  "paid_cash": 1500,
  "paid_online": 500,
  "discount_amount": 0
}
```

All three payment fields are optional:

```json
{
  "paid_cash": 2000
}
```

## Calculation Logic

### Input Fields
- `items` (optional, array): Line items with inventory
- `discount_amount` (optional, decimal): Amount to discount
- `paid_cash` (optional, decimal): Cash payment amount
- `paid_online` (optional, decimal): Online/card payment amount

### Computed Values

```
subtotal = SUM(items) - discount_amount
         = 0 if items omitted

billPaid = paid_cash + paid_online

billDueDelta = subtotal - billPaid
             (can be negative for advance payments)
```

### Customer Update
The customer record is updated with:

```
total_bill += subtotal
bill_paid += billPaid
bill_due += billDueDelta
```

**Important:** `bill_due` can go **negative** to represent a credit balance from advance payments.

### Purchase Storage
The purchase record stores:

```
total_amount = SUM(items)        // 0 for payment-only
discount_amount = discount       // as provided
paid_cash = paid_cash            // as provided
paid_online = paid_online        // as provided
paid_total = paid_cash + paid_online
due_amount = MAX(0, billDueDelta)  // never negative in DB
```

### Revenue Transaction
If `billPaid > 0`, a transaction is created:

```
amount = billPaid
account = main_revenue_account
type = inflow
description = "Customer payment - PUR-XXXXXX"
```

## Use Cases

### 1. Record Advance Payment

Customer wants to pay in advance before purchasing items.

**Request:**
```json
{
  "paid_cash": 5000
}
```

**Result:**
- Customer `bill_due` becomes **negative** (they have a credit)
- Purchase record created with `total_amount: 0`
- Revenue transaction created for 5000

**Later when they purchase:**
```json
{
  "items": [
    { "stock_id": 1, "quantity": 2, "unit_price": 1500 }
  ]
}
```

The new purchase total is 3000, and since they have a -5000 credit:
- New `bill_due = -5000 + 3000 = -2000` (still a credit)

### 2. Pay Against Existing Dues

Customer has an outstanding balance and wants to make a partial payment.

**Current state:** Customer has `bill_due: 5000`

**Request:**
```json
{
  "paid_cash": 2000,
  "paid_online": 1500
}
```

**Result:**
- `bill_paid += 3500`
- `bill_due = 5000 - 3500 = 1500` (remaining due)
- Revenue transaction created for 3500

### 3. Pay Full Amount with Discount

Customer has an invoice with discount and wishes to pay.

**Current state:** Customer has `bill_due: 2500`

**Request:**
```json
{
  "discount_amount": 500,
  "paid_online": 2000
}
```

**Result:**
- `subtotal = 0 - 500 = -500` (discount applied)
- `bill_due = -500 - 2000 = -2500` (customer has a credit)
- Purchase recorded
- Revenue transaction created for 2000

### 4. Split Payment (Cash + Online)

Customer pays partially in cash, partially online.

**Request:**
```json
{
  "paid_cash": 1000,
  "paid_online": 1500
}
```

**Result:**
- Both payment methods are recorded separately
- Total paid: 2500
- Customer `bill_paid` increases by 2500
- Revenue transaction created for 2500
- Payment breakdown is maintained in purchase record

## API Response Format

```json
{
  "message": "Purchase recorded",
  "data": {
    "customer": {
      "id": 5,
      "name": "ABC Trading",
      "total_bill": 8500,
      "bill_paid": 5500,
      "bill_due": 3000,
      "discount_amount": 0,
      "paid_cash": 1000,
      "paid_online": 1500,
      "customer_code": "CUST-0001",
      // ... other fields
    },
    "purchase": {
      "id": 15,
      "customer_id": 5,
      "purchase_code": "PUR-20251016-15",
      "total_amount": 0,
      "discount_amount": 500,
      "paid_cash": 1000,
      "paid_online": 1500,
      "paid_total": 2500,
      "due_amount": 0,
      "purchased_at": "2025-10-16T10:30:00.000000Z",
      "items": []
    }
  }
}
```

## Key Points

✅ **Items are optional** - Omit them completely for payment-only transactions

✅ **Customer totals update** - `total_bill`, `bill_paid`, and `bill_due` all update accordingly

✅ **Negative `bill_due` allowed** - Represents customer credit/advance

✅ **Revenue transaction created** - When payment amount > 0, it's recorded as income

✅ **Audit trail maintained** - All transactions are recorded in `customer_purchases` table

✅ **Split payments supported** - Pay in both cash and online in one transaction

✅ **Flexible** - Mix items with payments if needed

## Examples

### Example 1: Pure Payment-Only

```bash
curl -X POST "http://localhost:8000/api/core/customer/5/purchase" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paid_cash": 2000,
    "paid_online": 1000
  }'
```

### Example 2: Payment with Discount (No Items)

```bash
curl -X POST "http://localhost:8000/api/core/customer/5/purchase" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "discount_amount": 200,
    "paid_cash": 1800
  }'
```

### Example 3: Items + Payment

```bash
curl -X POST "http://localhost:8000/api/core/customer/5/purchase" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "stock_id": 1,
        "quantity": 5,
        "unit_price": 500
      }
    ],
    "paid_cash": 1500,
    "paid_online": 1000
  }'
```

## Important Notes

⚠️ **No Inventory Changes** - Payment-only transactions do NOT consume inventory or raw materials

⚠️ **Purchase Record Still Created** - For audit purposes, a purchase record is always created, even if empty

⚠️ **Due Amount Always Non-Negative** - The `due_amount` field in database is `MAX(0, billDueDelta)` to keep it non-negative, but customer's `bill_due` can go negative

⚠️ **Currency** - All amounts use the currency configured in your system (typically PKR)

⚠️ **Authorization** - User must be authenticated and have customer access

## Troubleshooting

### Issue: Customer credit doesn't apply to next purchase

**Solution:** The system adds the new purchase total to existing `bill_due`. If `bill_due` is negative (credit), it will reduce the customer's due amount on the next purchase.

### Issue: Payment recorded but revenue not shown

**Solution:** Check that the paid amount > 0. Revenue is only created when `billPaid > 0`.

### Issue: Negative `bill_due` showing in frontend

**Solution:** This is normal and indicates a customer credit. Your frontend should display it as "Credit: {amount}" when negative.
