# POS Dashboard Backend API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
This API uses Laravel Sanctum for authentication. Include the Bearer token in the Authorization header for protected routes.

```
Authorization: Bearer {your_token_here}
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "user_role": "admin"
}
```

**Response (201):**
```json
{
    "message": "User registered successfully",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "user_role": "admin"
    },
    "access_token": "1|abc123...",
    "token_type": "Bearer"
}
```

**Validation Errors (422):**
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The email has already been taken."],
        "password": ["The password confirmation does not match."]
    }
}
```

---

### 2. Login User
**POST** `/auth/login`

Authenticate user and get access token.

**Request Body:**
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

**Response (200):**
```json
{
    "message": "Login successful",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "user_role": "admin"
    },
    "access_token": "1|abc123...",
    "token_type": "Bearer"
}
```

**Validation Errors (422):**
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The provided credentials are incorrect."]
    }
}
```

---

### 3. Get Current User
**GET** `/auth/me`

Get the currently authenticated user's information.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "user_role": "admin",
        "email_verified_at": null,
        "created_at": "2025-09-14T10:00:00.000000Z",
        "updated_at": "2025-09-14T10:00:00.000000Z"
    }
}
```

---

### 4. Logout User
**POST** `/auth/logout`

Revoke the current access token.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "message": "Logged out successfully"
}
```

---

## Core Management Endpoints

### Units Management

### 5. Add Unit
**POST** `/core/unit`

Add a new unit to the system.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "unit_name": "Kilogram",
    "metric": "kg",
    "custom_metric": "Custom weight unit"
}
```

**Response (200):**
```json
{
    "unit_id": 1,
    "unit_name": "Kilogram",
    "metric": "kg",
    "custom_metric": "Custom weight unit",
    "created_at": "2025-09-14T10:00:00.000000Z",
    "updated_at": "2025-09-14T10:00:00.000000Z"
}
```

**Validation Errors (422):**
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "unit_name": ["The unit name field is required."]
    }
}
```

---

### 6. Get All Units
**GET** `/core/unit`

Retrieve all units from the system.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
[
    {
        "unit_id": 1,
        "unit_name": "Kilogram",
        "metric": "kg",
        "custom_metric": "Custom weight unit",
        "created_at": "2025-09-14T10:00:00.000000Z",
        "updated_at": "2025-09-14T10:00:00.000000Z"
    },
    {
        "unit_id": 2,
        "unit_name": "Liter",
        "metric": "L",
        "custom_metric": null,
        "created_at": "2025-09-14T10:05:00.000000Z",
        "updated_at": "2025-09-14T10:05:00.000000Z"
    }
]
```

---

### 6. Add Category
**POST** `/core/category`

Add a new category to the system.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "category_name": "Food Items"
}
```

**Response (200):**
```json
{
    "category_id": 1,
    "category_name": "Food Items",
    "created_at": "2025-09-14T10:00:00.000000Z",
    "updated_at": "2025-09-14T10:00:00.000000Z"
}
```

**Validation Errors (422):**
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "category_name": ["The category name field is required."]
    }
}
```

---

### 7. Get All Categories
**GET** `/core/category`

Retrieve all categories from the system.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
[
    {
        "category_id": 1,
        "category_name": "Food Items",
        "created_at": "2025-09-14T10:00:00.000000Z",
        "updated_at": "2025-09-14T10:00:00.000000Z"
    },
    {
        "category_id": 2,
        "category_name": "Beverages",
        "created_at": "2025-09-14T10:05:00.000000Z",
        "updated_at": "2025-09-14T10:05:00.000000Z"
    }
]
```

---

## Stock Management Endpoints

### 8. Add Stock Item
**POST** `/core/stock`

Add a new stock item to the inventory.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Editable Fields & Rules:**
- item_name (required, string, max:255)
- unit_id (required, exists: units.unit_id)
- category_id (optional, exists: categories.category_id)
- quantity_per_unit (required, number, min:0)
- item_price (optional, number, min:0)
- stock_value (optional, number, min:0). If omitted but item_price provided, computed as item_price × quantity_per_unit.
- stock_status (optional, enum: in_stock|out_of_stock|pending)

**Request Body:**
```json
{
    "item_name": "Rice",
    "unit_id": 1,
    "category_id": 1,
    "quantity_per_unit": 50.00,
    "item_price": 3.00,
    "stock_value": 150.00,
    "stock_status": "in_stock"
}
```

**Note:** `category_id` is optional and can be `null` if the item doesn't need to be categorized.

