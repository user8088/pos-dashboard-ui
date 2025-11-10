# Product Category API

Base path: `/api/product-categories`

Auth: Bearer token required in `Authorization` header.

---

## List Categories
GET `/api/product-categories`
- Query:
  - `q` (optional): search in `name`, `description`, `serial_alias`
  - `page` (optional): pagination (default 1)

Response 200
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      { 
        "id": 1, 
        "name": "Beverages", 
        "description": "Drinks",
        "serial_alias": "BEV"
      }
    ],
    "per_page": 20,
    "total": 1
  }
}
```

---

## Create Category
POST `/api/product-categories`

Body
```json
{ 
  "name": "Snacks", 
  "description": "Packaged snacks",
  "serial_alias": "SNK"
}
```

Validation
- name: required, string, max 255, unique
- description: optional, string, max 1000
- serial_alias: optional, string, max 50

**Note:** `serial_alias` is used to auto-generate serial IDs for stock items in this category. When creating a stock item without a `serial_id`, if the category has a `serial_alias`, the system will automatically generate a serial ID in the format `{serial_alias}-{number}` (e.g., `SNK-001`, `SNK-002`).

Responses
- 201
```json
{ 
  "success": true, 
  "message": "Product category created successfully", 
  "data": { 
    "id": 2, 
    "name": "Snacks", 
    "description": "Packaged snacks",
    "serial_alias": "SNK"
  } 
}
```
- 422
```json
{ "success": false, "message": "Validation errors", "errors": { "name": ["The name has already been taken."] } }
```

---

## Get Category
GET `/api/product-categories/{id}`

200
```json
{ 
  "success": true, 
  "data": { 
    "id": 2, 
    "name": "Snacks", 
    "description": "Packaged snacks",
    "serial_alias": "SNK"
  } 
}
```

404
```json
{ "success": false, "message": "Product category not found" }
```

---

## Update Category
PUT or PATCH `/api/product-categories/{id}`

Body (partial allowed)
```json
{ 
  "name": "Savory Snacks", 
  "description": "Updated description",
  "serial_alias": "SSNK"
}
```

Validation
- name: sometimes required, string, max 255, unique (ignores current record)
- description: optional, string, max 1000
- serial_alias: optional, string, max 50

**Note:** Updating `serial_alias` does NOT affect existing stock items' `serial_id` values. Only new items created after the update will use the new alias for auto-generation.

200
```json
{ 
  "success": true, 
  "message": "Product category updated successfully", 
  "data": { 
    "id": 2, 
    "name": "Savory Snacks", 
    "description": "Updated description",
    "serial_alias": "SSNK"
  } 
}
```

404/422 as above.

---

## Delete Category
DELETE `/api/product-categories/{id}`

200
```json
{ "success": true, "message": "Product category deleted successfully" }
```

404
```json
{ "success": false, "message": "Product category not found" }
```

---

## Serial Alias Feature

### Overview
The `serial_alias` field allows you to configure automatic serial ID generation for stock items in a category. When a stock item is created without a `serial_id` and the category has a `serial_alias`, the system automatically generates a serial ID.

### Serial ID Format
- Format: `{serial_alias}-{number}`
- Example: If `serial_alias` is `PROD`, serials will be `PROD-001`, `PROD-002`, `PROD-003`, etc.
- Number padding: Minimum 3 digits (001, 002, ..., 100, 101, etc.)
- Padding is preserved: If existing serials use 4+ digits, new serials maintain that padding

### Auto-Generation Rules
1. **Manual Override**: If `serial_id` is provided when creating a stock item, it is used (after uniqueness validation)
2. **Auto-Generation**: If `serial_id` is NOT provided and category has `serial_alias`, serial is auto-generated
3. **No Alias**: If category has no `serial_alias`, `serial_id` remains NULL
4. **Uniqueness**: All `serial_id` values must be unique across all stock items
5. **Category Change**: If an item's category is changed, the `serial_id` is NOT regenerated (preserves original)

### Examples

**Create category with alias:**
```json
POST /api/product-categories
{
  "name": "Electronics",
  "serial_alias": "ELEC"
}
```

**Create item without serial_id (auto-generated):**
```json
POST /api/items
{
  "name": "Laptop",
  "product_category_id": 1,  // Category with serial_alias: "ELEC"
  // serial_id not provided → will be auto-generated as "ELEC-001"
}
```

**Create item with manual serial_id:**
```json
POST /api/items
{
  "name": "Desktop",
  "product_category_id": 1,
  "serial_id": "CUSTOM-123"  // Manual serial_id used instead of auto-generation
}
```

## Notes
- Pagination uses Laravel paginator under `data`.
- Use `q` for search-as-you-type in list views (searches name, description, and serial_alias).
- Show server 422 validation errors inline in forms.
- All endpoints are behind Sanctum auth.
- `serial_alias` is optional and can be set to `null` to disable auto-generation for a category.
