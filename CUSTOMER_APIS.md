## Customer Module API

All endpoints require `auth:sanctum`. Use header `Authorization: Bearer <token>`.

### Base Path
`/api/customers`

### List Customers
- GET `/api/customers`
- Query: `search`, `per_page`
- Search: Searches across `name`, `phone`, `address`, and `serial_id` fields
- 200 → paginated list

### Create Customer
- POST `/api/customers`
- Body (with auto-generated serial_id):
```json
{
  "name": "John Doe",
  "phone": "+15551234567",
  "address": "123 Main St"
}
```

- Body (with custom serial_id):
```json
{
  "serial_id": "VIP-001",
  "name": "John Doe",
  "phone": "+15551234567",
  "address": "123 Main St"
}
```

- Fields:
  - `serial_id` (optional): Unique customer identifier (e.g., "CUST-001", "C-2024-001")
    - **Auto-generated if not provided**: Format `CUST-001`, `CUST-002`, etc. (sequential numbering)
    - If provided manually, must be unique across all customers
    - Max 50 characters
    - Alphanumeric, hyphens, underscores only (regex: `/^[A-Za-z0-9_-]+$/`)
    - Can be omitted (will be auto-generated) or explicitly set to a custom value
  - `name` (required): Customer name
  - `phone` (required): Phone number (must be unique)
  - `address` (optional): Customer address
- 201 → customer JSON (includes `serial_id` - auto-generated if not provided)

**Example Response:**
```json
{
  "id": 1,
  "serial_id": "CUST-001",
  "name": "John Doe",
  "phone": "+15551234567",
  "address": "123 Main St",
  "due_balance": "0.00",
  "advance_balance": "0.00"
}
```

### Get Customer
- GET `/api/customers/{customer}`
- 200 → customer JSON (includes `serial_id` if set)