**Response (200):**
```json
{
    "item_id": 1,
    "item_name": "Rice",
    "unit_id": 1,
    "quantity_per_unit": "50.00",
    "category_id": 1,
    "stock_value": "150.00",
    "stock_status": "in_stock",
    "created_at": "2025-09-14T10:00:00.000000Z",
    "updated_at": "2025-09-14T10:00:00.000000Z",
    "category": {
        "category_id": 1,
        "category_name": "Food Items",
        "created_at": "2025-09-14T10:00:00.000000Z",
        "updated_at": "2025-09-14T10:00:00.000000Z"
    },
    "unit": {
        "unit_id": 1,
        "unit_name": "Kilogram",
        "metric": "kg",
        "custom_metric": "Weight unit",
        "created_at": "2025-09-14T10:00:00.000000Z",
        "updated_at": "2025-09-14T10:00:00.000000Z"
    }
}
```

**Validation Errors (422):**
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "unit_id": ["The selected unit id is invalid."],
        "category_id": ["The selected category id is invalid."]
    }
}
```

**Note:** If `category_id` is provided, it must exist in the categories table. If not provided, it will be stored as `null`.

---

### 9. Get All Stock Items
**GET** `/core/stock`

Retrieve all stock items from the inventory.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
[
    {
        "item_id": 1,
        "item_name": "Rice",
        "unit_id": 1,
        "quantity_per_unit": "50.00",
        "category_id": 1,
        "created_at": "2025-09-14T10:00:00.000000Z",
        "updated_at": "2025-09-14T10:00:00.000000Z",
        "category": {
            "category_id": 1,
            "category_name": "Food Items",
            "created_at": "2025-09-14T10:00:00.000000Z",
            "updated_at": "2025-09-14T10:00:00.000000Z"
        },
        "unit": {
            "unit_id": 1,
            "unit_name": "Kilogram",
            "metric": "kg",
            "custom_metric": "Weight unit",
            "created_at": "2025-09-14T10:00:00.000000Z",
            "updated_at": "2025-09-14T10:00:00.000000Z"
        }
    },
    {
        "item_id": 2,
        "item_name": "Wheat Flour",
        "unit_id": 1,
        "quantity_per_unit": "25.50",
        "category_id": 2,
        "created_at": "2025-09-14T10:05:00.000000Z",
        "updated_at": "2025-09-14T10:05:00.000000Z",
        "category": {
            "category_id": 2,
            "category_name": "Beverages",
            "created_at": "2025-09-14T10:05:00.000000Z",
            "updated_at": "2025-09-14T10:05:00.000000Z"
        },
        "unit": {
            "unit_id": 1,
            "unit_name": "Kilogram",
            "metric": "kg",
            "custom_metric": "Weight unit",
            "created_at": "2025-09-14T10:00:00.000000Z",
            "updated_at": "2025-09-14T10:00:00.000000Z"
        }
    }
]
```

---

### 11. Raw Materials

#### 11.1 Add Raw Material
**POST** `/core/raw-material`

Add a new raw material.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Editable Fields & Rules:**
- material_name (required, string, max:255)
- amount_per_unit (required, number, min:0)
- unit_purchase_cost (optional, number, min:0)
- purchase_cost (required without unit_purchase_cost, number, min:0)
- status (optional, enum: delivered|pending, default: pending)
- amount_pending (optional, number, min:0)
- waste_quantity (optional, number, min:0, default: 0)
- total_waste_cost (optional, number, min:0, default: 0)

Computation behavior:
- If unit_purchase_cost is provided and purchase_cost is omitted, the API computes purchase_cost = unit_purchase_cost × amount_per_unit.
- If both unit_purchase_cost and purchase_cost are provided, purchase_cost is respected as-is.

**Request Body (example):**
```json
{
  "material_name": "Sugar",
  "amount_per_unit": 5.00,
  "purchase_cost": 12.50,
  "unit_purchase_cost": 2.50,
  "status": "pending",
  "amount_pending": 2.50,
  "waste_quantity": 0,
  "total_waste_cost": 0
}
```
Notes:
- **unit_purchase_cost (optional)**: If provided, the API will compute `purchase_cost = unit_purchase_cost × amount_per_unit` and persist both values.
- If `unit_purchase_cost` is omitted, the provided `purchase_cost` is used as‑is.

**Response (201):** Raw material JSON.

#### 11.2 Get Raw Materials
**GET** `/core/raw-material`

Retrieve all raw materials.

**Headers:**
```
Authorization: Bearer {token}
```

#### 11.3 Update Raw Material
**PUT** `/core/raw-material/{id}`

Update an existing raw material. All fields are optional; only provided fields are updated.

Editable Fields & Rules:
- material_name (string, max:255)
- amount_per_unit (number, min:0)
- unit_purchase_cost (number|null, min:0)
- purchase_cost (number, min:0)
- status (enum: delivered|pending)
- amount_pending (number, min:0)
- waste_quantity (number, min:0)
- total_waste_cost (number, min:0)

