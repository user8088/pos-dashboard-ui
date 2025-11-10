# Backend Implementation: Serial IDs for Stock Products and Category Aliases

## Overview
This document describes the backend changes needed to support:
1. **Serial IDs for Stock Products**: Each product should have a `serial_id` field that can be manually set or auto-generated based on category alias.
2. **Serial Alias for Categories**: Categories should have a `serial_alias` field that is used to auto-generate product serial IDs.

## Database Changes

### 1. Add `serial_alias` to Product Categories Table

**Migration for `product_categories` table:**
```php
Schema::table('product_categories', function (Blueprint $table) {
    $table->string('serial_alias', 50)->nullable()->after('description');
});
```

**Migration for `factory_product_categories` table (if separate):**
```php
Schema::table('factory_product_categories', function (Blueprint $table) {
    $table->string('serial_alias', 50)->nullable()->after('description');
});
```

### 2. Add `serial_id` to Stock Items Tables

**Migration for `items` table (store stock):**
```php
Schema::table('items', function (Blueprint $table) {
    $table->string('serial_id', 100)->nullable()->after('name');
    $table->index('serial_id'); // Add index for faster lookups
});
```

**Migration for `factory_stock_items` table (factory stock):**
```php
Schema::table('factory_stock_items', function (Blueprint $table) {
    $table->string('serial_id', 100)->nullable()->after('name');
    $table->index('serial_id'); // Add index for faster lookups
});
```

## API Changes

### 1. Product Categories API

#### Update Category Model
Add `serial_alias` to fillable array:
```php
protected $fillable = ['name', 'description', 'serial_alias'];
```

#### Update Category Controller
- **GET `/api/product-categories`** and **GET `/api/product-categories/{id}`**: Include `serial_alias` in response
- **POST `/api/product-categories`**: Accept `serial_alias` in request body (optional, string, max 50)
- **PUT/PATCH `/api/product-categories/{id}`**: Accept `serial_alias` in request body (optional, string, max 50)

**Validation Rules:**
```php
'serial_alias' => 'nullable|string|max:50'
```

#### Update Factory Product Categories API (if separate)
Same changes as above for factory product categories.

### 2. Stock Items API

#### Update Item Model
Add `serial_id` to fillable array:
```php
protected $fillable = [..., 'serial_id'];
```

#### Auto-Generation Logic

When creating a new item:
1. If `serial_id` is provided in the request, use it (after checking uniqueness).
2. If `serial_id` is NOT provided:
   - Check if the item's category has a `serial_alias`
   - If category has `serial_alias`:
     - Find the highest existing serial number for items in this category with the same alias
     - Generate next serial: `{serial_alias}-{next_number}` (e.g., `PROD-001`, `PROD-002`)
     - Number should be zero-padded (001, 002, etc.) with at least 3 digits
   - If category has no `serial_alias`, leave `serial_id` as NULL

**Example Auto-Generation Logic:**
```php
// In ItemController@store or ItemService
if (empty($request->serial_id)) {
    $category = ProductCategory::find($request->product_category_id);
    if ($category && $category->serial_alias) {
        // Find highest number for this category
        $pattern = $category->serial_alias . '-%';
        $lastSerial = Item::where('serial_id', 'like', $pattern)
            ->where('product_category_id', $category->id)
            ->orderByRaw('CAST(SUBSTRING_INDEX(serial_id, "-", -1) AS UNSIGNED) DESC')
            ->value('serial_id');
        
        if ($lastSerial) {
            $lastNumber = (int) substr($lastSerial, strrpos($lastSerial, '-') + 1);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }
        
        $request->merge(['serial_id' => $category->serial_alias . '-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT)]);
    }
}
```

**Validation Rules:**
```php
'serial_id' => 'nullable|string|max:100|unique:items,serial_id'
```

**Note:** For updates, use `unique:items,serial_id,{id}` to ignore current record.

#### Update Item Controller
- **GET `/api/items`** and **GET `/api/items/{id}`**: Include `serial_id` in response
- **POST `/api/items`**: 
  - Accept `serial_id` in request body (optional)
  - Auto-generate if not provided and category has alias
- **PUT/PATCH `/api/items/{id}`**: Accept `serial_id` in request body (optional)

#### Update Factory Stock Items API (if separate)
Same changes as above for factory stock items.

## Response Format

### Category Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Electronics",
    "description": "Electronic products",
    "serial_alias": "ELEC",
    "created_at": "2025-01-15T10:30:00.000000Z",
    "updated_at": "2025-01-15T10:30:00.000000Z"
  }
}
```

### Item Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Laptop",
    "serial_id": "ELEC-001",
    "product_category_id": 1,
    "selling_price": 50000,
    ...
  }
}
```

## Edge Cases to Handle

1. **Uniqueness**: Ensure `serial_id` is unique across all items (or per category if preferred)
2. **Manual Override**: If user provides `serial_id`, use it even if category has alias
3. **Category Change**: If item's category is changed, consider whether to regenerate `serial_id` (probably not - keep existing)
4. **Alias Removal**: If category's `serial_alias` is removed, existing items keep their `serial_id`
5. **Number Padding**: Use consistent padding (e.g., 3 digits: 001, 002, ..., 100, 101)

## Testing Checklist

- [ ] Create category with `serial_alias`
- [ ] Create item without `serial_id` in category with alias → should auto-generate
- [ ] Create item with manual `serial_id` → should use provided value
- [ ] Create item in category without alias → `serial_id` should be NULL
- [ ] Update category `serial_alias` → existing items should not change
- [ ] Update item `serial_id` manually → should accept new value
- [ ] Verify uniqueness validation works
- [ ] Test serial number incrementing (001, 002, 003, etc.)
- [ ] Test with factory stock items (if separate system)

## Notes

- The frontend will send `serial_id` as optional field
- If `serial_id` is empty/null and category has `serial_alias`, backend should auto-generate
- Serial format: `{ALIAS}-{NUMBER}` where NUMBER is zero-padded (minimum 3 digits)
- Consider adding a database index on `serial_id` for performance