### Update Customer
- PUT `/api/customers/{customer}`
- Body (any of):
```json
{
  "serial_id": "CUST-002",
  "name": "John D.",
  "phone": "+15557654321",
  "address": "456 Side St"
}
```
- Fields (all optional, only provided fields are updated):
  - `serial_id` (optional): Unique customer identifier
    - Same validation rules as create
    - Can be set to `null` by sending empty string `""` or `null`
    - Must be unique (ignoring current customer's existing `serial_id`)
  - `name` (optional): Customer name
  - `phone` (optional): Phone number (must be unique if changed)
  - `address` (optional): Customer address
- 200 → updated customer JSON (includes `serial_id`)

### Delete Customer
- DELETE `/api/customers/{customer}`
- 200 → `{ "message": "Deleted" }`

---

## Profile & History

### Customer Profile
- GET `/api/customers/{customer}/profile`
- Returns customer with: `sales.items.stockItem`, latest 100 `transactions`, latest 20 `ratings`.

Example (truncated):
```json
{
  "id": 1,
  "serial_id": "CUST-001",
  "name": "John Doe",
  "phone": "+15551234567",
  "address": "123 Main St",
  "due_balance": "150.00",
  "advance_balance": "50.00",
  "sales": [ { "id": 10, "total_amount": "200.00", "paid_amount": "50.00", "due_amount": "150.00" } ],
  "transactions": [ { "type": "sale", "amount": "200.00", "direction": "debit" } ],
  "ratings": [ { "stars": 5, "note": "Great" } ]
}
```

---

## Ratings

### Rate Customer
- POST `/api/customers/{customer}/rate`
- Body:
```json
{ "stars": 4, "note": "On-time payer" }
```
- Rules: `stars` 1-5
- Effect: creates rating, updates `rating_average` and `rating_count`.
- 201 → rating JSON

---

## Payments & Advances

### Record Payment or Advance
- POST `/api/customers/{customer}/payments`
- Body:
```json
{
  "type": "payment",
  "amount": 100.00,
  "description": "Cash collection",
  "advance_start_date": "2025-11-01",
  "advance_end_date": "2025-11-30"
}
```
- Behavior:
  - `payment`: reduces `due_balance`; overflow increases `advance_balance`.
  - `advance`: increases `advance_balance`.
  - Writes a `customer_transactions` row.
- 201 → transaction JSON

### Manually Add Due Balance
- POST `/api/customers/{customer}/add-due`
- Allows manual adjustment/addition to customer's due balance
- **Automatically creates a "Due Payment Invoice"** for the transaction
- Body:
```json
{
  "amount": 500.00,
  "description": "Manual due adjustment - Additional charges",
  "occurred_at": "2025-11-25T10:30:00Z"
}
```
- Fields:
  - `amount` (required): Amount to add to due balance (must be > 0)
  - `description` (optional): Description for the adjustment
  - `occurred_at` (optional): Date/time when the adjustment occurred (defaults to now)
  - `payment_method` (optional): Payment method for invoice (`cash`, `card`, or `other`)
- Behavior:
  - Directly increases the customer's `due_balance` by the specified amount
  - **Automatically creates a "Due Payment Invoice"** with:
    - Invoice number (auto-generated format: `INV-YYYYMMDDHHMMSS-RRR`)
    - Total amount = due amount
    - `paid_amount` = 0
    - `due_amount` = amount
    - Notes = "Due Payment Invoice"
    - Creates an invoice item with the description
  - Creates a `customer_transactions` record with type `adjustment` and direction `debit`
  - Records AR (Accounts Receivable) increase in accounting system
  - Updates customer balance immediately
- Response (201):
```json
{
  "success": true,
  "message": "Due balance adjusted successfully",
  "data": {
    "transaction": {
      "id": 123,
      "customer_id": 1,
      "type": "adjustment",
      "amount": "500.00",
      "direction": "debit",
      "due_balance_after": "1500.00",
      "advance_balance_after": "0.00",
      "description": "Manual due adjustment - Additional charges",
      "occurred_at": "2025-11-25T10:30:00.000000Z"
    },
    "invoice": {
      "id": 456,
      "invoice_number": "INV-20251125103000-123",
      "customer_id": 1,
      "notes": "Due Payment Invoice",
      "subtotal": "500.00",
      "total": "500.00",
      "paid_amount": "0.00",
      "due_amount": "500.00",
      "items": [
        {
          "id": 789,
          "name": "Due Payment Invoice - Manual due adjustment - Additional charges",
          "unit_price": "500.00",
          "quantity": "1.000000",
          "line_total": "500.00"
        }
      ]
    },
    "customer": {
      "id": 1,
      "name": "John Doe",
      "due_balance": "1500.00",
      "advance_balance": "0.00"
    }
  }
}
```

### Manually Add Advance Balance
- POST `/api/customers/{customer}/add-advance`
- Allows manual adjustment/addition to customer's advance balance
- **Automatically creates a "Cash Receiving Invoice"** for the transaction
- Body:
```json
{
  "amount": 200.00,
  "description": "Manual advance adjustment - Prepayment",
  "advance_start_date": "2025-12-01",
  "advance_end_date": "2025-12-31",
  "occurred_at": "2025-11-25T10:30:00Z"
}
```
- Fields:
  - `amount` (required): Amount to add to advance balance (must be > 0)
  - `description` (optional): Description for the adjustment
  - `advance_start_date` (optional): Start date for the advance period
  - `advance_end_date` (optional): End date for the advance period (must be after or equal to start_date)
  - `occurred_at` (optional): Date/time when the adjustment occurred (defaults to now)
  - `payment_method` (optional): Payment method for invoice (`cash`, `card`, or `other`)
  - `deposit_account_id` (optional): Account ID to record payment to (defaults to cash or bank based on payment_method)
- Behavior:
  - Directly increases the customer's `advance_balance` by the specified amount
  - **Automatically creates a "Cash Receiving Invoice"** with:
    - Invoice number (auto-generated format: `INV-YYYYMMDDHHMMSS-RRR`)
    - Total amount = advance amount
    - `paid_amount` = amount
    - `due_amount` = 0
    - Notes = "Cash Receiving Invoice"
    - Creates an invoice item with the description
  - Creates a `customer_transactions` record with type `adjustment` and direction `credit`
  - Updates `advance_start_date` and `advance_end_date` if provided
  - Records cash/bank account credit (money received)
  - Records advance account increase in accounting system
  - Updates customer balance immediately
- Response (201):
```json
{
  "success": true,
  "message": "Advance balance adjusted successfully",
  "data": {
    "transaction": {
      "id": 124,
      "customer_id": 1,
      "type": "adjustment",
      "amount": "200.00",
      "direction": "credit",
      "due_balance_after": "1500.00",
      "advance_balance_after": "200.00",
      "description": "Manual advance adjustment - Prepayment",
      "occurred_at": "2025-11-25T10:30:00.000000Z"
    },
    "invoice": {
      "id": 457,
      "invoice_number": "INV-20251125103000-124",
      "customer_id": 1,
      "notes": "Cash Receiving Invoice",
      "subtotal": "200.00",
      "total": "200.00",
      "paid_amount": "200.00",
      "due_amount": "0.00",
      "items": [
        {
          "id": 790,
          "name": "Cash Receiving Invoice - Manual advance adjustment - Prepayment",
          "unit_price": "200.00",
          "quantity": "1.000000",
          "line_total": "200.00"
        }
      ]
    },
    "customer": {
      "id": 1,
      "name": "John Doe",
      "due_balance": "1500.00",
      "advance_balance": "200.00",
      "advance_start_date": "2025-12-01",
      "advance_end_date": "2025-12-31"
    }
  }
}
```

**Use Cases:**
- **Add Due**: When you need to manually add charges, fees, or outstanding amounts to a customer's account
- **Add Advance**: When a customer makes a prepayment or you need to manually credit their advance balance

**Important Notes:**
- These endpoints **automatically create invoices**:
  - **Due Payment Invoice**: Created when adding due balance (shows as unpaid invoice)
  - **Cash Receiving Invoice**: Created when adding advance balance (shows as paid invoice)
- Invoices are fully integrated with the accounting system:
  - **Due invoices**: Record AR (Accounts Receivable) increase
  - **Advance invoices**: Record cash/bank credit and advance account increase
- All adjustments are logged in `customer_transactions` for audit trail
- Invoices can be downloaded as PDF using `/api/invoices/{id}/download`
- Invoices appear in customer profile and invoice listings

**Frontend Usage Examples:**

```javascript
// Add due balance to a customer
const addCustomerDue = async (customerId, amount, description) => {
  const response = await fetch(`/api/customers/${customerId}/add-due`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      amount: amount,
      description: description || 'Manual due adjustment',
      occurred_at: new Date().toISOString() // Optional
    })
  });

  const data = await response.json();
  if (data.success) {
    console.log('Due added:', data.data.customer.due_balance);
    return data.data;
  }
};

// Add advance balance to a customer
const addCustomerAdvance = async (customerId, amount, description, startDate, endDate) => {
  const response = await fetch(`/api/customers/${customerId}/add-advance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      amount: amount,
      description: description || 'Manual advance adjustment',
      advance_start_date: startDate, // Optional: "2025-12-01"
      advance_end_date: endDate, // Optional: "2025-12-31"
      occurred_at: new Date().toISOString() // Optional
    })
  });

  const data = await response.json();
  if (data.success) {
    console.log('Advance added:', data.data.customer.advance_balance);
    return data.data;
  }
};