Computation behavior:
- If unit_purchase_cost and/or amount_per_unit change, and purchase_cost is NOT provided, the API computes purchase_cost = unit_purchase_cost × amount_per_unit (using the new or existing unit cost if available).
- If purchase_cost is provided, it is respected as-is (no auto-compute).

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body (example):**
```json
{
  "amount_per_unit": 12.00,
  "unit_purchase_cost": 1.25,
  "status": "delivered"
}
```
Notes:
- You can also directly set `waste_quantity` and `total_waste_cost` if needed.
- Prefer the waste endpoint (11.5) for operational waste events as it adjusts quantities and calculates loss while keeping `purchase_cost` unchanged.

#### 11.4 Delete Raw Material
**DELETE** `/core/raw-material/{id}`

Delete a raw material.

**Headers:**
```
Authorization: Bearer {token}
```

#### 11.5 Record Raw Material Waste
**POST** `/core/raw-material/{id}/waste`

Record a quantity of the raw material that goes to waste. This reduces `amount_per_unit`, increases `waste_quantity`, recalculates `purchase_cost` for the remaining amount, and updates `total_waste_cost`.
Record a quantity of the raw material that goes to waste. This reduces `amount_per_unit`, increases `waste_quantity`, and updates `total_waste_cost`. The original `purchase_cost` (total purchase price) remains unchanged.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{ "quantity": 5 }
```

Behavior:
- **Validates** that `quantity` is positive and does not exceed available `amount_per_unit`.
- **Decrements** `amount_per_unit` by the waste `quantity`.
- **Accumulates** `waste_quantity` by the waste `quantity`.
- **Determines unit cost** using `unit_purchase_cost` if present; otherwise derives it as `purchase_cost / amount_per_unit` before waste.
- **Leaves** `purchase_cost` unchanged and updates `total_waste_cost = unit_cost × waste_quantity`.

**Success (200):**
```json
{
  "message": "Waste recorded successfully",
  "data": {
    "id": 3,
    "material_name": "Sugar",
    "amount_per_unit": "5.00",
    "unit_purchase_cost": "2.50",
    "purchase_cost": "12.50",
    "waste_quantity": "5.00",
    "total_waste_cost": "12.50",
    "status": "delivered",
    "amount_pending": null,
    "created_at": "2025-09-16T10:00:00.000000Z",
    "updated_at": "2025-09-16T10:05:00.000000Z"
  }
}
```

**Validation/Error (422):**
```json
{ "message": "Waste quantity exceeds available amount." }
```

---

### 12. Stock ⇄ Raw Materials Mapping

Manage which raw materials (and quantities) are required to produce a given stock item. Uses pivot table `stock_raw_material` with `quantity`.

All endpoints require:
```
Authorization: Bearer {token}
Content-Type: application/json (for write operations)
```

#### 12.1 List Raw Materials for a Stock Item
**GET** `/core/stock/{id}/raw-materials`

**Response (200):**
```json
{
  "stock_id": 1,
  "item_name": "Rice",
  "raw_materials": [
    { "raw_material_id": 3, "material_name": "Sugar", "quantity": 2.5 },
    { "raw_material_id": 5, "material_name": "Salt",  "quantity": 0.5 }
  ]
}
```

#### 12.2 Attach or Update Raw Materials (non‑destructive)
**POST** `/core/stock/{id}/raw-materials`

Attaches new or updates existing mappings without removing others.

**Request Body:**
```json
{
  "items": [
    { "raw_material_id": 3, "quantity": 2.5 },
    { "raw_material_id": 5, "quantity": 0.5 }
  ]
}
```

**Response (200):**
```json
{
  "message": "Raw materials attached/updated",
  "data": [
    { "id": 3, "pivot": { "quantity": "2.50" } },
    { "id": 5, "pivot": { "quantity": "0.50" } }
  ]
}
```

#### 12.3 Replace Full Set of Raw Materials (destructive)
**PUT** `/core/stock/{id}/raw-materials`

Replaces all mappings for the stock item with the provided list.

**Request Body:** same as 12.2

**Response (200):** `{ "message": "Raw materials set", "data": [...] }`

#### 12.4 Update Quantity for a Specific Raw Material
**PATCH** `/core/stock/{id}/raw-materials/{rawMaterialId}`

**Request Body:**
```json
{ "quantity": 3.25 }
```

**Response (200):** `{ "message": "Quantity updated" }`

#### 12.5 Detach a Raw Material from a Stock Item
**DELETE** `/core/stock/{id}/raw-materials/{rawMaterialId}`

**Response (200):** `{ "message": "Raw material detached" }`

---

### 13. Produce Stock (Consume Raw Materials)

Produce a specified quantity of a stock item by consuming its mapped raw materials. The operation is atomic and will fail if any raw material is insufficient.

**POST** `/core/stock/{id}/produce`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{ "quantity": 50 }
```

