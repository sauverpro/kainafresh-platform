# Kaina Fresh — Backend API

A minimal, dependency-free PHP API: a small custom router, `mysqli` for the database, a lightweight migration system, and JWT-based auth for protected routes. No framework, no Composer packages.

## Table of Contents

- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Migrations](#migrations)
- [API Reference](#api-reference)
  - [Auth](#auth)
  - [Pages & Page Sections (CMS)](#pages--page-sections-cms)
  - [Settings](#settings)
  - [Navigation Links](#navigation-links)
  - [Team](#team)
  - [Units](#units)
  - [Products](#products)
  - [Stocks](#stocks)
- [Database Import Notes](#database-import-notes)
- [Troubleshooting](#troubleshooting)

## Requirements

- PHP 7.4+ with the `mysqli` extension enabled
- MySQL / MariaDB

## Getting Started

Run PHP's built-in dev server from the `backend/` directory:

```bash
php -S 127.0.0.1:8000
```

The API is now available at `http://127.0.0.1:8000`. Routes are defined in [routes/api.php](routes/api.php); `index.php` is the entrypoint — it autoloads classes, sets CORS headers, and dispatches the router.

> The frontend's `VITE_API_BASE_URL` must point at this address for local development.

## Configuration

### Database

The connection config lives in [config/database.php](config/database.php#L1-L9) and reads from environment variables, falling back to defaults if unset:

| Variable      | Default      |
| ------------- | ------------ |
| `DB_HOST`     | `127.0.0.1`  |
| `DB_PORT`     | `3306`       |
| `DB_NAME`     | `kainafresh` |
| `DB_USER`     | `root`       |
| `DB_PASSWORD` | _(empty)_    |

Create a `.env` file in `backend/` with the variable names above **exactly** — the config only reads `DB_NAME` / `DB_USER`, not `DB_DATABASE` / `DB_USERNAME`, so using those names will silently fall back to the defaults instead of erroring:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=kainafresh
DB_USER=root
DB_PASSWORD=
```

The database itself (not just its tables) is created by running:

```bash
php create_db.php
```

### JWT Secret

[core/JWT.php](core/JWT.php) reads its signing secret from the `JWT_SECRET` environment variable (falls back to a default string if unset — fine for local dev, **not** for production).

Generate a strong secret:

```bash
php -r "echo bin2hex(random_bytes(32));"
# or
openssl rand -hex 32
```

Add it to `.env`:

```env
JWT_SECRET=your_generated_secret_here
```

Restart the dev server after changing `.env`. In production, store the secret in a proper secret manager — never commit it.

## Architecture

```
backend/
├── config/          Database config
├── core/             Router, Request, Database (mysqli wrapper), JWT, UploadHelper
├── middleware/        AuthMiddleware (JWT bearer-token check)
├── controllers/       HTTP request handlers
├── models/            Model.php (base ActiveRecord-style class) + entity models
├── migrations/         Migration system (base class, generator, CLI runner, migration files)
├── routes/api.php     All route definitions
├── uploads/            Uploaded files (logos, product images, ...)
└── index.php           Entrypoint: autoload, CORS, dispatch
```

**Models** extend a base `Model` class that provides `all()`, `find()`, `create()`, `update()`, `delete()`:

```php
class Page extends Model
{
    protected $table = 'pages';
}
```

**Controllers** handle HTTP requests and return JSON. Routes with a 4th `'auth'` argument in `routes/api.php` are protected — they run through `AuthMiddleware` and require a valid `Authorization: Bearer <token>` header.

## Migrations

Migration base classes and the CLI runner live in `migrations/`; individual migration files live in `migrations/migrations/`.

| File                                                                   | Purpose                                                                                                              |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [migrations/Migration.php](migrations/Migration.php)                   | Abstract base class. Implement `up()` / `down()`; use `createTable()`, `dropTable()`, `addColumn()`, `dropColumn()`. |
| [migrations/MigrationGenerator.php](migrations/MigrationGenerator.php) | Scaffolds new migration files.                                                                                       |
| [migrations/MigrationRunner.php](migrations/MigrationRunner.php)       | CLI to create, run, roll back, and inspect migrations.                                                               |

```bash
# Scaffold a new migration
php migrations/MigrationRunner.php make create_users_table
php migrations/MigrationRunner.php make add_phone_to_users_table alter

# Run pending migrations
php migrations/MigrationRunner.php migrate

# Roll back (default: last batch)
php migrations/MigrationRunner.php rollback [steps]

# Check status
php migrations/MigrationRunner.php status
```

The runner tracks executed files/batches in a `migrations` table it creates automatically.

A migration class extends `Migration` and implements `up()`/`down()`:

```php
class CreatePagesTable extends Migration
{
    public function up()
    {
        $this->createTable('pages', [
            ['name' => 'title', 'type' => 'VARCHAR', 'length' => 255],
            // ...
        ]);
    }

    public function down()
    {
        $this->dropTable('pages');
    }
}
```

See `migrations/migrations/` for real examples, including foreign-key constraints added via raw SQL after `createTable()` (e.g. `products.unit_id → units.id`, `stocks.productid → products.id`).

## API Reference

Base URL: `http://127.0.0.1:8000`. All responses are JSON with a `success` boolean. Routes marked **🔒 Auth** require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| GET    | `/api/health`        | Health check          |
| POST   | `/api/auth/register` | Register a user       |
| POST   | `/api/auth/login`    | Log in, returns a JWT |

### Pages & Page Sections (CMS)

The CMS is built on two tables: `pages` and `page_sections`, related one-to-many (`page_sections.page_id → pages.id`, `ON DELETE CASCADE`).

```
pages                          page_sections
├── id                         ├── id
├── title                      ├── page_id  (FK → pages.id)
├── slug           ────────┐   ├── type
├── status                 └──►├── title
├── seo_title                  ├── content   (JSON)
├── seo_description            ├── settings  (JSON)
├── seo_image_id                ├── position
├── created_at                  ├── status
└── updated_at                  ├── created_at
                                 └── updated_at
```

**Page status**: `draft` (editable, not public) or `published` (live).

**Dynamic page architecture**: rather than hard-coding each page, content is stored as an ordered list of sections. `type` tells the frontend which component to render, `content` holds the actual copy, `settings` holds presentation config, and `position` controls order:

```json
{
  "type": "hero",
  "title": "About Us",
  "content": {
    "heading": "ABOUT US",
    "subheading": "Bridging Rwanda's fertile land with global markets."
  },
  "settings": {
    "alignment": "center"
  },
  "position": 0,
  "status": "active"
}
```

For example, an About page might be composed of `hero`, `story`, `vision`, `mission`, `team`, and `partners` sections — each a separate `page_sections` row, reorderable independently of the page itself.

#### Routes

| Method | Endpoint                                   | Description                        |
| ------ | ------------------------------------------ | ---------------------------------- |
| GET    | `/api/pages`                               | List pages                         |
| GET    | `/api/pages/{id}`                          | Get a page by ID                   |
| GET    | `/api/pages/slug/{slug}`                   | Get a page (with sections) by slug |
| POST   | `/api/pages`                               | Create a page                      |
| PUT    | `/api/pages/{id}`                          | Update a page                      |
| DELETE | `/api/pages/{id}`                          | Delete a page                      |
| GET    | `/api/pages/{pageId}/sections`             | List sections for a page           |
| GET    | `/api/pages/{pageId}/sections/{sectionId}` | Get a section                      |
| POST   | `/api/pages/{pageId}/sections`             | Create a section                   |
| PUT    | `/api/pages/{pageId}/sections/{sectionId}` | Update a section                   |
| DELETE | `/api/pages/{pageId}/sections/{sectionId}` | Delete a section                   |
| PUT    | `/api/pages/{pageId}/sections/reorder`     | Reorder sections                   |

> None of the Pages/Page Sections routes currently require auth — anyone can create, edit, or delete pages and sections. Consider protecting the write routes the same way Settings/NavLinks do.

#### Example: Create a page

```
POST /api/pages
Content-Type: application/json

{
  "title": "About Us",
  "slug": "about-us",
  "status": "draft",
  "seo_title": "About Kaina Fresh",
  "seo_description": "Learn more about Kaina Fresh."
}
```

```json
{
  "success": true,
  "message": "Page created successfully",
  "data": {
    "id": 2,
    "title": "About Us",
    "slug": "about-us",
    "status": "draft"
  }
}
```

#### Example: Create a page section

```
POST /api/pages/2/sections
Content-Type: application/json

{
  "type": "hero",
  "title": "About Us",
  "content": {
    "heading": "ABOUT US",
    "subheading": "Bridging Rwanda's fertile land with global markets."
  },
  "settings": { "alignment": "center" },
  "position": 0,
  "status": "active"
}
```

> `PUT .../sections/{id}` replaces `content`/`settings` wholesale — it does not deep-merge. Always send the full object back, not just the changed key.

#### Example: Reorder sections

```
PUT /api/pages/2/sections/reorder
Content-Type: application/json

{
  "sections": [
    { "id": 5, "position": 0 },
    { "id": 3, "position": 1 },
    { "id": 7, "position": 2 }
  ]
}
```

The backend verifies every submitted section belongs to the target page before applying positions, and performs the update inside a database transaction (rolled back on any failure).

### Settings

Single-row table holding site-wide configuration (contact info, social links, logo).

```
settings
├── id
├── site_title
├── site_logo
├── primary_email
├── secondary_email        (nullable)
├── other_email            (nullable)
├── facebook / instagram / tiktok / linkedin / youtube   (nullable)
├── address                (nullable)
├── primary_number         (nullable)
├── secondary_number       (nullable)
└── other_numbers          (nullable)
```

| Method | Endpoint                      | Description                                                           |
| ------ | ----------------------------- | --------------------------------------------------------------------- |
| GET    | `/api/settings`               | Get site settings                                                     |
| POST   | `/api/settings/create` 🔒     | Create/update settings (admin only)                                   |
| POST   | `/api/settings/uploadlogo` 🔒 | Upload/replace the site logo (multipart `site_logo` file, admin only) |

`POST /api/settings/create` upserts: if a settings row already exists it's updated instead of duplicated. Required fields: `site_title`, `primary_email`, `address`, `primary_number`.

### Navigation Links

```
navlinks
├── id
├── link_name    (unique)
├── link         (unique)
├── link_type    (default: 'main_nav')
├── created_at
└── updated_at
```

| Method | Endpoint                       | Description                                                            |
| ------ | ------------------------------ | ---------------------------------------------------------------------- |
| GET    | `/api/navlinks`                | List all nav links                                                     |
| GET    | `/api/navlinks/nav`            | List only navigation-facing links                                      |
| POST   | `/api/navlinks/create` 🔒      | Create a link (admin only) — requires `link`, `link_type`, `link_name` |
| PUT    | `/api/navlinks/update/{id}` 🔒 | Update a link (admin only)                                             |
| DELETE | `/api/navlinks/delete/{id}` 🔒 | Delete a link (admin only)                                             |

### Team

```
team
├── id
├── name
├── role
├── initials
├── phone_number   (nullable)
├── email          (nullable)
├── status         (default: 'active')
├── created_at
└── updated_at
```

| Method | Endpoint         | Description                                                                         |
| ------ | ---------------- | ----------------------------------------------------------------------------------- |
| GET    | `/api/team`      | List team members                                                                   |
| GET    | `/api/team/test` | Health check for this controller                                                    |
| POST   | `/api/team/new`  | Create a team member — requires `name`, `role`, `initials`, `phone_number`, `email` |

### Units

Measurement units used by products (e.g. kg, g, piece).

```
units
├── id
├── code      (unique)
├── name
├── symbol
├── created_at
└── updated_at
```

| Method | Endpoint          | Description    |
| ------ | ----------------- | -------------- |
| GET    | `/api/units`      | List all units |
| GET    | `/api/units/{id}` | Get a unit     |
| POST   | `/api/units`      | Create a unit  |
| PUT    | `/api/units/{id}` | Update a unit  |
| DELETE | `/api/units/{id}` | Delete a unit  |

#### Example: Create a unit

```json
{
  "code": "kg",
  "name": "Kilogram",
  "symbol": "kg"
}
```

Example seed values: `kg`/Kilogram, `g`/Gram, `mg`/Milligram, `lb`/Pound, `oz`/Ounce.

### Products

```
products
├── id
├── name
├── description      (nullable)
├── product_image     (nullable — file path)
├── unit_id           (FK → units.id, ON DELETE RESTRICT)
├── shelf_life         (days)
├── price              (decimal 12,2, default 0.00)
├── status             ('active' | 'inactive', default 'active')
├── created_at
└── updated_at
```

| Method | Endpoint             | Description                           |
| ------ | -------------------- | ------------------------------------- |
| GET    | `/api/products`      | List products (joined with unit info) |
| GET    | `/api/products/{id}` | Get a product (joined with unit info) |
| POST   | `/api/products`      | Create a product                      |
| PUT    | `/api/products/{id}` | Update a product                      |
| DELETE | `/api/products/{id}` | Delete a product                      |

Create/update accept `multipart/form-data` when uploading `product_image`, or a plain JSON body otherwise. Required on create: `name`, `unit_id`, `shelf_life`, `price` — `unit_id` must reference an existing unit. If validation fails after an image was uploaded, the uploaded file is deleted automatically. On delete, the product's image file is removed after the database row.

#### Example: Create a product

```
POST /api/products
Content-Type: application/json

{
  "name": "Fresh Tomatoes",
  "description": "Farm-grown tomatoes",
  "unit_id": 1,
  "shelf_life": 7,
  "price": 1500,
  "status": "active"
}
```

### Stocks

```
stocks
├── id
├── productid     (FK → products.id, ON DELETE RESTRICT)
├── variety        (nullable)
├── grade          (nullable)
├── quantity        (decimal 12,3, default 0.000)
├── farm_plot       (nullable)
├── harvest_date     (nullable)
├── pack_date        (nullable)
├── created_at
└── updated_at
```

| Method | Endpoint           | Description          |
| ------ | ------------------ | -------------------- |
| GET    | `/api/stocks`      | List stock entries   |
| GET    | `/api/stocks/{id}` | Get a stock entry    |
| POST   | `/api/stocks`      | Create a stock entry |
| PUT    | `/api/stocks/{id}` | Update a stock entry |
| DELETE | `/api/stocks/{id}` | Delete a stock entry |

> ⚠️ **Not yet implemented.** The `stocks` migration and the routes above exist, but there is no `StockController` or `Stock` model in `controllers/`/`models/` yet — calling these routes will currently fail. Follow the pattern in `ProductController`/`Product` (including the `productid` foreign-key existence check) when implementing.

## Database Import Notes

If the schema has changed upstream, drop all existing tables in your local database and import the current SQL dump from the `db/` folder rather than trying to reconcile migrations manually.

## Troubleshooting

- `migrations/migrations/` must be writable by the PHP process when generating new migrations.
- The migration runner creates its own `migrations` tracking table in the configured database.
- Changed DB credentials in `.env`? Restart the dev server — env vars are read at process start.
- `.env` key names must match exactly what `config/database.php` reads (`DB_NAME`, `DB_USER`) — see [Configuration](#configuration).

## Customers Management

The `customers` module manages customer information for the IMS.

### Structure

```text
controllers/
└── ims/
    └── CustomerController.php

models/
└── ims/
    └── Customer.php

Customers Table
customers
├── id
├── first_name
├── last_name
├── phone
├── email
├── address
├── created_at
└── updated_at

API Routes
Method	Endpoint	Description
GET	/api/customers	List all customers
GET	/api/customers/{id}	Get a customer
POST	/api/customers	Create a customer
PUT	/api/customers/{id}	Update a customer
DELETE	/api/customers/{id}	Delete a customer

Create Customer
POST /api/customers
Content-Type: application/json

{
    "first_name": "Jean",
    "last_name": "Mugisha",
    "phone": "+250788123456",
    "email": "jean@example.com",
    "address": "Kigali, Rwanda"
}

Migration
Create the migration:

php migrations/MigrationRunner.php make create_customers_table

Run migration:

php migrations/MigrationRunner.php migrate

Check migration status:

php migrations/MigrationRunner.php status

Notes
first_name, last_name, and phone are required.
email and address are optional.
Customer model and controller are located inside the ims directories.
The module uses the existing base Model, BaseController, router, and migration system.
```

ChatGPT said:
Orders Module
The orders module manages customer orders within the IMS.

Orders Structure
orders
├── id
├── user_id
├── customer_id
├── order_date
├── status
├── total
├── order_source
├── created_at
└── updated_at

Relationships
users.id
│
└── orders.user_id

customers.id
│
└── orders.customer_id

user_id is required and references the users table.
customer_id is optional and references the customers table.
If a customer is deleted, customer_id is set to NULL.
Order Source
Supported values:

ecommerce
externalorder

Default:

ecommerce

Order Status
The default order status is:

pending

Other statuses can be added later as the order workflow is defined.

Models and Controllers
The module uses the IMS structure:

models/
└── ims/
└── Order.php

controllers/
└── ims/
└── OrderController.php

The Order model provides order operations and retrieves related user and customer information.

The OrderController handles creating, reading, updating, and deleting orders.

API Routes
Method Endpoint Description
GET /api/orders List all orders
GET /api/orders/{id} Get a single order
POST /api/orders Create an order
PUT /api/orders/{id} Update an order
DELETE /api/orders/{id} Delete an order

Create Order
POST /api/orders

Example:

{
"user_id": 1,
"customer_id": 1,
"order_date": "2026-08-26 14:00:00",
"status": "pending",
"total": 30000,
"order_source": "ecommerce"
}

customer_id is optional:

{
"user_id": 1,
"total": 30000,
"order_source": "externalorder"
}

Example Response
{
"success": true,
"message": "Order created successfully",
"data": {
"id": 1,
"user_id": 1,
"customer_id": 1,
"order_date": "2026-08-26 14:00:00",
"status": "pending",
"total": "30000.00",
"order_source": "ecommerce"
}
}

Validation
When creating or updating an order:

user_id must reference an existing user.
customer_id must reference an existing customer when provided.
total must be a valid non-negative number.
order_source must be ecommerce or externalorder.
customer_id can be NULL for orders without a registered customer.
Migration
The migration is located in:

migrations/migrations/

Run pending migrations with:

php migrations/MigrationRunner.php migrate

Rollback the latest migration with:

php migrations/MigrationRunner.php rollback 1

# Order Items Module

The `order_items` module manages the products included in customer orders.

## Order Items Structure

```text
order_items
├── id
├── order_id
├── product_id
├── quantity
├── unit_price
├── subtotal
├── created_at
└── updated_at

Relationships
orders.id
    │
    └── order_items.order_id

products.id
    │
    └── order_items.product_id

Each order can contain multiple order items.
Each order item belongs to one order.
Each order item references one product.
Deleting an order also deletes its order items.
Products cannot be deleted while they are referenced by an order item.
Fields
Field	Description
id	Order item ID
order_id	ID of the order
product_id	ID of the product
quantity	Quantity ordered
unit_price	Product price at the time of the order
subtotal	quantity × unit_price
created_at	Creation date
updated_at	Last update date

API Routes
Method	Endpoint	Description
GET	/api/order-items	List all order items
GET	/api/order-items/{id}	Get an order item
GET	/api/orders/{orderId}/items	List items for an order
POST	/api/orders/{orderId}/items	Add an item to an order
PUT	/api/order-items/{id}	Update an order item
DELETE	/api/order-items/{id}	Delete an order item

Create Order Item
POST /api/orders/{orderId}/items
Content-Type: application/json

Example:

{
    "product_id": 2,
    "quantity": 10
}

The backend automatically gets the product price and calculates the subtotal.

Example:

quantity   = 10
unit_price = 30000
subtotal   = 300000

unit_price and subtotal should not be supplied by the frontend.

Example Response
{
    "success": true,
    "message": "Order item created successfully",
    "data": {
        "id": 1,
        "order_id": 1,
        "product_id": 2,
        "quantity": "10.000",
        "unit_price": "30000.00",
        "subtotal": "300000.00",
        "product_name": "Avocado",
        "unit_code": "kg",
        "unit_name": "Kilogram",
        "unit_symbol": "kg"
    }
}

Update Order Item
PUT /api/order-items/{id}
Content-Type: application/json

Example:

{
    "product_id": 2,
    "quantity": 15
}

The backend recalculates:

unit_price
subtotal

when the item is updated.

Delete Order Item
DELETE /api/order-items/{id}

Deleting an order item removes it from the order.

Migration
Create the migration:

php migrations/MigrationRunner.php make create_order_items_table

Run migrations:

php migrations/MigrationRunner.php migrate

Check migration status:

php migrations/MigrationRunner.php status

Module Location
The module follows the IMS structure:

controllers/
└── ims/
    └── OrderItemController.php

models/
└── ims/
    └── OrderItem.php

migrations/
└── migrations/
    └── *_create_order_items_table.php

Order Structure
Orders and order items work together:

Order
│
├── customer
├── order_date
├── status
├── order_source
├── total
│
└── Order Items
    ├── Product
    ├── Quantity
    ├── Unit Price
    └── Subtotal

The order total should be calculated from the order items:

orders.total = SUM(order_items.subtotal)
```
