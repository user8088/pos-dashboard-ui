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
- supplier_id (optional, exists: suppliers.id)

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
  "total_waste_cost": 0,
  "supplier_id": 1
}
```
Notes:
- **unit_purchase_cost (optional)**: If provided, the API will compute `purchase_cost = unit_purchase_cost × amount_per_unit` and persist both values.
- If `unit_purchase_cost` is omitted, the provided `purchase_cost` is used as‑is.

**Response (201):** Raw material JSON with supplier relationship.

**Note:** When `supplier_id` is provided, the supplier's order statistics are automatically updated with the purchase cost and order count.

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
- supplier_id (exists: suppliers.id|null)

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
  "status": "delivered",
  "supplier_id": 2
}
```

**Note:** When `supplier_id` is changed or `purchase_cost` is updated, the supplier statistics are automatically recalculated. The old supplier's statistics are decremented and the new supplier's statistics are incremented accordingly.
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

#### 11.5 Get Suppliers for Raw Material Dropdown
**GET** `/core/raw-material/suppliers`

Get all active suppliers for dropdown selection in raw material forms.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
[
    {
        "id": 1,
        "supplier_name": "ABC Materials Ltd",
        "status": "active"
    },
    {
        "id": 2,
        "supplier_name": "Premium Materials Co",
        "status": "active"
    }
]
```

---

#### 11.6 Record Raw Material Waste
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

---

## Sales Analytics Endpoints

The Sales Analytics system provides comprehensive analytics for stock management with KPIs, charts, and period-based reporting. It computes sales statistics for today, week, month, year, and custom business seasons.

### 40. Get Dashboard Data (Comprehensive)
**GET** `/core/analytics/dashboard`

Get comprehensive dashboard data including KPIs and chart data for the specified period.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `period` (optional): `today`, `week`, `month`, `year`, `business_season` (default: `today`)
- `start_date` (optional): Start date for week/business_season periods
- `end_date` (optional): End date for business_season periods
- `year` (optional): Year for year/month periods
- `month` (optional): Month for month periods

**Response (200):**
```json
{
    "success": true,
    "data": {
        "kpis": {
            "gross_revenue": {
                "value": 120000,
                "change": 11,
                "change_type": "increase"
            },
            "avg_order_value": {
                "value": 20000,
                "change": 2,
                "change_type": "increase"
            },
            "conversion_rate": {
                "value": 3,
                "change": 4,
                "change_type": "increase"
            },
            "customers": {
                "value": 80,
                "change": -2,
                "change_type": "decrease"
            }
        },
        "charts": {
            "revenue_trend": [2000, 1800, 2200, 4000, 6000, 8000, 10000, 9500, 8000, 6000, 4000, 2000],
            "category_breakdown": [
                {
                    "category": "Construction Materials",
                    "revenue": 45000,
                    "quantity": 150,
                    "percentage": 37.5
                },
                {
                    "category": "PVC & Pipes",
                    "revenue": 38000,
                    "quantity": 120,
                    "percentage": 31.7
                }
            ]
        },
        "best_selling_products": [
            {
                "rank": 1,
                "product_id": 1,
                "product_name": "Electric Drill",
                "category": "Tools & Hardware",
                "total_sales": 195,
                "total_revenue": 20000.00,
                "transaction_count": 45
            },
            {
                "rank": 2,
                "product_id": 2,
                "product_name": "Electric Ranch",
                "category": "Electrical Accessories",
                "total_sales": 90,
                "total_revenue": 20000.00,
                "transaction_count": 30
            },
            {
                "rank": 3,
                "product_id": 3,
                "product_name": "Rubber Hammer",
                "category": "Tools & Hardware",
                "total_sales": 330,
                "total_revenue": 20000.00,
                "transaction_count": 25
            }
        ],
        "period": "today",
        "period_info": {
            "start": "2025-09-18T00:00:00.000000Z",
            "end": "2025-09-18T23:59:59.000000Z"
        }
    }
}
```

---

### 41. Get Today's Analytics
**GET** `/core/analytics/today`

Get analytics for today with comparison to yesterday.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "period_start": "2025-09-18T00:00:00.000000Z",
        "period_end": "2025-09-18T23:59:59.000000Z",
        "gross_revenue": 120000,
        "avg_order_value": 20000,
        "conversion_rate": 3,
        "total_customers": 80,
        "total_orders": 6,
        "total_quantity_sold": 250,
        "category_breakdown": [...],
        "hourly_revenue": [2000, 1800, 2200, ...],
        "gross_revenue_change": 11,
        "avg_order_value_change": 2,
        "conversion_rate_change": 4,
        "customer_count_change": -2
    },
    "period": "today"
}
```

---

### 42. Get Week Analytics
**GET** `/core/analytics/week`

Get analytics for a specific week.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `start_date` (optional): Week start date (default: current week start)

**Response (200):**
```json
{
    "success": true,
    "data": {
        "period_start": "2025-09-16T00:00:00.000000Z",
        "period_end": "2025-09-22T23:59:59.000000Z",
        "gross_revenue": 850000,
        "avg_order_value": 18000,
        "conversion_rate": 2.8,
        "total_customers": 450,
        "total_orders": 47,
        "total_quantity_sold": 1850,
        "category_breakdown": [...]
    },
    "period": "week"
}
```

---

### 43. Get Month Analytics
**GET** `/core/analytics/month`

Get analytics for a specific month.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `year` (optional): Year (default: current year)
- `month` (optional): Month 1-12 (default: current month)

**Response (200):**
```json
{
    "success": true,
    "data": {
        "period_start": "2025-09-01T00:00:00.000000Z",
        "period_end": "2025-09-30T23:59:59.000000Z",
        "gross_revenue": 3200000,
        "avg_order_value": 19500,
        "conversion_rate": 3.2,
        "total_customers": 1650,
        "total_orders": 164,
        "total_quantity_sold": 7200,
        "category_breakdown": [...]
    },
    "period": "month"
}
```

---