Behavior:
- **Consumes** each mapped raw material by `pivot.quantity × requested quantity`.
- **Increments** the stock's `quantity_per_unit` by the requested `quantity`.
- Entire action is within a transaction; partial updates do not occur.

**Success (200):**
```json
{
  "message": "Production completed",
  "produced": 50,
  "stock_id": 1,
  "item_name": "Blade",
  "consumed": [
    { "raw_material_id": 3, "material_name": "Plastic", "quantity": 150 },
    { "raw_material_id": 5, "material_name": "Steel",   "quantity": 200 }
  ]
}
```

**Validation/Error (422) - No mapping:**
```json
{ "message": "No raw materials mapped to this stock item" }
```

**Validation/Error (422) - Insufficient materials:**
```json
{
  "message": "Not enough raw materials available",
  "insufficient": [
    { "raw_material_id": 3, "material_name": "Plastic", "required": 150, "available": 120, "deficit": 30 }
  ]
}
```

### 10. Update Stock Item
**PUT** `/core/stock/{id}`

Update an existing stock item. All fields optional; only provided fields are updated.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

Auto-calculation:
- If stock_value is not provided but item_price (new or existing) is available, it is computed as item_price × quantity_per_unit.

**Request Body:**
```json
{
    "item_name": "Rice (Updated)",
    "unit_id": 1,
    "category_id": 1,
    "quantity_per_unit": 75.00,
    "item_price": 3.50,
    "stock_value": 200.00,
    "stock_status": "in_stock"
}
```

**Response (200):**
```json
{
    "item_id": 1,
    "item_name": "Rice (Updated)",
    "unit_id": 1,
    "quantity_per_unit": "75.00",
    "category_id": 1,
    "stock_value": "200.00",
    "stock_status": "in_stock",
    "created_at": "2025-09-14T10:00:00.000000Z",
    "updated_at": "2025-09-14T10:15:00.000000Z",
    "category": {
        "category_id": 1,
        "category_name": "Food Items",
        "created_at": "2025-09-14T10:00:00.000000Z",
        "updated_at": "2025-09-14T10:00:00.000000Z"
    },
    "unit": {
        "unit_id": 1,
        "unit_name": "Kilogram",
        "metric": "kg",
        "custom_metric": "Weight unit",
        "created_at": "2025-09-14T10:00:00.000000Z",
        "updated_at": "2025-09-14T10:00:00.000000Z"
    }
}
```

**Note:** All fields are optional for updates. Only provided fields will be updated.

---

### 14. Record Stock Sale
Record a sale of items from a stock entry. Decrements available quantity, increments total_sold, and adds to total_profit. Recomputes stock_value from remaining quantity and item_price when available.

**POST** `/core/stock/{id}/sell`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{ "quantity": 5, "sold_price": 4.00 }
```

Behavior:
- Validates that quantity > 0 and does not exceed available quantity.
- Uses sold_price if provided; otherwise falls back to item_price for profit calculation.
- Updates: quantity_per_unit -= quantity; total_sold += quantity; total_profit += (used unit price × quantity).
- If item_price exists, sets stock_value = item_price × remaining quantity.

**Success (200):**
```json
{
  "message": "Sale recorded successfully",
  "data": { /* updated stock object */ }
}
```

**Validation/Error (422):**
```json
{ "message": "Sale quantity exceeds available stock." }
```

### 13. Delete Stock Item
**DELETE** `/core/stock/{id}`

Delete a stock item from the inventory.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "message": "Stock item deleted successfully"
}
```

**Error (404):**
```json
{
    "message": "No query results for model [App\\Models\\Stock] 1"
}
```

---

## Rental Stock Management Endpoints

The rental system uses duration-based pricing where you set rental start/end dates and a total rent amount for the entire period. The system automatically calculates duration and daily rates.

### 19. Add Rental Stock Item
**POST** `/core/rental-stock`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Editable Fields & Rules:**
- item_name (required, string, max:255)
- unit_id (required, exists: units.unit_id)
- category_id (optional, exists: categories.category_id)
- quantity_per_unit (required, number, min:0)
- stock_value (optional, number, min:0)
- stock_status (optional, enum: available|rented|maintenance|pending)

**Request Body:**
```json
{
    "item_name": "Projector",
    "unit_id": 1,
    "category_id": 1,
    "quantity_per_unit": 5,
    "stock_value": 2000
}
```

**Response (200):**
```json
{
    "item_id": 1,
    "item_name": "Projector",
    "unit_id": 1,
    "category_id": 1,
    "quantity_per_unit": "5.00",
    "stock_value": "2000.00",
    "stock_status": "available",
    "total_rented": "0.00",
    "total_profit": "0.00",
    "rented_on": null,
    "rented_till": null,
    "total_rent_amount": null,
    "created_at": "2025-09-16T10:00:00.000000Z",
    "updated_at": "2025-09-16T10:00:00.000000Z",
    "category": { /* category object */ },
    "unit": { /* unit object */ }
}
```

