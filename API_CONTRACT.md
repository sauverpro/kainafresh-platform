# KainaFresh — API Contract

> **Source of Truth.** This document is derived directly from the backend PHP source code. Every endpoint listed here is implemented and working. Do not rely on any other API contract files — they are deleted.
>
> **Base URL (local dev):** `http://127.0.0.1:8000`  
> **Start backend:** `cd backend && php -S 127.0.0.1:8000 index.php`

All responses use `Content-Type: application/json`. CORS headers are set globally in `backend/index.php`.

---

## Table of Contents
1. [Auth](#1-auth)
2. [CMS — Pages](#2-cms--pages)
3. [CMS — Page Sections](#3-cms--page-sections)
4. [Settings](#4-settings)
5. [Nav Links](#5-nav-links)
6. [Error Handling Convention](#6-error-handling-convention)
7. [Authentication](#7-authentication-bearer-token)
8. [Not Yet Implemented](#8-not-yet-implemented)

---

## 1. Auth

### POST `/api/auth/register`
Creates a new user account.

**Request Body (all fields required):**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secret123",
  "full_name": "John Doe",
  "phone_number": "+250700000000"
}
```

**Success (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "sales_manager",
      "status": "active",
      "phone_number": "+250700000000"
    }
  }
}
```

**Error (422 — missing field):**
```json
{ "success": false, "message": "username is required" }
```

**Error (422 — email taken):**
```json
{ "success": false, "message": "Email already exists" }
```

**Error (422 — username taken):**
```json
{ "success": false, "message": "Username already exists" }
```

---

### POST `/api/auth/login`
Authenticates a user and returns a JWT token.

**Request Body:**
```json
{ "email": "john@example.com", "password": "secret123" }
```

**Success (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "admin",
      "status": "active"
    },
    "token": "eyJ...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

> ⚠️ Token is at `data.data.token`. User role is at `data.data.user.role`. Frontend uses role to redirect: `admin` → `/admin`, others → `/`.

**Error (401 — account not found):**
```json
{ "success": false, "message": "Account not found!" }
```

**Error (401 — wrong password):**
```json
{ "success": false, "message": "Invalid credentials" }
```

**Error (403 — account deactivated):**
```json
{ "success": false, "message": "Account is deactivated" }
```

> ⚠️ **Not Implemented:** `POST /api/auth/logout` and `GET /api/me` do not exist yet.

---

## 2. CMS — Pages

> Pages are the CMS containers. Each page has a `slug` (e.g. `home`, `about`, `contact`, `wholesale`) and contains a list of ordered `sections` with JSON `content` blobs.

### GET `/api/pages`
Returns all pages (no sections included).

**Success (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "title": "Home", "slug": "home", "status": "published", "seo_title": null, "seo_description": null }
  ]
}
```

---

### GET `/api/pages/{id}`
Returns a single page **with** its sections.

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Home",
    "slug": "home",
    "status": "published",
    "seo_title": null,
    "seo_description": null,
    "sections": [ /* see Sections shape below */ ]
  }
}
```

**Error (404):**
```json
{ "success": false, "message": "Page not found" }
```

---

### GET `/api/pages/slug/{slug}` ⭐ Primary Frontend Endpoint
Returns a page by its slug, **with** its sections. This is the main endpoint all public pages use to fetch CMS content.

**Example:** `GET /api/pages/slug/home`

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Home",
    "slug": "home",
    "status": "published",
    "sections": [
      {
        "id": 101,
        "page_id": 1,
        "type": "hero",
        "title": "Home Hero",
        "content": { "badge": "100% Organic", "heading": "..." },
        "settings": null,
        "position": 0,
        "status": "active"
      }
    ]
  }
}
```

**Error (404):**
```json
{ "success": false, "message": "Page not found" }
```

> **Frontend usage:** If this returns 404 (page not yet seeded in DB), fall back gracefully to hardcoded default data.

---

### POST `/api/pages` 🔒 Auth Required (admin)
Creates a new page.

**Request Body:**
```json
{ "title": "Contact", "slug": "contact", "status": "published" }
```

**Success (201):**
```json
{ "success": true, "message": "Page created successfully", "data": { /* page object */ } }
```

---

### PUT `/api/pages/{id}` 🔒 Auth Required (admin)
Updates a page (partial updates supported — only send changed fields).

**Request Body (all optional):**
```json
{ "title": "New Title", "status": "draft", "seo_title": "SEO Title", "seo_description": "..." }
```

**Success (200):**
```json
{ "success": true, "message": "Page updated successfully", "data": { /* updated page */ } }
```

---

### DELETE `/api/pages/{id}` 🔒 Auth Required (admin)
Deletes a page and all its sections (cascade).

**Success (200):**
```json
{ "success": true, "message": "Page deleted successfully" }
```

---

## 3. CMS — Page Sections

> Sections belong to a page and hold the actual editable content in a `content` JSON field.

### Section Object Shape
```json
{
  "id": 101,
  "page_id": 1,
  "type": "hero",
  "title": "Section display name",
  "content": { /* arbitrary JSON — see section types below */ },
  "settings": { /* arbitrary JSON for display options */ },
  "position": 0,
  "status": "active"
}
```

**Section Status values:** `active` | `inactive`  
**Page status values:** `draft` | `published`

---

### Section Type Content Shapes

#### `hero` (Home Page)
```json
{
  "badge": "100% Organic · Farm to Table",
  "heading": "Farm Fresh Produce,",
  "headingAccent": "Delivered Direct to You.",
  "subheading": "We grow it. We pack it...",
  "primaryCta": { "label": "Shop Now", "to": "/products" },
  "secondaryCta": { "label": "Wholesale & Exports", "to": "/wholesale" }
}
```

#### `value_props` (Home Page)
```json
{
  "tag": "Why KainaFresh",
  "heading": "Fresh Food, Done Right",
  "items": [
    { "iconName": "Leaf", "title": "Organically Grown", "description": "..." }
  ]
}
```

#### `faqs` (Home Page)
```json
{
  "tag": "Got Questions?",
  "heading": "Frequently Asked Questions",
  "subheading": "...",
  "items": [
    { "question": "How do I place an order?", "answer": "..." }
  ]
}
```

#### `hero` (About Page)
```json
{
  "location": "Kigali, Rwanda",
  "heading": "Growing Fresh.",
  "headingHighlight": "Building Community.",
  "description": "KainaFresh is a Rwanda-based farm...",
  "cta": { "label": "Get in Touch", "to": "/contact" }
}
```

#### `stats_bar` (About Page)
```json
{
  "items": [
    { "value": "350+", "label": "Happy Customers" },
    { "value": "100%", "label": "Organic Certified" }
  ]
}
```

#### `story` (About Page)
```json
{
  "tag": "Our Story",
  "heading": "From a small plot of land to a thriving farm.",
  "paragraphs": ["KainaFresh started with...", "Today, we manage..."]
}
```

#### `values` (About Page)
```json
{
  "tag": "What We Stand For",
  "heading": "Our Mission & Values",
  "subheading": "...",
  "items": [
    { "iconName": "ShieldCheck", "title": "Quality & Safety", "description": "..." }
  ]
}
```

#### `team` (About Page)
```json
{
  "tag": "The People Behind the Farm",
  "heading": "Meet Our Team",
  "members": [
    { "name": "Jean-Pierre Uwimana", "role": "Founder & Farm Director", "initials": "JU" }
  ]
}
```

#### `cta` (About Page)
```json
{
  "heading": "Ready to taste the difference?",
  "subheading": "Order fresh produce from KainaFresh...",
  "primaryCta": { "label": "Shop Now", "to": "/products" },
  "secondaryCta": { "label": "Contact Us", "to": "/contact" }
}
```

#### `hero` (Contact Page)
```json
{
  "heading": "Get in Touch",
  "subheading": "We'd love to hear from you. Reach out with questions, wholesale inquiries, or feedback.",
  "badge": "Contact KainaFresh"
}
```

#### `hero` (Wholesale Page)
```json
{
  "badge": "B2B & Exports",
  "heading": "Partner with",
  "headingAccent": "KainaFresh",
  "description": "We supply premium, organic produce in bulk...",
  "primaryCta": { "label": "Request a Quote", "to": "#inquiry-form" },
  "secondaryCta": { "label": "How It Works", "to": "#how-it-works" }
}
```

---

### GET `/api/pages/{pageId}/sections`
Returns all sections for a page, ordered by `position` ascending.

**Success (200):**
```json
{ "success": true, "data": [ /* array of section objects */ ] }
```

---

### GET `/api/pages/{pageId}/sections/{sectionId}`
Returns a single section.

---

### POST `/api/pages/{pageId}/sections` 🔒 Auth Required
Creates a new section on a page.

**Request Body:**
```json
{
  "type": "hero",
  "title": "Home Hero Banner",
  "content": { "heading": "...", "badge": "..." },
  "settings": null,
  "position": 0,
  "status": "active"
}
```

**Success (201):**
```json
{ "success": true, "message": "Section created successfully", "data": { /* section */ } }
```

---

### PUT `/api/pages/{pageId}/sections/{sectionId}` 🔒 Auth Required
Updates a section. Partial updates supported.

> ⚠️ `page_id` is ignored in the body — a section cannot be moved to a different page via this endpoint.

**Request Body (any fields, all optional):**
```json
{
  "content": { "heading": "New heading" },
  "status": "inactive"
}
```

**Success (200):**
```json
{ "success": true, "message": "Section updated successfully", "data": { /* updated section */ } }
```

---

### DELETE `/api/pages/{pageId}/sections/{sectionId}` 🔒 Auth Required
Deletes a section.

**Success (200):**
```json
{ "success": true, "message": "Section deleted successfully" }
```

---

### PUT `/api/pages/{pageId}/sections/reorder` 🔒 Auth Required
Reorders all sections on a page in a single transaction.

**Request Body:**
```json
{
  "sections": [
    { "id": 101, "position": 0 },
    { "id": 103, "position": 1 },
    { "id": 102, "position": 2 }
  ]
}
```

**Validation rules:**
- Every `id` must belong to the specified `pageId`.
- No duplicate IDs.
- `position` must be >= 0.

**Success (200):**
```json
{
  "success": true,
  "message": "Sections reordered successfully",
  "data": [ /* full updated sections array */ ]
}
```

---

## 4. Settings

> Only a single settings record exists (the site's global config). `POST /api/settings/create` will update it if one already exists.

### GET `/api/settings`
Returns the global site settings.

> ⚠️ **Known Backend Bug:** Response is `["settings", {...}]` (PHP array) instead of `{"success": true, "settings": {...}}`. Frontend must handle this quirky shape until backend is fixed.

**Actual response:**
```json
["settings", {
  "id": 1,
  "site_title": "KainaFresh",
  "site_logo": "/uploads/logo.png",
  "primary_email": "hello@kainafresh.rw",
  "secondary_email": null,
  "facebook": "https://facebook.com/kainafresh",
  "instagram": null,
  "tiktok": null,
  "linkedin": null,
  "youtube": null,
  "address": "KG 123 St, Kigali, Rwanda",
  "primary_number": "+250700000000",
  "secondary_number": null,
  "other_numbers": null
}]
```

**Frontend parsing:** `const settings = response[1]`

---

### POST `/api/settings/create` 🔒 Auth Required (admin)
Creates or updates the global settings record.

**Required fields:** `site_title`, `primary_email`, `address`, `primary_number`

**Request Body:**
```json
{
  "site_title": "KainaFresh",
  "primary_email": "hello@kainafresh.rw",
  "address": "KG 123 St, Kigali, Rwanda",
  "primary_number": "+250700000000",
  "secondary_email": "orders@kainafresh.rw",
  "facebook": "https://facebook.com/kainafresh"
}
```

---

### POST `/api/settings/uploadlogo` 🔒 Auth Required (admin)
Uploads/replaces the site logo. **Multipart form upload, NOT JSON.**

**Form field:** `site_logo` (file)

**Success (200):**
```json
{ "success": true, "message": "Logo updated!", "data": { /* updated settings */ } }
```

---

## 5. Nav Links

### GET `/api/navlinks`
Returns **all** nav link records (both nav and footer links).

**Actual response shape:**
```json
{ "navlinks": [ /* array of navlink objects */ ] }
```

> ⚠️ No `success` key in this response — just `navlinks`.

---

### GET `/api/navlinks/nav`
Returns only navigation links (where `link_type = 'nav'`).

**Success (201):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "link_name": "Home", "link": "/", "link_type": "nav" }
  ]
}
```

---

### POST `/api/navlinks/create` 🔒 Auth Required (admin)
Creates a new nav link.

**Required fields:** `link`, `link_type`, `link_name`

**`link_type` values:** `nav` | `footer` (or any string — backend doesn't validate this enum)

**Request Body:**
```json
{ "link_name": "Products", "link": "/products", "link_type": "nav" }
```

**Success (200):**
```json
{ "success": true, "navlinks": { /* new navlink object */ } }
```

---

### PUT `/api/navlinks/update/{id}` 🔒 Auth Required (admin)
Updates a nav link.

**Success (201):**
```json
{ "success": true, "data": { /* updated navlink */ } }
```

---

### DELETE `/api/navlinks/delete/{id}` 🔒 Auth Required (admin)
Deletes a nav link.

**Success (200):**
```json
{ "success": true, "message": "Link removed!" }
```

---

## 6. Error Handling Convention

All errors follow this shape:
```json
{ "success": false, "message": "Human readable error message" }
```

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request / Auth required |
| 401 | Invalid credentials / Unauthorized role |
| 403 | Forbidden (account deactivated) |
| 404 | Not Found |
| 409 | Conflict (slug already exists) |
| 422 | Validation Error |
| 500 | Server Error |

---

## 7. Authentication (Bearer Token)

Protected routes require an `Authorization` header:
```
Authorization: Bearer eyJ...
```

The token is obtained from `POST /api/auth/login` (`data.data.token`). Tokens expire in **3600 seconds (1 hour)**.

The frontend `apiGet`, `apiPost`, `apiPut`, `apiDelete` helpers in `frontend/src/api/client.ts` automatically attach the token from localStorage.

**Role-based access:** The backend checks `user.role === 'admin'` for all write operations on Settings and NavLinks. Page/Section write routes currently don't enforce auth middleware (they are not on the protected routes list).

---

## 8. Not Yet Implemented

These features are planned but have no backend endpoint yet. Frontend pages should use mock/static data until implemented.

| Feature | Notes |
|---|---|
| `POST /api/contact` | Contact form submission. Use `console.log` mock. |
| `GET /api/products` | Product catalogue listing |
| `GET /api/products/featured` | Featured products for Home page |
| `POST /api/orders` | Place an order |
| `POST /api/auth/logout` | Invalidate token server-side |
| `GET /api/me` | Get current authenticated user profile |