### 44. Get Year Analytics
**GET** `/core/analytics/year`

Get analytics for a specific year.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `year` (optional): Year (default: current year)

**Response (200):**
```json
{
    "success": true,
    "data": {
        "period_start": "2025-01-01T00:00:00.000000Z",
        "period_end": "2025-12-31T23:59:59.000000Z",
        "gross_revenue": 38500000,
        "avg_order_value": 21000,
        "conversion_rate": 3.5,
        "total_customers": 18500,
        "total_orders": 1833,
        "total_quantity_sold": 85000,
        "category_breakdown": [...]
    },
    "period": "year"
}
```

---

### 45. Get Business Season Analytics
**GET** `/core/analytics/business-season`

Get analytics for a custom business season (date range).

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD, must be after start_date)

**Response (200):**
```json
{
    "success": true,
    "data": {
        "period_start": "2025-06-01T00:00:00.000000Z",
        "period_end": "2025-08-31T23:59:59.000000Z",
        "gross_revenue": 12500000,
        "avg_order_value": 22000,
        "conversion_rate": 3.8,
        "total_customers": 5680,
        "total_orders": 568,
        "total_quantity_sold": 28500,
        "category_breakdown": [...]
    },
    "period": "business_season"
}
```

**Validation Errors (422):**
```json
{
    "success": false,
    "message": "The end date must be a date after start date."
}
```

---

### 46. Get Revenue Trend
**GET** `/core/analytics/revenue-trend`

Get revenue trend data for charts based on the specified period.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `period` (optional): `today`, `week`, `month`, `year`, `business_season` (default: `today`)
- `start_date` (optional): Start date for week/business_season periods
- `end_date` (optional): End date for business_season periods

**Response (200):**
```json
{
    "success": true,
    "data": {
        "0": 2000,
        "1": 1800,
        "2": 2200,
        "3": 4000,
        "4": 6000,
        "5": 8000,
        "6": 10000,
        "7": 9500,
        "8": 8000,
        "9": 6000,
        "10": 4000,
        "11": 2000
    },
    "period": "today"
}
```

**Note:** For `today` period, returns hourly data (0-23). For other periods, returns daily/monthly/quarterly data.

---

### 47. Save Analytics
**POST** `/core/analytics/save`

Save computed analytics to database for caching purposes.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "period_type": "today",
    "analytics_data": {
        "period_start": "2025-09-18T00:00:00.000000Z",
        "period_end": "2025-09-18T23:59:59.000000Z",
        "gross_revenue": 120000,
        "avg_order_value": 20000,
        "conversion_rate": 3,
        "total_customers": 80,
        "total_orders": 6,
        "total_quantity_sold": 250,
        "category_breakdown": [...],
        "hourly_revenue": [...]
    }
}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "period_type": "today",
        "period_start": "2025-09-18T00:00:00.000000Z",
        "period_end": "2025-09-18T23:59:59.000000Z",
        "gross_revenue": "120000.00",
        "avg_order_value": "20000.00",
        "conversion_rate": "3.00",
        "total_customers": 80,
        "total_orders": 6,
        "total_quantity_sold": "250.00",
        "category_breakdown": {...},
        "hourly_revenue": {...},
        "created_at": "2025-09-18T10:00:00.000000Z",
        "updated_at": "2025-09-18T10:00:00.000000Z"
    },
    "message": "Analytics saved successfully"
}
```

---

### 48. Get Cached Analytics
**GET** `/core/analytics/cached`

Retrieve cached analytics from database.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `period_type` (optional): `today`, `week`, `month`, `year`, `business_season` (default: `today`)
- `start_date` (optional): Start date filter
- `end_date` (optional): End date filter

**Response (200):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "period_type": "today",
            "period_start": "2025-09-18T00:00:00.000000Z",
            "period_end": "2025-09-18T23:59:59.000000Z",
            "gross_revenue": "120000.00",
            "avg_order_value": "20000.00",
            "conversion_rate": "3.00",
            "total_customers": 80,
            "total_orders": 6,
            "total_quantity_sold": "250.00",
            "category_breakdown": {...},
            "hourly_revenue": {...},
            "created_at": "2025-09-18T10:00:00.000000Z",
            "updated_at": "2025-09-18T10:00:00.000000Z"
        }
    ]
}
```

---

### 49. Get Best Selling Products Today
**GET** `/core/analytics/best-selling-products/today`

Get the best selling products for today.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (optional): Number of products to return (default: 10, max: 50)

**Response (200):**
```json
{
    "success": true,
    "data": [
        {
            "rank": 1,
            "product_id": 1,
            "product_name": "Electric Drill",
            "category": "Tools & Hardware",
            "total_sales": 195,
            "total_revenue": 20000.00,
            "transaction_count": 45
        },
        {
            "rank": 2,
            "product_id": 2,
            "product_name": "Electric Ranch",
            "category": "Electrical Accessories",
            "total_sales": 90,
            "total_revenue": 20000.00,
            "transaction_count": 30
        },
        {
            "rank": 3,
            "product_id": 3,
            "product_name": "Rubber Hammer",
            "category": "Tools & Hardware",
            "total_sales": 330,
            "total_revenue": 20000.00,
            "transaction_count": 25
        },
        {
            "rank": 4,
            "product_id": 4,
            "product_name": "Electric Multi Tool",
            "category": "Electrical Accessories",
            "total_sales": 56,
            "total_revenue": 20000.00,
            "transaction_count": 15
        },
        {
            "rank": 5,
            "product_id": 5,
            "product_name": "Steel Hammer",
            "category": "Tools & Hardware",
            "total_sales": 35,
            "total_revenue": 20000.00,
            "transaction_count": 10
        }
    ],
    "period": "today"
}
```

---

### 50. Get Best Selling Products for Period
**GET** `/core/analytics/best-selling-products`