---

### 20. Get All Rental Stock Items
**GET** `/core/rental-stock`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):** Array of rental stock items with category and unit relationships.

---

### 21. Get Rental Stock with Details
**GET** `/core/rental-stock/details`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):** Array of rental stock items with calculated fields:
- `rental_duration_days`: Duration of current rental
- `daily_rate`: Calculated daily rate
- `is_overdue`: Boolean indicating if rental is past due date

---

### 22. Update Rental Stock Item
**PUT** `/core/rental-stock/{id}`

All fields optional; only provided fields are updated.

**Editable Fields:**
- item_name, unit_id, category_id, quantity_per_unit, stock_value, stock_status
- total_rented, total_profit, rented_on, rented_till

**Validation:** `rented_till` must be after or equal to `rented_on` when both present.

---

### 23. Delete Rental Stock Item
**DELETE** `/core/rental-stock/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "message": "Rental stock item deleted successfully"
}
```

---

### 24. Record Rental (Duration-Based)
Record a rental with start date, end date, and total rent amount. System automatically calculates duration and daily rate.

**POST** `/core/rental-stock/{id}/rent`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "quantity": 2,
    "rented_on": "2024-01-15",
    "rented_till": "2024-01-25",
    "total_rent_amount": 500.00
}
```

**Rules:**
- quantity: required, > 0, must not exceed available quantity
- rented_on: required, ISO date
- rented_till: required, ISO date, must be after rented_on
- total_rent_amount: required, number ≥ 0

**Behavior:**
- Calculates duration in days and daily rate
- Updates item:
  - `quantity_per_unit -= quantity`
  - `total_rented += quantity`
  - `total_profit += total_rent_amount`
  - `stock_value = estimated_monthly_rate × remaining_quantity`
  - Sets `stock_status = rented` and rental dates

**Success (200):**
```json
{
    "message": "Rental recorded successfully",
    "data": { /* updated rental stock item */ },
    "rental_details": {
        "duration_days": 10,
        "daily_rate": 50.00,
        "total_amount": 500.00,
        "quantity_rented": 2,
        "rental_period": "2024-01-15 to 2024-01-25"
    }
}
```

**Validation/Error (422):**
```json
{
    "message": "Rental quantity exceeds available stock."
}
```

---

### 25. End Rental
Return items to available stock and update rental status.

**POST** `/core/rental-stock/{id}/end-rental`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "quantity": 2
}
```

**Rules:**
- quantity: required, > 0, must not exceed rented quantity

**Behavior:**
- Returns items to available stock: `quantity_per_unit += quantity`
- Decrements rented quantity: `total_rented -= quantity`
- If all items returned, sets `stock_status = available` and clears rental dates

**Success (200):**
```json
{
    "message": "Rental ended successfully",
    "data": { /* updated rental stock item */ }
}
```

**Validation/Error (422):**
```json
{
    "message": "Return quantity exceeds rented stock."
}
```

---

## Expense Management Endpoints

The expense management system allows you to create and manage different accounts, track total revenue from stock sales and rentals, and allocate revenue to specific accounts.

### 26. Create Account
**POST** `/core/account`

Create a new account for expense management.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "account_name": "Savings",
    "account_details": "This is my savings account",
    "account_balance": 50000,
    "account_type": "savings"
}
```

**Account Types:**
- `revenue` - Revenue accounts
- `expense` - Expense accounts  
- `savings` - Savings accounts
- `investment` - Investment accounts
- `other` - Other account types

**Response (201):**
```json
{
    "message": "Account created successfully",
    "data": {
        "account_id": 2,
        "account_name": "Savings",
        "account_details": "This is my savings account",
        "account_balance": "50000.00",
        "account_type": "savings",
        "is_main_account": false,
        "created_at": "2025-09-16T10:00:00.000000Z",
        "updated_at": "2025-09-16T10:00:00.000000Z"
    }
}
```

---

### 27. Get All Accounts
**GET** `/core/accounts`

Retrieve all accounts with main revenue account first.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
[
    {
        "account_id": 1,
        "account_name": "Total Revenue",
        "account_details": "Main account tracking all business revenue from stock sales and rentals",
        "account_balance": "1000000.00",
        "account_type": "revenue",
        "is_main_account": true,
        "created_at": "2025-09-16T10:00:00.000000Z",
        "updated_at": "2025-09-16T10:00:00.000000Z"
    },
    {
        "account_id": 2,
        "account_name": "Savings",
        "account_details": "This is my savings account",
        "account_balance": "50000.00",
        "account_type": "savings",
        "is_main_account": false,
        "created_at": "2025-09-16T10:00:00.000000Z",
        "updated_at": "2025-09-16T10:00:00.000000Z"
    }
]
```

