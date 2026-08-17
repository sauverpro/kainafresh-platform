# KainaFresh — API Contract

> **For the Backend Team.** This document lists every API endpoint the frontend will call, the exact JSON shape it expects, and any auth requirements. Implement these endpoints so the frontend works correctly. Do not change the JSON field names without coordinating with the frontend team.

All responses must include `Content-Type: application/json` and use standard HTTP status codes.

Base URL (local dev): `http://localhost/kainafresh/public`

---

## Authentication Endpoints

> These are already implemented per `backend/README.md`. Listed here for frontend reference.

### POST `/api/register`

**Request:**
```json
{ "email": "user@example.com", "password": "password123" }
```

**Success (201):**
```json
{ "success": true, "message": "User registered successfully" }
```

**Error (409 — email taken):**
```json
{ "success": false, "message": "Email already registered" }
```

**Error (422 — validation):**
```json
{ "success": false, "message": "Invalid email address" }
```

---

### POST `/api/login`

**Request:**
```json
{ "email": "user@example.com", "password": "password123" }
```

**Success (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "AUTHENTICATION_TOKEN",
  "user": { "id": 1, "email": "user@example.com", "role": "admin" }
}
```

> ⚠️ The `role` field is needed by the frontend to decide whether to show the Admin Panel link. Please include it.

**Error (401):**
```json
{ "success": false, "message": "Invalid email or password" }
```

---

### POST `/api/logout`

**Header:** `Authorization: Bearer TOKEN`

**Success (200):**
```json
{ "success": true, "message": "Logged out successfully" }
```

---

### GET `/api/me`

**Header:** `Authorization: Bearer TOKEN`

**Success (200):**
```json
{
  "success": true,
  "user": { "id": 1, "email": "user@example.com", "role": "admin" }
}
```

---

## CMS Endpoints (To Be Implemented)

> These endpoints power the dynamic content on the public-facing site. Everything is editable via the Admin Panel and served here.

### GET `/api/content/home`

Returns all content for the Home page. The Admin Panel populates this.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "hero": {
      "heading": "Farm Fresh Produce, Delivered Direct to You.",
      "subheading": "We turn local agricultural harvest into high-quality products...",
      "primaryButtonText": "Explore Products",
      "secondaryButtonText": "Learn Our Story",
      "backgroundImageUrl": "https://..."
    },
    "valuePropositions": [
      { "id": 1, "icon": "leaf", "title": "100% Organic", "description": "Grown without synthetic chemicals." },
      { "id": 2, "icon": "truck", "title": "Farm to Door", "description": "Direct delivery from our farm." }
    ],
    "faqs": [
      { "id": 1, "question": "How do I place an order?", "answer": "Browse our products and add to cart..." },
      { "id": 2, "question": "Do you deliver nationwide?", "answer": "Currently we deliver within..." }
    ],
    "stats": [
      { "id": 1, "value": "350+", "label": "Happy Customers" },
      { "id": 2, "value": "100%", "label": "Organic & Local" }
    ]
  }
}
```

---

### GET `/api/products/featured`

Returns a curated list of featured products for the Home page products row.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Fresh Tomatoes",
      "category": "Vegetables",
      "price": 2500,
      "unit": "kg",
      "currency": "RWF",
      "imageUrl": "https://...",
      "inStock": true,
      "stockQuantity": 50,
      "badge": "Best Seller"
    },
    {
      "id": 2,
      "name": "Organic Avocados",
      "category": "Fruits",
      "price": 1500,
      "unit": "piece",
      "currency": "RWF",
      "imageUrl": "https://...",
      "inStock": true,
      "stockQuantity": 30,
      "badge": "New"
    }
  ]
}
```

---

### GET `/api/products`

Returns the full product catalogue (for the Products page).

**Query params:** `?category=Vegetables&page=1&limit=12`

**Response (200):**
```json
{
  "success": true,
  "data": [ /* same shape as featured products */ ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 58
  }
}
```

---

### GET `/api/content/about`

Returns content for the About Us page.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "heading": "About KainaFresh",
    "story": "We started in 2020...",
    "missionStatement": "Fresh produce for every family.",
    "farmImageUrl": "https://...",
    "teamMembers": [
      { "id": 1, "name": "John Doe", "role": "Founder", "photoUrl": "https://..." }
    ]
  }
}
```

---

### GET `/api/content/contact`

Returns contact information for the Contact page.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "phone": "+250 700 000 000",
    "email": "hello@kainafresh.rw",
    "address": "KG 123 St, Kigali, Rwanda",
    "mapEmbedUrl": "https://maps.google.com/...",
    "workingHours": "Mon–Sat: 8am – 6pm"
  }
}
```

---

### POST `/api/contact`

Submits a contact form message.

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "I'd like to place a bulk order..."
}
```

**Success (200):**
```json
{ "success": true, "message": "Message sent successfully" }
```

---

## IMS Endpoints (To Be Implemented)

### POST `/api/orders`

Places an order from the public site.

**Header:** Optional — `Authorization: Bearer TOKEN` (for logged-in users)

**Request:**
```json
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 4, "quantity": 1 }
  ],
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "customerPhone": "+250 700 000 000",
  "deliveryAddress": "KG 123 St, Kigali"
}
```

**Success (201):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "orderId": "KF-2026-0001"
}
```

**Error (422 — out of stock):**
```json
{
  "success": false,
  "message": "Fresh Tomatoes is out of stock",
  "outOfStockItems": [1]
}
```

---

## CORS

> ⚠️ The backend must allow cross-origin requests from the frontend dev server.

Add these headers to every API response:

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

For production, replace `http://localhost:5173` with the live frontend domain.

---

## Error Handling Convention

All errors follow this shape:

```json
{ "success": false, "message": "Human readable error message" }
```

The frontend reads `success` (boolean) and `message` (string) on every response. Use appropriate HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Server Error |


now I only  want to push the login module on a new branch that we may create and name it login and signup or sth else  