Get the best selling products for a specific period.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `period` (optional): `today`, `week`, `month`, `year`, `business_season` (default: `today`)
- `start_date` (optional): Start date for week/business_season periods
- `end_date` (optional): End date for business_season periods
- `year` (optional): Year for year/month periods
- `month` (optional): Month for month periods
- `limit` (optional): Number of products to return (default: 10, max: 50)

**Response (200):**
```json
{
    "success": true,
    "data": [
        {
            "rank": 1,
            "product_id": 1,
            "product_name": "Electric Drill",
            "category": "Tools & Hardware",
            "total_sales": 195,
            "total_revenue": 20000.00,
            "transaction_count": 45
        }
    ],
    "period": "today"
}
```

---

### 51. Export Analytics
**POST** `/core/analytics/export`

Export analytics data in various formats.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "period": "today",
    "format": "json",
    "start_date": "2025-09-18",
    "end_date": "2025-09-18"
}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "period_start": "2025-09-18T00:00:00.000000Z",
        "period_end": "2025-09-18T23:59:59.000000Z",
        "gross_revenue": 120000,
        "avg_order_value": 20000,
        "conversion_rate": 3,
        "total_customers": 80,
        "total_orders": 6,
        "total_quantity_sold": 250,
        "category_breakdown": [...],
        "hourly_revenue": [...]
    },
    "format": "json",
    "exported_at": "2025-09-18T10:00:00.000000Z"
}
```

---

## Sales Analytics Data Models

### SalesAnalytics Model
```json
{
    "id": "integer",
    "period_type": "enum (today|week|month|year|business_season)",
    "period_start": "timestamp",
    "period_end": "timestamp",
    "gross_revenue": "decimal(15,2)",
    "avg_order_value": "decimal(15,2)",
    "conversion_rate": "decimal(5,2)",
    "total_customers": "integer",
    "total_orders": "integer",
    "total_quantity_sold": "decimal(15,2)",
    "category_breakdown": "json",
    "hourly_revenue": "json",
    "created_at": "timestamp",
    "updated_at": "timestamp"
}
```

### Category Breakdown Structure
```json
{
    "category": "string (category name)",
    "revenue": "decimal (total revenue for this category)",
    "quantity": "decimal (total quantity sold for this category)",
    "percentage": "decimal (percentage of total revenue)"
}
```

### Hourly Revenue Structure (for today analytics)
```json
{
    "0": "decimal (revenue for hour 0)",
    "1": "decimal (revenue for hour 1)",
    "2": "decimal (revenue for hour 2)",
    ...
    "23": "decimal (revenue for hour 23)"
}
```

---

## Sales Analytics Usage Examples

### Frontend Integration Example (JavaScript)

```javascript
// Get dashboard data for today
const getDashboardData = async (period = 'today', params = {}) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams({ period, ...params });
    
    const response = await fetch(`/api/core/analytics/dashboard?${queryParams}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response.json();
};

// Get specific period analytics
const getAnalytics = async (period, params = {}) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(params);
    
    const response = await fetch(`/api/core/analytics/${period}?${queryParams}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response.json();
};

// Export analytics data
const exportAnalytics = async (period, format = 'json', params = {}) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch('/api/core/analytics/export', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ period, format, ...params })
    });
    
    return response.json();
};

// Get best selling products
const getBestSellingProducts = async (period = 'today', params = {}) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams({ period, ...params });
    
    const response = await fetch(`/api/core/analytics/best-selling-products?${queryParams}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response.json();
};

// Usage examples
const todayData = await getDashboardData('today');
const weekData = await getAnalytics('week', { start_date: '2025-09-16' });
const monthData = await getAnalytics('month', { year: 2025, month: 9 });
const seasonData = await getAnalytics('business-season', { 
    start_date: '2025-06-01', 
    end_date: '2025-08-31' 
});

// Best selling products examples
const todayProducts = await getBestSellingProducts('today', { limit: 5 });
const weekProducts = await getBestSellingProducts('week', { start_date: '2025-09-16', limit: 10 });
const monthProducts = await getBestSellingProducts('month', { year: 2025, month: 9, limit: 15 });
```

### cURL Examples

```bash
# Get today's dashboard data
curl -X GET "http://localhost:8000/api/core/analytics/dashboard?period=today" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get week analytics
curl -X GET "http://localhost:8000/api/core/analytics/week?start_date=2025-09-16" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get business season analytics
curl -X GET "http://localhost:8000/api/core/analytics/business-season?start_date=2025-06-01&end_date=2025-08-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get revenue trend for today
curl -X GET "http://localhost:8000/api/core/analytics/revenue-trend?period=today" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Export analytics data
curl -X POST "http://localhost:8000/api/core/analytics/export" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"period":"today","format":"json"}'

# Get best selling products for today
curl -X GET "http://localhost:8000/api/core/analytics/best-selling-products/today?limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get best selling products for a specific period
curl -X GET "http://localhost:8000/api/core/analytics/best-selling-products?period=week&start_date=2025-09-16&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Supplier Management Endpoints

The Supplier Management system allows you to manage raw material suppliers, track their order history, and monitor supplier statistics.

### 52. Get All Suppliers
**GET** `/core/suppliers`

Retrieve all suppliers with their order statistics and status information.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "supplier_name": "ABC Materials Ltd",
            "email": "contact@abcmaterials.com",
            "phone": "+92-300-1234567",
            "status": "active",
            "status_badge": "green",
            "address": "123 Industrial Area, Karachi, Pakistan",
            "notes": "Primary supplier for construction materials",
            "total_orders": 150000.00,
            "total_spent": 125000.00,
            "order_count": 45,
            "created_at": "2025-09-18T10:00:00.000000Z",
            "updated_at": "2025-09-18T10:00:00.000000Z",
            "raw_material_orders_count": 45
        },
        {
            "id": 2,
            "supplier_name": "Steel Works Corp",
            "email": "orders@steelworks.pk",
            "phone": "+92-321-9876543",
            "status": "on_hold",
            "status_badge": "orange",
            "address": "456 Steel Mill Road, Lahore, Pakistan",
            "notes": "Temporarily suspended due to quality issues",
            "total_orders": 75000.00,
            "total_spent": 65000.00,
            "order_count": 23,
            "created_at": "2025-09-15T08:30:00.000000Z",
            "updated_at": "2025-09-17T14:20:00.000000Z",
            "raw_material_orders_count": 23
        }
    ]
}
```

---

### 53. Add New Supplier
**POST** `/core/suppliers`

Create a new supplier in the system.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "supplier_name": "Premium Materials Co",
    "email": "info@premiummaterials.com",
    "phone": "+92-333-5555555",
    "address": "789 Business District, Islamabad, Pakistan",
    "notes": "High-quality materials supplier",
    "status": "active"
}
```

**Validation Rules:**
- `supplier_name`: required, string, max:255
- `email`: required, email, unique
- `phone`: required, string, max:20
- `address`: optional, string
- `notes`: optional, string
- `status`: optional, enum: `active|inactive|on_hold` (default: `active`)

**Response (201):**
```json
{
    "success": true,
    "data": {
        "id": 3,
        "supplier_name": "Premium Materials Co",
        "email": "info@premiummaterials.com",
        "phone": "+92-333-5555555",
        "status": "active",
        "address": "789 Business District, Islamabad, Pakistan",
        "notes": "High-quality materials supplier",
        "total_orders": "0.00",
        "total_spent": "0.00",
        "order_count": 0,
        "created_at": "2025-09-18T11:00:00.000000Z",
        "updated_at": "2025-09-18T11:00:00.000000Z"
    },
    "message": "Supplier added successfully"
}
```

**Validation Errors (422):**
```json
{
    "success": false,
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The email has already been taken."],
        "supplier_name": ["The supplier name field is required."]
    }
}
```

---

### 54. Update Supplier
**PUT** `/core/suppliers/{id}`

Update an existing supplier's information.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "supplier_name": "Premium Materials Co (Updated)",
    "email": "newemail@premiummaterials.com",
    "phone": "+92-333-6666666",
    "address": "Updated Business District, Islamabad, Pakistan",
    "notes": "Updated supplier notes",
    "status": "active"
}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "id": 3,
        "supplier_name": "Premium Materials Co (Updated)",
        "email": "newemail@premiummaterials.com",
        "phone": "+92-333-6666666",
        "status": "active",
        "address": "Updated Business District, Islamabad, Pakistan",
        "notes": "Updated supplier notes",
        "total_orders": "0.00",
        "total_spent": "0.00",
        "order_count": 0,
        "created_at": "2025-09-18T11:00:00.000000Z",
        "updated_at": "2025-09-18T11:30:00.000000Z"
    },
    "message": "Supplier updated successfully"
}
```