---

### 28. Get Specific Account
**GET** `/core/account/{id}`

Retrieve a specific account by ID.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):** Account object

---

### 29. Update Account
**PUT** `/core/account/{id}`

Update an existing account. Cannot change the type of the main revenue account.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "account_name": "Emergency Savings",
    "account_details": "Updated savings account for emergencies",
    "account_balance": 75000
}
```

**Response (200):**
```json
{
    "message": "Account updated successfully",
    "data": { /* updated account object */ }
}
```

---

### 30. Delete Account
**DELETE** `/core/account/{id}`

Delete an account. Cannot delete the main revenue account.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "message": "Account deleted successfully"
}
```

**Error (422):**
```json
{
    "message": "Cannot delete the main revenue account"
}
```

---

### 31. Get Total Revenue (Live)
**GET** `/core/revenue/total`

Returns total revenue based on the LIVE sum of all account balances. This means manual transactions (inflow/outflow) persist after refresh. For backward compatibility, a profit-based total is also returned.

Frontend should use `total_revenue` (alias of `total_revenue_live`).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "total_revenue": 1250000.00,
    "total_revenue_live": 1250000.00,
    "profit_based_total": 1000000.00,
    "breakdown": {
        "stock_sales_profit": 750000.00,
        "rental_profit": 250000.00
    },
    "main_account": {
        "account_id": 1,
        "account_name": "Total Revenue",
        "account_balance": "800000.00",
        "account_type": "revenue",
        "is_main_account": true
    }
}
```

Notes:
- `total_revenue`/`total_revenue_live` = `SUM(accounts.account_balance)`.
- `profit_based_total` = legacy profit computation; kept for reporting. Frontend cards should ignore this and display `total_revenue`.

---

### 32. Allocate Revenue to Account
**POST** `/core/account/{id}/allocate`

Allocate a portion of total revenue to a specific account. This DEDUCTS from the main revenue account and CREDITS the target account atomically.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "amount": 100000,
    "description": "Monthly savings allocation"
}
```

**Response (200):**
```json
{
    "message": "Revenue allocated successfully",
    "data": {
        "account": { /* updated account object */ },
        "allocated_amount": 100000,
        "description": "Monthly savings allocation",
        "remaining_revenue": 900000
    }
}
```

**Error (422):**
```json
{
    "message": "Allocation amount exceeds available revenue",
    "available_revenue": 500000
}
```

---

### 33. Transfer Money Between Accounts
**POST** `/core/account/transfer`

Transfer money from one account to another.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "from_account_id": 2,
    "to_account_id": 3,
    "amount": 25000,
    "description": "Transfer to investment account"
}
```

**Response (200):**
```json
{
    "message": "Transfer completed successfully",
    "data": {
        "from_account": { /* updated source account */ },
        "to_account": { /* updated destination account */ },
        "amount": 25000,
        "description": "Transfer to investment account"
    }
}
```

**Error (422):**
```json
{
    "message": "Insufficient balance in source account",
    "available_balance": 10000
}
```

---

### 34. Get Account Summary
**GET** `/core/accounts/summary`

Get a comprehensive summary of all accounts and revenue allocation.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "summary": {
        "total_revenue": 1000000,
        "total_allocated": 150000,
        "available_revenue": 850000
    },
    "accounts": [
        { /* main revenue account */ },
        { /* savings account */ },
        { /* other accounts */ }
    ]
}
```

---

## Customer Management Endpoints

### 15. Create Customer and Record Purchase
**POST** `/core/customer`