// Usage examples
await addCustomerDue(1, 500.00, 'Additional service charges');
await addCustomerAdvance(1, 200.00, 'Prepayment for next month', '2025-12-01', '2025-12-31');
```

---

## Sales (Customer Purchases)

### Create Sale for Customer
- POST `/api/customers/{customer}/sales`
- Body:
```json
{
  "items": [
    {"stock_item_id": 1, "quantity": 2, "unit_price": 50.00},
    {"stock_item_id": 2, "quantity": 1.5, "unit_price": 80.00}
  ],
  "paid_amount": 100.00,
  "reference": "INV-1001",
  "sale_date": "2025-10-30T12:00:00Z"
}
```
- Calculation:
  - `total_amount` = sum of `quantity * unit_price`.
  - Payment order: use `advance_balance` → then `paid_amount` → remainder becomes `due`.
- Effects: creates `sales` and `sale_items`, updates customer balances, writes `customer_transactions` (`sale`, optional `adjustment` for advance used, optional `payment` for cash-at-sale).
- 201 → sale with `items`.

### Refund Items from a Sale
- POST `/api/customers/{customer}/sales/{sale}/refunds`
- Body:
```json
{
  "items": [
    { "sale_item_id": 10, "quantity": 1.5 },
    { "sale_item_id": 11, "quantity": 2 }
  ],
  "note": "Customer returned damaged bags",
  "refund_date": "2025-11-18T14:30:00Z"
}
```
- Rules:
  - Each `sale_item_id` must belong to the sale.
  - Quantity cannot exceed the remaining (non-refunded) quantity for that sale item.
- Effects:
  - Stock quantity is increased for every returned item.
  - Creates `sale_returns` and `sale_return_items` records for audit.
  - Updates the sale's `refunded_amount`, `due_amount`, and `paid_amount`.
  - Customer balances are updated: refund first reduces `due_balance`, any remainder is paid out immediately (does **not** become customer advance).
  - A `customer_transactions` entry with type `refund` is recorded.
  - Accounting: revenue is debited and the amount is also logged under the LOSS-001 account.
- 201 → sale return with `items`.

---

## Data Model Summary
- `customers`: serial_id (nullable, unique), name, phone (unique), address, due_balance, advance_balance, advance_start_date, advance_end_date, rating_average, rating_count, timestamps, softDeletes
- `sales`: customer_id, total_amount, paid_amount, due_amount, sale_date, reference, timestamps
- `sale_items`: sale_id, stock_item_id, quantity, unit_price, total_price, timestamps
- `sale_returns`: sale_id, customer_id, refund_amount, refund_date, note, timestamps
- `sale_return_items`: sale_return_id, sale_item_id, stock_item_id, quantity, unit_price, refund_amount, timestamps
- `invoice_returns`: invoice_id, customer_id, refund_amount, refund_date, note, timestamps
- `invoice_return_items`: invoice_return_id, invoice_item_id, stock_item_id, quantity, sold_quantity, unit_type, refund_amount, timestamps
- `customer_transactions`: customer_id, type [sale|payment|advance|adjustment|refund], amount, direction [debit|credit], due_balance_after, advance_balance_after, description, occurred_at, timestamps
- `customer_ratings`: customer_id, stars, note, created_by, timestamps

## Validation Notes
- `serial_id`: 
  - **Auto-generated if not provided**: System automatically generates sequential IDs in format `CUST-001`, `CUST-002`, etc.
  - Optional (can be omitted for auto-generation, or explicitly provided)
  - If provided manually, must be unique across all customers
  - Max 50 characters
  - Allowed characters: alphanumeric (A-Z, a-z, 0-9), hyphens (-), underscores (_)
  - Examples: "CUST-001", "C-2024-001", "C_2024_001"
  - Empty strings are automatically converted and trigger auto-generation
- `phone`: unique
- `stars`: in 1..5
- `items`: non-empty; `stock_item_id` must exist; `quantity >= 0.001`
- `advance_end_date >= advance_start_date`: when both provided

## Serial ID Usage

### Auto-Generation
The `serial_id` is **automatically generated** when creating a new customer if not explicitly provided:
- **Format**: `CUST-001`, `CUST-002`, `CUST-003`, etc. (sequential numbering)
- **Behavior**: System finds the highest existing `CUST-XXX` number and increments it
- **Uniqueness**: Auto-generated IDs are guaranteed to be unique
- **Manual Override**: You can still provide a custom `serial_id` if needed

### Manual Assignment
You can manually assign custom identifiers for:
- External system integration
- Human-readable customer codes
- Custom numbering schemes (e.g., "C-2024-001", "VIP-001")

**Important Notes:**
- **Auto-generation**: If `serial_id` is omitted or empty, it will be automatically generated in format `CUST-XXX`
- **Manual override**: You can provide a custom `serial_id` when creating a customer
- **Uniqueness**: All `serial_id` values (auto-generated or manual) must be unique
- **Indexed**: The field is indexed for fast lookups and searches
- **Search**: Search functionality includes `serial_id` - customers can be found by their serial ID
- **Updates**: When updating, you can change the `serial_id` or set it to a custom value
- **Responses**: The `serial_id` is included in all customer API responses (list, get, profile)