---

### 55. Delete Supplier
**DELETE** `/core/suppliers/{id}`

Delete a supplier from the system.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "success": true,
    "message": "Supplier deleted successfully"
}
```

**Error (422) - Supplier has orders:**
```json
{
    "success": false,
    "message": "Cannot delete supplier with existing raw material orders. Please reassign or delete the orders first."
}
```

---

### 56. Get Supplier Transaction History
**GET** `/core/suppliers/{id}/transactions`

Get all raw material orders and transaction history for a specific supplier.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "supplier": {
            "id": 1,
            "supplier_name": "ABC Materials Ltd",
            "email": "contact@abcmaterials.com",
            "phone": "+92-300-1234567",
            "status": "active"
        },
        "transactions": [
            {
                "id": 1,
                "date": "Sep 18, 2025",
                "type": "Steel Rods",
                "amount": 15000.00,
                "status": "Delivered",
                "material_name": "Steel Rods",
                "amount_per_unit": "100.00",
                "unit_purchase_cost": "150.00",
                "purchase_cost": "15000.00",
                "waste_quantity": "5.00",
                "total_waste_cost": "750.00",
                "created_at": "2025-09-18T09:00:00.000000Z",
                "updated_at": "2025-09-18T09:00:00.000000Z"
            },
            {
                "id": 2,
                "date": "Sep 17, 2025",
                "type": "Cement Bags",
                "amount": 40000.00,
                "status": "Pending",
                "material_name": "Cement Bags",
                "amount_per_unit": "50.00",
                "unit_purchase_cost": "800.00",
                "purchase_cost": "40000.00",
                "waste_quantity": "0.00",
                "total_waste_cost": "0.00",
                "created_at": "2025-09-17T14:30:00.000000Z",
                "updated_at": "2025-09-17T14:30:00.000000Z"
            }
        ],
        "summary": {
            "total_transactions": 2,
            "total_spent": 55000.00,
            "total_orders": 55000.00,
            "order_count": 2
        }
    }
}
```

---

### 57. Get Supplier Statistics
**GET** `/core/suppliers/stats`