Creates a customer and records purchased items. Automatically deducts purchased quantities from stock, updates `total_sold`, adds to `total_profit`, and recomputes `stock_value` for remaining stock (when `item_price` exists). All operations are done in a transaction.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "customer_name": "Jane Doe",
  "customer_phone_no": "+1-555-0100",
  "bill_paid": 20,
  "items": [
    { "stock_id": 1, "quantity": 2, "unit_price": 12.5 },
    { "stock_id": 3, "quantity": 1 }
  ]
}
```

Rules:
- **customer_name**: required, string
- **customer_phone_no**: optional, string
- **items**: required array, at least one item
- **items[].stock_id**: required, must exist in `stock_management.item_id`
- **items[].quantity**: required, number > 0, must not exceed available `quantity_per_unit`
- **items[].unit_price**: optional number; if omitted, falls back to the stock's `item_price`
- **bill_paid**: optional number ≥ 0; `bill_due` is computed as `total_bill - bill_paid`

Behavior:
- For each item: `line_total = unit_price × quantity`
- Stock updates per item:
  - `quantity_per_unit -= quantity`
  - `total_sold += quantity`
  - `total_profit += line_total`
  - If `item_price` exists, `stock_value = item_price × remaining quantity`
- Customer totals:
  - `total_bill = Σ line_total`
  - `bill_due = max(0, total_bill - bill_paid)`

**Success (201):**
```json
{
  "message": "Customer created and purchase recorded",
  "data": {
    "customer": {
      "id": 10,
      "customer_name": "Jane Doe",
      "customer_phone_no": "+1-555-0100",
      "total_bill": 37.5,
      "bill_paid": 20,
      "bill_due": 17.5,
      "created_at": "2025-09-16T10:00:00.000000Z",
      "updated_at": "2025-09-16T10:00:00.000000Z"
    },
    "purchased_items": [
      { "item_id": 1, "item_name": "Rice",  "quantity": 2, "unit_price": 12.5, "line_total": 25 },
      { "item_id": 3, "item_name": "Sugar", "quantity": 1, "unit_price": 12.5, "line_total": 12.5 }
    ],
    "invoice": {
      "id": 101,
      "invoice_number": "INV-20250101-101",
      "total_amount": 37.5,
      "paid_amount": 20,
      "due_amount": 17.5,
      "status": "partial",
      "issued_at": "2025-01-01T10:00:00.000000Z"
    }
  }
}
```

**Validation/Error (422):**
```json
{ "message": "Purchase quantity exceeds available stock for item_id 3" }
```

---

## Invoice Management Endpoints

### 35. List Invoices
**GET** `/core/invoices`

Returns all invoices with linked customers.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):** Array of invoices with `customers` relation.

---

## Transactions Endpoints

Transactions let you record money moving into your business (inflow) or out (outflow). Each transaction affects a specific account's balance.

### 37. Add Transaction
**POST** `/core/transactions`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Store Maintenance",
  "type": "outflow",
  "amount": 2500,
  "account_id": 2,
  "notes": "AC service",
  "transacted_at": "2025-09-16T12:30:00Z"
}
```

Rules:
- type: inflow|outflow
- amount: > 0
- account_id: must exist
- For outflow, must have sufficient account balance

**Success (201):**
```json
{
  "message": "Transaction recorded successfully",
  "data": {
    "id": 10,
    "title": "Store Maintenance",
    "type": "outflow",
    "amount": "2500.00",
    "account_id": 2,
    "notes": "AC service",
    "transacted_at": "2025-09-16T12:30:00.000000Z",
    "created_at": "2025-09-16T12:30:10.000000Z",
    "updated_at": "2025-09-16T12:30:10.000000Z",
    "account": { "account_id": 2, "account_name": "Savings", "account_balance": "47500.00" }
  },
  "main_revenue": {
    "account_id": 1,
    "account_name": "Total Revenue",
    "account_balance": 999750.00
  }
}
```

**Validation/Error (422):** `{ "message": "Insufficient balance in selected account." }`

---

### 38. Get Transactions
**GET** `/core/transactions`

Optional query params: `type`, `account_id`, `from`, `to`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):** Array of transactions with `account` relation.

Note: On creation, the API returns `main_revenue` so the frontend can immediately refresh the revenue card. If you withdraw from the main revenue account, it will be reflected here.

---

### 39. Delete Transaction
**DELETE** `/core/transactions/{id}`

Deletes a transaction record only. This does not alter account balances or total revenue.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):** `{ "message": "Transaction deleted successfully" }`

---

### 36. Download Invoice by ID (PDF)
**GET** `/core/invoices/{id}/download`

Downloads the invoice as a PDF file.

Notes:
- Requires `barryvdh/laravel-dompdf`.
- Uses the `resources/views/invoice.blade.php` template.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** PDF file download.

---

### 16. Get Customers
**GET** `/core/customer`

Returns all customers with summary of purchased items. Each customer includes a `purchased_items` array with `{ item_id, item_name, quantity, unit_price, line_total }`.

**Response (200) example:**
```json
[
  {
    "id": 10,
    "customer_name": "Jane Doe",
    "customer_phone_no": "+1-555-0100",
    "total_bill": 37.5,
    "bill_paid": 20,
    "bill_due": 17.5,
    "created_at": "2025-09-16T10:00:00.000000Z",
    "updated_at": "2025-09-16T10:00:00.000000Z",
    "purchased_items": [
      { "item_id": 1, "item_name": "Rice",  "quantity": 2, "unit_price": 12.5, "line_total": 25 },
      { "item_id": 3, "item_name": "Sugar", "quantity": 1, "unit_price": 12.5, "line_total": 12.5 }
    ]
  }
]
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):** Array of customers with purchased items.

---

### 17. Download Customer Invoice (PDF)
**GET** `/core/customer/{id}/invoice`

Generates and downloads a PDF invoice for the given customer using `resources/views/invoice.blade.php`.

Notes:
- Requires the PDF package: `barryvdh/laravel-dompdf`.
- If the invoice view is missing, returns a 500 with `Invoice template missing`.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** PDF file download.

---

### 18. Attach Existing Invoice to Customer
**POST** `/core/customer/{id}/invoice/attach`

Attach an existing invoice to a customer (manual association from a UI button).

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{ "invoice_id": 101 }
```

