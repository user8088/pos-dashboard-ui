## Customer Module API

All endpoints require `auth:sanctum`. Use header `Authorization: Bearer <token>`.

### Base Path
`/api/customers`

### List Customers
- GET `/api/customers`
- Query: `search`, `per_page`
- 200 → paginated list

### Create Customer
- POST `/api/customers`
- Body:
```json
{ "name": "John Doe", "phone": "+15551234567", "address": "123 Main St" }
```
- 201 → customer JSON

### Get Customer
- GET `/api/customers/{customer}`
- 200 → customer JSON

### Update Customer
- PUT `/api/customers/{customer}`
- Body (any of):
```json
{ "name": "John D.", "phone": "+15557654321", "address": "456 Side St" }
```
- 200 → updated customer JSON

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
  "name": "John Doe",
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

---

## Data Model Summary
- `customers`: name, phone (unique), address, due_balance, advance_balance, advance_start_date, advance_end_date, rating_average, rating_count, timestamps, softDeletes
- `sales`: customer_id, total_amount, paid_amount, due_amount, sale_date, reference, timestamps
- `sale_items`: sale_id, stock_item_id, quantity, unit_price, total_price, timestamps
- `customer_transactions`: customer_id, type [sale|payment|advance|adjustment], amount, direction [debit|credit], due_balance_after, advance_balance_after, description, occurred_at, timestamps
- `customer_ratings`: customer_id, stars, note, created_by, timestamps

## Validation Notes
- `phone` unique
- `stars` in 1..5
- `items` non-empty; `stock_item_id` must exist; `quantity >= 0.001`
- `advance_end_date >= advance_start_date` when both provided


