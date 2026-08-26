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

| Variable | Default |
|---|---|
| `DB_HOST` | `127.0.0.1` |
| `DB_PORT` | `3306` |
| `DB_NAME` | `kainafresh` |
| `DB_USER` | `root` |
| `DB_PASSWORD` | *(empty)* |

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

| File | Purpose |
|---|---|
| [migrations/Migration.php](migrations/Migration.php) | Abstract base class. Implement `up()` / `down()`; use `createTable()`, `dropTable()`, `addColumn()`, `dropColumn()`. |
| [migrations/MigrationGenerator.php](migrations/MigrationGenerator.php) | Scaffolds new migration files. |
| [migrations/MigrationRunner.php](migrations/MigrationRunner.php) | CLI to create, run, roll back, and inspect migrations. |

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

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in, returns a JWT |

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

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/pages` | List pages |
| GET | `/api/pages/{id}` | Get a page by ID |
| GET | `/api/pages/slug/{slug}` | Get a page (with sections) by slug |
| POST | `/api/pages` | Create a page |
| PUT | `/api/pages/{id}` | Update a page |
| DELETE | `/api/pages/{id}` | Delete a page |
| GET | `/api/pages/{pageId}/sections` | List sections for a page |
| GET | `/api/pages/{pageId}/sections/{sectionId}` | Get a section |
| POST | `/api/pages/{pageId}/sections` | Create a section |
| PUT | `/api/pages/{pageId}/sections/{sectionId}` | Update a section |
| DELETE | `/api/pages/{pageId}/sections/{sectionId}` | Delete a section |
| PUT | `/api/pages/{pageId}/sections/reorder` | Reorder sections |

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
  "data": { "id": 2, "title": "About Us", "slug": "about-us", "status": "draft" }
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

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/settings` | Get site settings |
| POST | `/api/settings/create` 🔒 | Create/update settings (admin only) |
| POST | `/api/settings/uploadlogo` 🔒 | Upload/replace the site logo (multipart `site_logo` file, admin only) |

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

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/navlinks` | List all nav links |
| GET | `/api/navlinks/nav` | List only navigation-facing links |
| POST | `/api/navlinks/create` 🔒 | Create a link (admin only) — requires `link`, `link_type`, `link_name` |
| PUT | `/api/navlinks/update/{id}` 🔒 | Update a link (admin only) |
| DELETE | `/api/navlinks/delete/{id}` 🔒 | Delete a link (admin only) |

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

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/team` | List team members |
| GET | `/api/team/test` | Health check for this controller |
| POST | `/api/team/new` | Create a team member — requires `name`, `role`, `initials`, `phone_number`, `email` |

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

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/units` | List all units |
| GET | `/api/units/{id}` | Get a unit |
| POST | `/api/units` | Create a unit |
| PUT | `/api/units/{id}` | Update a unit |
| DELETE | `/api/units/{id}` | Delete a unit |

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

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List products (joined with unit info) |
| GET | `/api/products/{id}` | Get a product (joined with unit info) |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/{id}` | Update a product |
| DELETE | `/api/products/{id}` | Delete a product |

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

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stocks` | List stock entries |
| GET | `/api/stocks/{id}` | Get a stock entry |
| POST | `/api/stocks` | Create a stock entry |
| PUT | `/api/stocks/{id}` | Update a stock entry |
| DELETE | `/api/stocks/{id}` | Delete a stock entry |

> ⚠️ **Not yet implemented.** The `stocks` migration and the routes above exist, but there is no `StockController` or `Stock` model in `controllers/`/`models/` yet — calling these routes will currently fail. Follow the pattern in `ProductController`/`Product` (including the `productid` foreign-key existence check) when implementing.

## Database Import Notes

If the schema has changed upstream, drop all existing tables in your local database and import the current SQL dump from the `db/` folder rather than trying to reconcile migrations manually.

## Troubleshooting

- `migrations/migrations/` must be writable by the PHP process when generating new migrations.
- The migration runner creates its own `migrations` tracking table in the configured database.
- Changed DB credentials in `.env`? Restart the dev server — env vars are read at process start.
- `.env` key names must match exactly what `config/database.php` reads (`DB_NAME`, `DB_USER`) — see [Configuration](#configuration).