**Response (200):** `{ "message": "Invoice attached successfully" }`

---

### 19. List Customer Invoices
**GET** `/core/customer/{id}/invoices`

Returns all invoices attached to the customer.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):** Array of invoice objects.

---

### 18. Delete Customer
**DELETE** `/core/customer/{id}`

Deletes a customer and all their purchased item records.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{ "message": "Customer deleted successfully" }
```


## User Management Endpoints

### 12. Get Current User (Sanctum Default)
**GET** `/user`

Get the currently authenticated user's information (Laravel Sanctum default route).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "email_verified_at": null,
    "created_at": "2025-09-14T10:00:00.000000Z",
    "updated_at": "2025-09-14T10:00:00.000000Z"
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
    "message": "Unauthenticated."
}
```

### 403 Forbidden
```json
{
    "message": "This action is unauthorized."
}
```

### 404 Not Found
```json
{
    "message": "Not Found"
}
```

### 422 Unprocessable Entity
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "field_name": ["Error message"]
    }
}
```

### 500 Internal Server Error
```json
{
    "message": "Server Error"
}
```

---

## Data Models

### User Model
```json
{
    "id": "integer",
    "name": "string",
    "email": "string (email)",
    "user_role": "string",
    "email_verified_at": "timestamp|null",
    "created_at": "timestamp",
    "updated_at": "timestamp"
}
```

### Unit Model
```json
{
    "unit_id": "integer",
    "unit_name": "string",
    "metric": "string",
    "custom_metric": "string|null",
    "created_at": "timestamp",
    "updated_at": "timestamp"
}
```

### Stock Model
```json
{
    "item_id": "integer",
    "item_name": "string",
    "unit_id": "integer (foreign key)",
    "quantity_per_unit": "decimal(10,2)",
    "category_id": "integer|null (foreign key, optional)",
    "stock_value": "decimal(10,2)|null (monetary value, optional)",
    "stock_status": "enum (in_stock|out_of_stock|pending, default: in_stock)",
    "created_at": "timestamp",
    "updated_at": "timestamp"
}
```

### Category Model
```json
{
    "category_id": "integer",
    "category_name": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
}
```

### Rental Stock Model
```json
{
    "item_id": "integer",
    "item_name": "string",
    "unit_id": "integer (foreign key)",
    "quantity_per_unit": "decimal(10,2)",
    "category_id": "integer|null (foreign key, optional)",
    "total_rent_amount": "decimal(10,2)|null (total rent for current rental period)",
    "stock_value": "decimal(10,2)|null (estimated value based on rental rates)",
    "total_rented": "decimal(10,2) (total quantity currently rented)",
    "total_profit": "decimal(10,2) (total rental revenue)",
    "rented_on": "date|null (rental start date)",
    "rented_till": "date|null (rental end date)",
    "stock_status": "enum (available|rented|maintenance|pending, default: available)",
    "created_at": "timestamp",
    "updated_at": "timestamp"
}
```

### Account Model
```json
{
    "account_id": "integer",
    "account_name": "string",
    "account_details": "string|null (account description)",
    "account_balance": "decimal(15,2) (current account balance)",
    "account_type": "enum (revenue|expense|savings|investment|other, default: other)",
    "is_main_account": "boolean (true for main revenue account, default: false)",
    "created_at": "timestamp",
    "updated_at": "timestamp"
}
```

---

## Usage Examples

### Frontend Integration Example (JavaScript)

```javascript
// Login and store token
const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    localStorage.setItem('token', data.access_token);
    return data;
};

// Make authenticated requests
const getStock = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/core/stock', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response.json();
};

// Add new stock item
const addStock = async (stockData) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/core/stock', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(stockData)
    });
    
    return response.json();
};
```

### cURL Examples

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get stock items
curl -X GET http://localhost:8000/api/core/stock \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Add new unit
curl -X POST http://localhost:8000/api/core/unit \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"unit_name":"Kilogram","metric":"kg","custom_metric":"Weight unit"}'
```

---

## Notes

1. **Authentication**: All core endpoints require authentication via Bearer token
2. **CORS**: Make sure your frontend domain is configured in the CORS settings
3. **Validation**: All input data is validated according to Laravel validation rules
4. **Relationships**: Stock items are linked to Units via foreign keys, and optionally to Categories
5. **Decimal Precision**: Quantity fields use decimal(10,2) for precise calculations

## Missing Endpoints

The following endpoints are not yet implemented but would be useful:
- Update/Delete operations for Units and Categories
- Bulk operations for stock management
- Search and filtering capabilities
- Pagination for large datasets