Get overall supplier statistics and summary information.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "total_suppliers": 15,
        "active_suppliers": 12,
        "inactive_suppliers": 2,
        "on_hold_suppliers": 1,
        "total_spent": 2500000.00,
        "total_orders": 2200000.00,
        "average_order_value": 1250.00
    }
}
```

---

## Manufacturing Analytics Endpoints

The Manufacturing Analytics system provides comprehensive production analytics with KPIs, material breakdowns, and production trends for manufacturing operations.

### 58. Get Manufacturing Dashboard Data
**GET** `/core/manufacturing/dashboard`

Get comprehensive manufacturing dashboard data including KPIs and production charts.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `period` (optional): `today`, `week`, `month`, `year`, `business_season` (default: `today`)
- `start_date` (optional): Start date for week/business_season periods
- `end_date` (optional): End date for business_season periods
- `year` (optional): Year for year/month periods
- `month` (optional): Month for month periods

**Response (200):**
```json
{
    "success": true,
    "data": {
        "kpis": {
            "gross_production_revenue": {
                "value": 725000,
                "change": 20,
                "change_type": "increase"
            },
            "avg_stock_value": {
                "value": 120000,
                "change": 44,
                "change_type": "increase"
            },
            "stock_conversion_rate": {
                "value": 40,
                "change": 12,
                "change_type": "increase"
            },
            "suppliers": {
                "value": 3000,
                "change": 1200,
                "change_type": "increase"
            }
        },
        "charts": {
            "production_trend": [10000, 12000, 15000, 18000, 22000, 25000, 28000, 30000, 32000, 30000, 28000, 25000],
            "material_breakdown": [
                {
                    "category": "Construction Materials",
                    "production_value": 450000,
                    "quantity_produced": 1500,
                    "percentage": 62.1
                },
                {
                    "category": "Electrical Components",
                    "production_value": 200000,
                    "quantity_produced": 800,
                    "percentage": 27.6
                },
                {
                    "category": "Tools & Hardware",
                    "production_value": 75000,
                    "quantity_produced": 300,
                    "percentage": 10.3
                }
            ]
        },
        "period": "today",
        "period_info": {
            "start": "2025-09-18T00:00:00.000000Z",
            "end": "2025-09-18T23:59:59.000000Z"
        }
    }
}
```

---

### 59. Get Today's Manufacturing Analytics
**GET** `/core/manufacturing/today`

Get manufacturing analytics for today with comparison to yesterday.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "period_start": "2025-09-18T00:00:00.000000Z",
        "period_end": "2025-09-18T23:59:59.000000Z",
        "gross_production_revenue": 725000,
        "avg_stock_value": 120000,
        "stock_conversion_rate": 40,
        "total_suppliers": 15,
        "total_materials_produced": 2500,
        "total_quantity_produced": 1800,
        "material_breakdown": [
            {
                "category": "Construction Materials",
                "production_value": 450000,
                "quantity_produced": 1500,
                "percentage": 62.1
            }
        ],
        "monthly_production_trend": {},
        "gross_production_revenue_change": 20,
        "avg_stock_value_change": 44,
        "stock_conversion_rate_change": 12,
        "supplier_count_change": 2
    }
}
```

---

### 60. Get Week Manufacturing Analytics
**GET** `/core/manufacturing/week`

Get manufacturing analytics for a specific week.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `start_date` (optional): Week start date (default: current week start)

**Response (200):**
```json
{
    "success": true,
    "data": {
        "period_start": "2025-09-16T00:00:00.000000Z",
        "period_end": "2025-09-22T23:59:59.000000Z",
        "gross_production_revenue": 4500000,
        "avg_stock_value": 180000,
        "stock_conversion_rate": 35,
        "total_suppliers": 18,
        "total_materials_produced": 15000,
        "total_quantity_produced": 12000,
        "material_breakdown": [...],
        "monthly_production_trend": {
            "9": 4500000
        }
    }
}
```

---

### 61. Get Month Manufacturing Analytics
**GET** `/core/manufacturing/month`

Get manufacturing analytics for a specific month.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `year` (optional): Year (default: current year)
- `month` (optional): Month 1-12 (default: current month)

**Response (200):**
```json
{
    "success": true,
    "data": {
        "period_start": "2025-09-01T00:00:00.000000Z",
        "period_end": "2025-09-30T23:59:59.000000Z",
        "gross_production_revenue": 18500000,
        "avg_stock_value": 250000,
        "stock_conversion_rate": 42,
        "total_suppliers": 25,
        "total_materials_produced": 65000,
        "total_quantity_produced": 55000,
        "material_breakdown": [...],
        "monthly_production_trend": {
            "9": 18500000
        }
    }
}
```

---

### 62. Get Year Manufacturing Analytics
**GET** `/core/manufacturing/year`

Get manufacturing analytics for a specific year.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `year` (optional): Year (default: current year)

**Response (200):**
```json
{
    "success": true,
    "data": {
        "period_start": "2025-01-01T00:00:00.000000Z",
        "period_end": "2025-12-31T23:59:59.000000Z",
        "gross_production_revenue": 225000000,
        "avg_stock_value": 350000,
        "stock_conversion_rate": 38,
        "total_suppliers": 45,
        "total_materials_produced": 750000,
        "total_quantity_produced": 650000,
        "material_breakdown": [...],
        "monthly_production_trend": {
            "1": 18000000,
            "2": 19500000,
            "3": 21000000,
            "4": 22500000,
            "5": 24000000,
            "6": 25500000,
            "7": 27000000,
            "8": 28500000,
            "9": 30000000
        }
    }
}
```

---

### 63. Get Business Season Manufacturing Analytics
**GET** `/core/manufacturing/business-season`

Get manufacturing analytics for a custom business season (date range).

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD, must be after start_date)

**Response (200):**
```json
{
    "success": true,
    "data": {
        "period_start": "2025-06-01T00:00:00.000000Z",
        "period_end": "2025-08-31T23:59:59.000000Z",
        "gross_production_revenue": 75000000,
        "avg_stock_value": 300000,
        "stock_conversion_rate": 45,
        "total_suppliers": 35,
        "total_materials_produced": 250000,
        "total_quantity_produced": 200000,
        "material_breakdown": [...],
        "monthly_production_trend": {
            "6": 25000000,
            "7": 25000000,
            "8": 25000000
        }
    }
}
```

---

### 64. Get Production Trend
**GET** `/core/manufacturing/production-trend`

Get production trend data for charts based on the specified period.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `period` (optional): `today`, `week`, `month`, `year`, `business_season` (default: `today`)
- `start_date` (optional): Start date for week/business_season periods
- `end_date` (optional): End date for business_season periods

**Response (200):**
```json
{
    "success": true,
    "data": {
        "0": 5000,
        "1": 7500,
        "2": 10000,
        "3": 12500,
        "4": 15000,
        "5": 17500,
        "6": 20000,
        "7": 22000,
        "8": 25000,
        "9": 28000,
        "10": 30000,
        "11": 32000,
        "12": 35000,
        "13": 38000,
        "14": 40000,
        "15": 42000,
        "16": 45000,
        "17": 48000,
        "18": 50000,
        "19": 52000,
        "20": 55000,
        "21": 58000,
        "22": 60000,
        "23": 62000
    },
    "period": "today"
}
```

