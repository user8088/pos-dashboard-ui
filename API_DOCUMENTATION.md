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

**Request Body:**
```json
{
    "item_name": "Rice",
    "unit_id": 1,
    "category_id": 1,
    "quantity_per_unit": 50.00,
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

**Request Body:**
```json
{
  "material_name": "Sugar",
  "amount_per_unit": 5.00,
  "purchase_cost": 12.50,
  "status": "pending",
  "amount_pending": 2.50
}
```

**Response (200):** Raw material JSON.

#### 11.2 Get Raw Materials
**GET** `/core/raw-material`

Retrieve all raw materials.

**Headers:**
```
Authorization: Bearer {token}
```

#### 11.3 Update Raw Material
**PUT** `/core/raw-material/{id}`

Update an existing raw material (fields optional).

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

#### 11.4 Delete Raw Material
**DELETE** `/core/raw-material/{id}`

Delete a raw material.

**Headers:**
```
Authorization: Bearer {token}
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

Update an existing stock item.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "item_name": "Rice (Updated)",
    "unit_id": 1,
    "category_id": 1,
    "quantity_per_unit": 75.00,
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
