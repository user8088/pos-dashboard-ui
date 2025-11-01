# Product Category API

Base path: `/api/product-categories`

Auth: Bearer token required in `Authorization` header.

---

## List Categories
GET `/api/product-categories`
- Query:
  - `q` (optional): search in `name`, `description`
  - `page` (optional): pagination (default 1)

Response 200
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      { "id": 1, "name": "Beverages", "description": "Drinks" }
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
{ "name": "Snacks", "description": "Packaged snacks" }
```

Validation
- name: required, string, max 255, unique
- description: optional, string, max 1000

Responses
- 201
```json
{ "success": true, "message": "Product category created successfully", "data": { "id": 2, "name": "Snacks", "description": "Packaged snacks" } }
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
{ "success": true, "data": { "id": 2, "name": "Snacks", "description": "Packaged snacks" } }
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
{ "name": "Savory Snacks", "description": "Updated description" }
```

Validation
- name: sometimes required, string, max 255, unique (ignores current record)
- description: optional, string, max 1000

200
```json
{ "success": true, "message": "Product category updated successfully", "data": { "id": 2, "name": "Savory Snacks", "description": "Updated description" } }
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

## Notes
- Pagination uses Laravel paginator under `data`.
- Use `q` for search-as-you-type in list views.
- Show server 422 validation errors inline in forms.
- All endpoints are behind Sanctum auth.