**Note:** For `today` period, returns hourly data (0-23). For other periods, returns daily/monthly/quarterly data.

---

## Manufacturing Analytics Data Models

### ManufacturingAnalytics Model
```json
{
    "id": "integer",
    "period_type": "enum (today|week|month|year|business_season)",
    "period_start": "timestamp",
    "period_end": "timestamp",
    "gross_production_revenue": "decimal(15,2)",
    "avg_stock_value": "decimal(15,2)",
    "stock_conversion_rate": "decimal(5,2)",
    "total_suppliers": "integer",
    "total_materials_produced": "decimal(15,2)",
    "total_quantity_produced": "decimal(15,2)",
    "material_breakdown": "json",
    "monthly_production_trend": "json",
    "created_at": "timestamp",
    "updated_at": "timestamp"
}
```

### Supplier Model
```json
{
    "id": "integer",
    "supplier_name": "string",
    "email": "string (email)",
    "phone": "string",
    "status": "enum (active|inactive|on_hold)",
    "address": "string|null",
    "notes": "string|null",
    "total_orders": "decimal(15,2)",
    "total_spent": "decimal(15,2)",
    "order_count": "integer",
    "created_at": "timestamp",
    "updated_at": "timestamp"
}
```

### Material Breakdown Structure
```json
{
    "category": "string (category name)",
    "production_value": "decimal (total production value for this category)",
    "quantity_produced": "decimal (total quantity produced for this category)",
    "percentage": "decimal (percentage of total production value)"
}
```

---

## Manufacturing Analytics Usage Examples

### Frontend Integration Example (JavaScript)

```javascript
// Get manufacturing dashboard data
const getManufacturingDashboard = async (period = 'today', params = {}) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams({ period, ...params });
    
    const response = await fetch(`/api/core/manufacturing/dashboard?${queryParams}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response.json();
};

// Get supplier management data
const getSuppliers = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/core/suppliers', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response.json();
};

// Add new supplier
const addSupplier = async (supplierData) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/core/suppliers', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(supplierData)
    });
    
    return response.json();
};

