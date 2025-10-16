# Customer Rating System Guide

## Overview

The customer rating system allows you to assign **star ratings (0-5)** to customers along with optional notes. This helps you:

- Track customer reliability and payment behavior
- Identify your best and worst customers
- Make data-driven decisions on credit terms
- Monitor customer satisfaction trends
- Generate rating statistics and reports

## Key Features

✨ **Star Rating System**: Rate customers from 0-5 stars
📝 **Rating Notes**: Add detailed notes explaining the rating
📊 **Rating Analytics**: View comprehensive statistics and trends
🔍 **Filter & Sort**: Find customers by rating range
📈 **Distribution Reports**: See rating breakdown across all customers
🏆 **Top/Bottom Lists**: Identify best and worst performing customers

## Database Schema

The customer rating feature adds two new columns to the `customers` table:

```
- rating (unsignedTinyInteger, 0-5, default: 0, nullable)
- rating_notes (text, nullable)
```

## Star Rating Scale

| Rating | Meaning | Example Use Case |
|--------|---------|------------------|
| 5 ⭐ | Excellent | Perfect customer, always pays on time, high volume orders |
| 4 ⭐ | Good | Reliable customer, minor issues occasionally |
| 3 ⭐ | Average | Neutral customer, standard behavior |
| 2 ⭐ | Poor | Often late payments, unreliable |
| 1 ⭐ | Very Poor | Frequent defaults, problematic customer |
| 0 | Unrated | No rating assigned yet |

## API Endpoints

### 1. Rate a Customer
**PUT** `/api/core/customer/{id}/rating`

Assign or update a star rating for a customer.

```bash
curl -X PUT "http://localhost:8000/api/core/customer/5/rating" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "rating_notes": "Excellent customer, always pays on time"
  }'
```

**Request Body:**
```json
{
  "rating": 5,
  "rating_notes": "Excellent customer, always pays on time"
}
```

**Response (200):**
```json
{
  "message": "Customer rating updated successfully",
  "data": {
    "id": 5,
    "customer_name": "ABC Trading",
    "rating": 5,
    "rating_notes": "Excellent customer, always pays on time"
  }
}
```

---

### 2. Get Customer Rating
**GET** `/api/core/customer/{id}/rating`

Retrieve the current rating and notes for a specific customer.

```bash
curl -X GET "http://localhost:8000/api/core/customer/5/rating" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200):**
```json
{
  "data": {
    "id": 5,
    "customer_name": "ABC Trading",
    "customer_phone_no": "03001234567",
    "customer_code": "CUST-0001",
    "rating": 5,
    "rating_notes": "Excellent customer, always pays on time"
  }
}
```

---

### 3. Filter Customers by Rating
**GET** `/api/core/customers/by-rating`

Find customers within a specific rating range and sort by rating.

```bash
# Get all 5-star customers (best customers)
curl -X GET "http://localhost:8000/api/core/customers/by-rating?min_rating=5&max_rating=5" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get low-rated customers (risky customers)
curl -X GET "http://localhost:8000/api/core/customers/by-rating?min_rating=0&max_rating=2" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all rated customers, sorted by rating (descending)
curl -X GET "http://localhost:8000/api/core/customers/by-rating?min_rating=1&sort_by=rating_desc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters:**
- `min_rating` (optional): Minimum rating to filter (0-5)
- `max_rating` (optional): Maximum rating to filter (0-5)
- `sort_by` (optional): `rating_asc` or `rating_desc` (default: `rating_desc`)

**Response (200):**
```json
{
  "data": [
    {
      "id": 5,
      "customer_name": "ABC Trading",
      "rating": 5,
      "rating_notes": "Excellent customer"
    },
    {
      "id": 8,
      "customer_name": "XYZ Corp",
      "rating": 5,
      "rating_notes": "Good payer"
    }
  ],
  "summary": {
    "total_customers": 2,
    "average_rating": 5,
    "highest_rated": 5,
    "lowest_rated": 5
  }
}
```

---

### 4. Get Rating Summary Dashboard
**GET** `/api/core/customers/rating-summary`

Get comprehensive analytics and statistics for all customer ratings.

```bash
curl -X GET "http://localhost:8000/api/core/customers/rating-summary" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200):**
```json
{
  "data": {
    "total_customers": 25,
    "rated_customers": 22,
    "unrated_customers": 3,
    "average_rating": 3.86,
    "rating_distribution": [
      {
        "stars": 5,
        "count": 8,
        "percentage": 32
      },
      {
        "stars": 4,
        "count": 6,
        "percentage": 24
      },
      {
        "stars": 3,
        "count": 5,
        "percentage": 20
      },
      {
        "stars": 2,
        "count": 2,
        "percentage": 8
      },
      {
        "stars": 1,
        "count": 1,
        "percentage": 4
      }
    ],
    "top_rated": [
      {
        "id": 5,
        "customer_name": "ABC Trading",
        "rating": 5,
        "customer_code": "CUST-0001"
      },
      {
        "id": 8,
        "customer_name": "XYZ Corp",
        "rating": 5,
        "customer_code": "CUST-0002"
      }
    ],
    "lowest_rated": [
      {
        "id": 15,
        "customer_name": "Poor Payer Ltd",
        "rating": 1,
        "customer_code": "CUST-0010"
      }
    ]
  }
}
```

**Analytics Provided:**
- `total_customers`: Total number of customers
- `rated_customers`: How many have been rated
- `unrated_customers`: How many still need ratings
- `average_rating`: Overall average rating (0.00-5.00)
- `rating_distribution`: Visual breakdown of all ratings
- `top_rated`: Your best customers (up to 5)
- `lowest_rated`: Customers needing attention (up to 5)

---

## Use Cases

### Use Case 1: Identify VIP Customers
Find all your 5-star customers to:
- Offer exclusive discounts
- Increase credit limits
- Prioritize their orders
- Request referrals

```bash
curl -X GET "http://localhost:8000/api/core/customers/by-rating?min_rating=5&max_rating=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Use Case 2: Monitor Problem Customers
Find all customers rated 2-stars or below to:
- Review their credit status
- Consider stricter payment terms
- Follow up on overdue payments
- Assess risk

