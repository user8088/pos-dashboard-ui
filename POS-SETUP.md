# POS / Invoices API

Base: `/api` (Bearer auth required)

## Fetch Data for POS

### List Stock Items (catalog)
GET `/api/items?q={search}&product_category_id={id}&page=1`
- Returns items with `category`, `primaryUnit`, `secondaryUnit`.

Example response (trimmed):
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 5,
        "name": "Cement",
        "selling_price": "1000.00",
        "primary_unit_id": 2,
        "secondary_unit_id": 3,
        "secondary_per_primary": "2.000",
        "category": { "id": 1, "name": "Construction" },
        "primaryUnit": { "id": 2, "name": "Bag", "symbol": "bag" },
        "secondaryUnit": { "id": 3, "name": "Kilogram", "symbol": "kg" }
      }
    ],
    "total": 1
  }
}
```

### Search Customers
GET `/api/customers?search={nameOrPhone}&per_page=10`

---

## Create Invoice (Checkout)
POST `/api/invoices`

Body
```json
{
  "customer_id": 1,
  "payment_method": "cash",
  "discount_percent": 5,
  "discount_amount": 100,
  "paid_amount": 500,                // optional; see payment_as
  "payment_as": "payment",          // payment | advance
  "due_date": "2025-11-15",         // optional promise-to-pay date
  "salesperson_user_id": 1,
  "notes": "Walk-in customer",
  "items": [
    { "stock_item_id": 3, "quantity": 1 },
    { "stock_item_id": 5, "quantity": 2, "unit_price": 850 }
  ]
}
```

Rules
- `items[].unit_price` optional; defaults to the item’s `selling_price`.
- Discounts: both fixed and percent can be supplied; both are applied.
- `paid_amount` with `payment_as`:
  - `payment`: applied to this invoice; excess goes to customer advance.
  - `advance`: entire amount goes to advance; invoice remains fully due.
- `due_date` is stored on the invoice and shown on customer profile.
- Customer balances (`due_balance`, `advance_balance`) are updated and a `customer_transactions` entry is recorded.

Success 201 (trimmed)
```json
{
  "success": true,
  "data": {
    "id": 12,
    "invoice_number": "INV-20251030-123",
    "subtotal": "2700.00",
    "total": "2465.00",
    "paid_amount": "500.00",
    "due_amount": "1965.00",
    "due_date": "2025-11-15"
  }
}
```

Validation errors 422
```json
{ "success": false, "message": "Validation errors", "errors": { "items.0.quantity": ["The items.0.quantity must be at least 0.001."] } }
```

---

## List Invoices (for table)
GET `/api/invoices?per_page=20`
- Returns paginated invoices; each row includes `customer_name` which is `Guest` when `customer_id` is null.

Example
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 12,
        "invoice_number": "INV-20251030-123",
        "customer_id": 1,
        "customer_name": "Ali",
        "payment_method": "cash",
        "total": "2465.00",
        "created_at": "2025-10-30T10:30:00.000000Z"
      }
    ],
    "total": 1
  }
}
```

## Get Invoice Details
GET `/api/invoices/{id}`

---

## Customer Profile (with invoices and sales)
GET `/api/customers/{id}/profile`
- Includes:
  - `invoices` (with `items`) and invoice `due_date`, `paid_amount`, `due_amount`.
  - `sales` with `items.stock_item.primaryUnit`, `secondaryUnit`.
  - `transactions` history reflecting sales/payments/advance.

### Sales data included in customer profile
- Path in payload: `sales[]`
- Each sale contains `items[]` with linked stock item and unit info.

Example (trimmed)
```json
{
  "id": 1,
  "name": "Ali",
  "sales": [
    {
      "id": 44,
      "sale_date": "2025-10-30T12:30:00.000000Z",
      "total_amount": "2700.00",
      "items": [
        {
          "id": 101,
          "stock_item_id": 5,
          "quantity": "2.000",
          "unit_price": "850.00",
          "total_price": "1700.00",
          "stock_item": {
            "id": 5,
            "name": "Cement",
            "secondary_per_primary": "2.000",
            "primaryUnit": { "id": 2, "name": "Bag", "symbol": "bag" },
            "secondaryUnit": { "id": 3, "name": "Kilogram", "symbol": "kg" }
          }
        }
      ]
    }
  ]
}
```

---

## Frontend Flow (summary)
1) Load catalog: GET `/api/items`
2) Add to cart; allow custom price per line (optional)
3) Select customer: GET `/api/customers?search=...`
4) Choose payment method and discounts
5) If customer pays now: include `paid_amount` and `payment_as` in POST `/api/invoices`
6) Table view: GET `/api/invoices`
7) Customer profile: GET `/api/customers/{id}/profile`