// Get supplier transaction history
const getSupplierTransactions = async (supplierId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/core/suppliers/${supplierId}/transactions`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response.json();
};

// Get suppliers for raw material dropdown
const getSuppliersForRawMaterial = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/core/raw-material/suppliers', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response.json();
};

// Add raw material with supplier
const addRawMaterialWithSupplier = async (rawMaterialData) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/core/raw-material', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(rawMaterialData)
    });
    
    return response.json();
};

// Update raw material supplier
const updateRawMaterialSupplier = async (rawMaterialId, supplierData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/core/raw-material/${rawMaterialId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(supplierData)
    });
    
    return response.json();
};

// Usage examples
const todayManufacturing = await getManufacturingDashboard('today');
const weekManufacturing = await getManufacturingDashboard('week', { start_date: '2025-09-16' });
const monthManufacturing = await getManufacturingDashboard('month', { year: 2025, month: 9 });
const seasonManufacturing = await getManufacturingDashboard('business-season', { 
    start_date: '2025-06-01', 
    end_date: '2025-08-31' 
});

const suppliers = await getSuppliers();
const supplierTransactions = await getSupplierTransactions(1);

// Raw material with supplier examples
const suppliersForDropdown = await getSuppliersForRawMaterial();
const rawMaterialWithSupplier = await addRawMaterialWithSupplier({
    material_name: "Steel Rods",
    amount_per_unit: 100.00,
    unit_purchase_cost: 150.00,
    status: "delivered",
    supplier_id: 1
});
const updatedSupplier = await updateRawMaterialSupplier(1, {
    supplier_id: 2,
    purchase_cost: 18000.00
});
```

### cURL Examples

```bash
# Get manufacturing dashboard for today
curl -X GET "http://localhost:8000/api/core/manufacturing/dashboard?period=today" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get manufacturing analytics for a specific week
curl -X GET "http://localhost:8000/api/core/manufacturing/week?start_date=2025-09-16" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get all suppliers
curl -X GET "http://localhost:8000/api/core/suppliers" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Add new supplier
curl -X POST "http://localhost:8000/api/core/suppliers" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "supplier_name": "Premium Materials Co",
    "email": "info@premiummaterials.com",
    "phone": "+92-333-5555555",
    "address": "789 Business District, Islamabad, Pakistan",
    "notes": "High-quality materials supplier",
    "status": "active"
  }'

# Get supplier transaction history
curl -X GET "http://localhost:8000/api/core/suppliers/1/transactions" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get supplier statistics
curl -X GET "http://localhost:8000/api/core/suppliers/stats" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get production trend for today
curl -X GET "http://localhost:8000/api/core/manufacturing/production-trend?period=today" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get suppliers for raw material dropdown
curl -X GET "http://localhost:8000/api/core/raw-material/suppliers" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Add raw material with supplier
curl -X POST "http://localhost:8000/api/core/raw-material" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "material_name": "Steel Rods",
    "amount_per_unit": 100.00,
    "unit_purchase_cost": 150.00,
    "status": "delivered",
    "supplier_id": 1
  }'

# Update raw material with new supplier
curl -X PUT "http://localhost:8000/api/core/raw-material/1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "supplier_id": 2,
    "purchase_cost": 18000.00
  }'
```

---

## Manufacturing Analytics Endpoints

The Manufacturing Analytics system provides comprehensive production analytics with KPIs, material breakdowns, and production trends for manufacturing operations.

### 58. Get Manufacturing Dashboard Data
**GET** `/core/manufacturing/dashboard`

Get comprehensive manufacturing dashboard data including KPIs and production charts.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `period` (optional): `today`, `week`, `month`, `year`, `business_season` (default: `today`)
- `start_date` (optional): Start date for week/business_season periods
- `end_date` (optional): End date for business_season periods
- `year` (optional): Year for year/month periods
- `month` (optional): Month for month periods

**Response (200):**
```json
{
    "success": true,
    "data": {
        "kpis": {
            "gross_production_revenue": {
                "value": 725000,
                "change": 20,
                "change_type": "increase"
            },
            "avg_stock_value": {
                "value": 120000,
                "change": 44,
                "change_type": "increase"
            },
            "stock_conversion_rate": {
                "value": 40,
                "change": 12,
                "change_type": "increase"
            },
            "suppliers": {
                "value": 15,
                "change": 2,
                "change_type": "increase"
            }
        },
        "charts": {
            "production_trend": [10000, 12000, 15000, 18000, 22000, 25000, 28000, 30000, 32000, 30000, 28000, 25000],
            "material_breakdown": [
                {
                    "category": "Construction Materials",
                    "production_value": 450000,
                    "quantity_produced": 1500,
                    "percentage": 62.1
                },
                {
                    "category": "Electrical Components",
                    "production_value": 200000,
                    "quantity_produced": 800,
                    "percentage": 27.6
                },
                {
                    "category": "Tools & Hardware",
                    "production_value": 75000,
                    "quantity_produced": 300,
                    "percentage": 10.3
                }
            ]
        },
        "period": "today",
        "period_info": {
            "start": "2025-09-18T00:00:00.000000Z",
            "end": "2025-09-18T23:59:59.000000Z"
        }
    }
}
```

---

### 59. Get Today's Manufacturing Analytics
**GET** `/core/manufacturing/today`

Get manufacturing analytics for today with comparison to yesterday.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "period_start": "2025-09-18T00:00:00.000000Z",
        "period_end": "2025-09-18T23:59:59.000000Z",
        "gross_production_revenue": 725000,
        "avg_stock_value": 120000,
        "stock_conversion_rate": 40,
        "total_suppliers": 15,
        "total_materials_produced": 2500,
        "total_quantity_produced": 1800,
        "material_breakdown": [
            {
                "category": "Construction Materials",
                "production_value": 450000,
                "quantity_produced": 1500,
                "percentage": 62.1
            }
        ],
        "monthly_production_trend": {},
        "gross_production_revenue_change": 20,
        "avg_stock_value_change": 44,
        "stock_conversion_rate_change": 12,
        "supplier_count_change": 2
    },
    "period": "today"
}
```

---

### 60. Get Week Manufacturing Analytics
**GET** `/core/manufacturing/week`

Get manufacturing analytics for a specific week.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `start_date` (optional): Week start date (default: current week start)

**Response (200):**
```json
{
    "success": true,
    "data": {
        "period_start": "2025-09-16T00:00:00.000000Z",
        "period_end": "2025-09-22T23:59:59.000000Z",
        "gross_production_revenue": 4500000,
        "avg_stock_value": 180000,
        "stock_conversion_rate": 35,
        "total_suppliers": 18,
        "total_materials_produced": 15000,
        "total_quantity_produced": 12000,
        "material_breakdown": [
            {
                "category": "Construction Materials",
                "production_value": 2800000,
                "quantity_produced": 9000,
                "percentage": 62.2
            },
            {
                "category": "Electrical Components",
                "production_value": 1200000,
                "quantity_produced": 2400,
                "percentage": 26.7
            },
            {
                "category": "Tools & Hardware",
                "production_value": 500000,
                "quantity_produced": 600,
                "percentage": 11.1
            }
        ],
        "monthly_production_trend": {
            "9": 4500000
        }
    },
    "period": "week"
}
```

---

### 61. Get Month Manufacturing Analytics
**GET** `/core/manufacturing/month`

Get manufacturing analytics for a specific month.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `year` (optional): Year (default: current year)
- `month` (optional): Month 1-12 (default: current month)

**Response (200):**
```json
{
    "success": true,
    "data": {
        "period_start": "2025-09-01T00:00:00.000000Z",
        "period_end": "2025-09-30T23:59:59.000000Z",
        "gross_production_revenue": 18500000,
        "avg_stock_value": 250000,
        "stock_conversion_rate": 42,
        "total_suppliers": 25,
        "total_materials_produced": 65000,
        "total_quantity_produced": 55000,
        "material_breakdown": [
            {
                "category": "Construction Materials",
                "production_value": 11500000,
                "quantity_produced": 38000,
                "percentage": 62.2
            },
            {
                "category": "Electrical Components",
                "production_value": 4900000,
                "quantity_produced": 12000,
                "percentage": 26.5
            },
            {
                "category": "Tools & Hardware",
                "production_value": 2100000,
                "quantity_produced": 5000,
                "percentage": 11.3
            }
        ],
        "monthly_production_trend": {
            "9": 18500000
        }
    },
    "period": "month"
}
```

---

### 62. Get Year Manufacturing Analytics
**GET** `/core/manufacturing/year`

Get manufacturing analytics for a specific year.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `year` (optional): Year (default: current year)

**Response (200):**
```json
{
    "success": true,
    "data": {
        "period_start": "2025-01-01T00:00:00.000000Z",
        "period_end": "2025-12-31T23:59:59.000000Z",
        "gross_production_revenue": 225000000,
        "avg_stock_value": 350000,
        "stock_conversion_rate": 38,
        "total_suppliers": 45,
        "total_materials_produced": 750000,
        "total_quantity_produced": 650000,
        "material_breakdown": [
            {
                "category": "Construction Materials",
                "production_value": 140000000,
                "quantity_produced": 450000,
                "percentage": 62.2
            },
            {
                "category": "Electrical Components",
                "production_value": 59500000,
                "quantity_produced": 150000,
                "percentage": 26.4
            },
            {
                "category": "Tools & Hardware",
                "production_value": 25500000,
                "quantity_produced": 50000,
                "percentage": 11.4
            }
        ],
        "monthly_production_trend": {
            "1": 18000000,
            "2": 19500000,
            "3": 21000000,
            "4": 22500000,
            "5": 24000000,
            "6": 25500000,
            "7": 27000000,
            "8": 28500000,
            "9": 30000000
        }
    },
    "period": "year"
}
```

---

### 63. Get Business Season Manufacturing Analytics
**GET** `/core/manufacturing/business-season`

Get manufacturing analytics for a custom business season (date range).

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD, must be after start_date)

**Response (200):**
```json
{
    "success": true,
    "data": {
        "period_start": "2025-06-01T00:00:00.000000Z",
        "period_end": "2025-08-31T23:59:59.000000Z",
        "gross_production_revenue": 75000000,
        "avg_stock_value": 300000,
        "stock_conversion_rate": 45,
        "total_suppliers": 35,
        "total_materials_produced": 250000,
        "total_quantity_produced": 200000,
        "material_breakdown": [
            {
                "category": "Construction Materials",
                "production_value": 46500000,
                "quantity_produced": 155000,
                "percentage": 62.0
            },
            {
                "category": "Electrical Components",
                "production_value": 19800000,
                "quantity_produced": 33000,
                "percentage": 26.4
            },
            {
                "category": "Tools & Hardware",
                "production_value": 8700000,
                "quantity_produced": 12000,
                "percentage": 11.6
            }
        ],
        "monthly_production_trend": {
            "6": 25000000,
            "7": 25000000,
            "8": 25000000
        }
    },
    "period": "business_season"
}
```

**Validation Errors (422):**
```json
{
    "success": false,
    "message": "The end date must be a date after start date."
}
```

---

### 64. Get Production Trend
**GET** `/core/manufacturing/production-trend`

Get production trend data for charts based on the specified period.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `period` (optional): `today`, `week`, `month`, `year`, `business_season` (default: `today`)
- `start_date` (optional): Start date for week/business_season periods
- `end_date` (optional): End date for business_season periods

**Response (200):**
```json
{
    "success": true,
    "data": {
        "0": 5000,
        "1": 7500,
        "2": 10000,
        "3": 12500,
        "4": 15000,
        "5": 17500,
        "6": 20000,
        "7": 22000,
        "8": 25000,
        "9": 28000,
        "10": 30000,
        "11": 32000,
        "12": 35000,
        "13": 38000,
        "14": 40000,
        "15": 42000,
        "16": 45000,
        "17": 48000,
        "18": 50000,
        "19": 52000,
        "20": 55000,
        "21": 58000,
        "22": 60000,
        "23": 62000
    },
    "period": "today"
}
```

**Note:** For `today` period, returns hourly data (0-23). For other periods, returns daily/monthly/quarterly data.

---

## Manufacturing Analytics Data Models

### ManufacturingAnalytics Model
```json
{
    "id": "integer",
    "period_type": "enum (today|week|month|year|business_season)",
    "period_start": "timestamp",
    "period_end": "timestamp",
    "gross_production_revenue": "decimal(15,2)",
    "avg_stock_value": "decimal(15,2)",
    "stock_conversion_rate": "decimal(5,2)",
    "total_suppliers": "integer",
    "total_materials_produced": "decimal(15,2)",
    "total_quantity_produced": "decimal(15,2)",
    "material_breakdown": "json",
    "monthly_production_trend": "json",
    "created_at": "timestamp",
    "updated_at": "timestamp"
}
```

### Material Breakdown Structure
```json
{
    "category": "string (category name)",
    "production_value": "decimal (total production value for this category)",
    "quantity_produced": "decimal (total quantity produced for this category)",
    "percentage": "decimal (percentage of total production value)"
}
```

---

## Manufacturing Analytics Usage Examples

### Frontend Integration Example (JavaScript)

```javascript
// Get manufacturing dashboard data
const getManufacturingDashboard = async (period = 'today', params = {}) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams({ period, ...params });
    
    const response = await fetch(`/api/core/manufacturing/dashboard?${queryParams}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response.json();
};

// Get specific period manufacturing analytics
const getManufacturingAnalytics = async (period, params = {}) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(params);
    
    const response = await fetch(`/api/core/manufacturing/${period}?${queryParams}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response.json();
};