```bash
curl -X GET "http://localhost:8000/api/core/customers/by-rating?min_rating=0&max_rating=2" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Use Case 3: Generate Monthly Report
Get a complete rating overview for:
- Management reporting
- Business analysis
- Credit policy decisions
- Risk assessment

```bash
curl -X GET "http://localhost:8000/api/core/customers/rating-summary" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Use Case 4: Track Rating Trends
Periodically call the summary endpoint to:
- Monitor average rating changes
- See if more customers are becoming problematic
- Identify if actions are improving customer quality
- Make data-driven improvements

---

## Frontend Integration Examples

### Vue.js / React Example

```javascript
// Rate a customer
async function rateCustomer(customerId, rating, notes) {
  const response = await fetch(`/api/core/customer/${customerId}/rating`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      rating: rating,
      rating_notes: notes
    })
  });
  return response.json();
}

// Get rating summary for dashboard
async function getRatingSummary() {
  const response = await fetch('/api/core/customers/rating-summary', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
}

// Find top customers
async function getTopCustomers() {
  const response = await fetch('/api/core/customers/by-rating?min_rating=5&max_rating=5', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
}

// Star rating display component example
function StarRating({ rating, onRate }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => onRate(star)}
          className={star <= rating ? 'star filled' : 'star empty'}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}
```

---

## Best Practices

### 📋 Rating Guidelines

1. **Be Consistent**: Use the same criteria for all customers
2. **Update Regularly**: Refresh ratings quarterly or when circumstances change
3. **Document Reasons**: Always add notes explaining your rating
4. **Consider Multiple Factors**:
   - Payment timeliness
   - Order frequency/volume
   - Communication quality
   - Business reliability
   - Growth potential

### 💡 Recommended Rating Criteria

**5 Stars:**
- Always pays on time
- High transaction volume
- Good communication
- Repeat customer
- Referral source

**4 Stars:**
- Pays on time usually
- Good transaction history
- Occasional delays

**3 Stars:**
- Mixed payment history
- Average behavior
- Neutral assessment

**2 Stars:**
- Frequent late payments
- Lower transaction volume
- Requires monitoring

**1 Star:**
- Chronic payment issues
- Unreliable
- High risk

**0 (Unrated):**
- New customers
- Not yet assessed

### 🔄 Workflow Example

```
1. New Customer Created
   ↓
2. Monitor for 1-2 cycles
   ↓
3. Assign Initial Rating based on behavior
   ↓
4. Review Quarterly
   ↓
5. Update Rating if circumstances change
   ↓
6. Repeat annually
```

---

## Validation Rules

- Rating must be an integer between **0-5**
- Rating notes cannot exceed **1000 characters**
- A rating of **0** means "unrated" (optional)
- All ratings are optional initially

---

## Error Handling

### Invalid Rating Value

**Request:**
```json
{ "rating": 10 }
```

**Response (422):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "rating": ["The rating must not be greater than 5."]
  }
}
```

### Customer Not Found

**Response (404):**
```json
{
  "message": "Customer not found"
}
```

---

## Tips for Effective Use

✅ **Do:**
- Rate customers regularly
- Add meaningful notes with each rating
- Review ratings when payment status changes
- Use summaries for business decisions
- Filter by rating for targeted actions

❌ **Don't:**
- Rate based on single transactions
- Use arbitrary or inconsistent criteria
- Rate only new customers
- Ignore rating alerts
- Leave notes blank

---

## Analytics You Can Track

With the rating system, you can monitor:

📊 **Customer Health Metrics:**
- Percentage of 5-star customers (quality)
- Percentage of problematic customers (risk)
- Average rating trend over time
- Distribution of ratings

💰 **Business Insights:**
- Correlation between rating and payment frequency
- Average purchase value by rating
- Default risk by rating
- Customer lifetime value by rating

📈 **Performance Indicators:**
- Customer satisfaction trend
- Risk profile of customer base
- Credit policy effectiveness
- Collection success rates

---

## Troubleshooting

### Issue: Rating not updating
- Verify the customer ID is correct
- Check authentication token validity
- Ensure rating is between 0-5

### Issue: Summary shows incorrect average
- The system calculates average of all non-zero ratings
- Unrated (0) customers are excluded from average
- Refresh your browser to see latest data

### Issue: Top/Bottom customers missing
- Only shows up to 5 in each category
- Must have at least 1 rating to appear
- Use `by-rating` endpoint to see all customers in a range

---

## Support

For issues or questions about the customer rating system, please contact your administrator or refer to the full API_DOCUMENTATION.md file for complete endpoint specifications.
