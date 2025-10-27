# Backend Unit Conversion Implementation Checklist

## Issue: Frontend shows "50 Kg" instead of "100 Grams" (secondary unit)

### Root Cause
The backend's `/core/customer/{id}/purchases` endpoint is NOT returning:
- `use_secondary_unit` flag
- `unit_name` 
- `secondaryUnit` relationship

## What Backend Needs to Do

### 1. **GET /core/customer/{id}/purchases** - MUST return:
```json
{
  "items": [
    {
      "stock_id": 1,
      "item_name": "Sulphur Powder",
      "quantity": 100,
      "unit_price": 0.20,
      "line_total": 20,
      
      // ✅ These fields are MISSING:
      "use_secondary_unit": true,           // Flag indicating secondary unit was used
      "unit_name": "Gram",                  // The actual unit name used in sale
      "unit": {                             // Primary unit details
        "unit_id": 1,
        "unit_name": "Kilogram"
      },
      "secondaryUnit": {                    // Secondary unit details
        "unit_id": 2,
        "unit_name": "Gram"
      }
    }
  ]
}
```

### 2. **GET /core/customer** (list all customers) - MUST also include unit info:
According to API docs (line 3157-3190), the `purchased_items` array should include:
```json
{
  "purchased_items": [
    {
      "use_secondary_unit": true,
      "unit_name": "Gram",
      "unit": { ... },
      "secondaryUnit": { ... }
    }
  ]
}
```

### 3. **Database Requirements**
The `purchase_items` table (or pivot) needs to store:
- `use_secondary_unit` (boolean) - tracks if item was sold in secondary unit
- Relationship to load both `unit` and `secondaryUnit`

### 4. **Customer Endpoint Requirements**
When fetching customer purchases, the API MUST:
1. Load the stock item's unit relationship
2. Load the stock item's secondary unit relationship (if exists)
3. Include `use_secondary_unit` flag from the purchase_item
4. Return `unit_name` (either from item or stock unit name)

## Current Frontend Status
✅ Frontend code is ready and correct
✅ It checks for `use_secondary_unit` flag
✅ It displays `unit.unit_name` or `secondaryUnit.unit_name` accordingly
✅ Console logs added for debugging

## Next Steps
1. Backend needs to update `/core/customer/{id}/purchases` response to include missing fields
2. Backend needs to update `/core/customer` response to include unit info in `purchased_items`
3. Test with API to verify correct unit names are returned