// Get production trend data
const getProductionTrend = async (period = 'today', params = {}) => {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams({ period, ...params });
    
    const response = await fetch(`/api/core/manufacturing/production-trend?${queryParams}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response.json();
};

// Usage examples
const todayManufacturing = await getManufacturingDashboard('today');
const weekManufacturing = await getManufacturingAnalytics('week', { start_date: '2025-09-16' });
const monthManufacturing = await getManufacturingAnalytics('month', { year: 2025, month: 9 });
const seasonManufacturing = await getManufacturingAnalytics('business-season', { 
    start_date: '2025-06-01', 
    end_date: '2025-08-31' 
});

const todayTrend = await getProductionTrend('today');
const weekTrend = await getProductionTrend('week', { start_date: '2025-09-16' });
```

### cURL Examples

```bash
# Get manufacturing dashboard for today
curl -X GET "http://localhost:8000/api/core/manufacturing/dashboard?period=today" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get manufacturing analytics for a specific week
curl -X GET "http://localhost:8000/api/core/manufacturing/week?start_date=2025-09-16" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get manufacturing analytics for a specific month
curl -X GET "http://localhost:8000/api/core/manufacturing/month?year=2025&month=9" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get manufacturing analytics for a business season
curl -X GET "http://localhost:8000/api/core/manufacturing/business-season?start_date=2025-06-01&end_date=2025-08-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get production trend for today
curl -X GET "http://localhost:8000/api/core/manufacturing/production-trend?period=today" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get production trend for a specific week
curl -X GET "http://localhost:8000/api/core/manufacturing/production-trend?period=week&start_date=2025-09-16" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Missing Endpoints

The following endpoints are not yet implemented but would be useful:
- Update/Delete operations for Units and Categories
- Bulk operations for stock management
- Search and filtering capabilities
- Pagination for large datasets
- Manufacturing Analytics caching and export functionality
- Supplier performance ratings and reviews
