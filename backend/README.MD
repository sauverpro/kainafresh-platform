**Project Overview**

- **Backend:** Minimal PHP API layer using a small router and a lightweight migration system.

**Requirements**

- **PHP:** 7.4+ with `mysqli` extension enabled.
- **Database:** MySQL / MariaDB.

**Configuration**

- **Database config:** See [config/database.php](config/database.php#L1-L9). The code loads values from environment variables if present (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`). You can create a `.env` file in the `backend/` folder with those variables, e.g.:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=kainafresh
DB_USER=root
DB_PASSWORD=
```

**JWT Secret**

- The project uses `core/JWT.php`, which reads the secret from the `JWT_SECRET` environment variable (falls back to a default string if not set). For production, generate a strong secret and add it to your `.env` file:

Examples (generate 32 random bytes, hex encoded):

```bash
php -r "echo bin2hex(random_bytes(32));"
```

or using OpenSSL:

```bash
openssl rand -hex 32
```

Add the generated value to `.env`:

```
JWT_SECRET=your_generated_secret_here
```

- Restart your development server after updating `.env`. For production, store the secret in a secure secret manager or environment configuration (do not commit it to source control).

**Migrations**

- **Location:** migration base classes and runner are in `migrations/`; user migration files live in `migrations/migrations/`.
- **Key files:**
  - [migrations/Migration.php](migrations/Migration.php#L1-L70): abstract base class. Implement `up()` and `down()` and use helper methods such as `createTable()`, `dropTable()`, `addColumn()`, `dropColumn()`.
  - [migrations/MigrationGenerator.php](migrations/MigrationGenerator.php#L1-L146): helper to scaffold migration files.
  - [migrations/MigrationRunner.php](migrations/MigrationRunner.php#L1-L260): CLI runner to create, run, rollback and inspect migrations.

- **Create a migration (scaffold):**

```
php migrations/MigrationRunner.php make migration_name
```

Examples:

```
php migrations/MigrationRunner.php make create_users_table
php migrations/MigrationRunner.php make add_phone_to_users_table alter
```

- **Run pending migrations:**

```
php migrations/MigrationRunner.php migrate
```

- **Rollback migrations:**

```
php migrations/MigrationRunner.php rollback [steps]
```

Default `steps` is `1` (roll back the latest batch). The runner keeps a `migrations` table to track executed files and batches.

- **Status:**

```
php migrations/MigrationRunner.php status
```

**Migration authoring notes**

- A migration class extends `Migration` and must implement `up()` and `down()`.
- Use the helper methods provided by `Migration` to build SQL safely:
  - `createTable($name, $columns)` — create a table from a column definition array.
  - `dropTable($name)` — drop the table.
  - `addColumn($table, $column)` — add a column with the same column definition format.
  - `dropColumn($table, $columnName)` — drop a column.
- See existing examples in `migrations/migrations/` such as `20260816093909_create_users_table.php` and `20260816094423_create_auth_tokens_table.php` for structure and column examples.

**Running the server (development)**

- From the `backend/` directory you can run PHP's built-in web server for development:

```
php -S 127.0.0.1:8000
```

Then open `http://127.0.0.1:8000` (routes are defined in `routes/api.php`). The entrypoint `index.php` autoloads classes and reads a `.env` file if present.

**Notes & troubleshooting**

- Ensure the `migrations/migrations/` directory is writable by the user running PHP when generating migrations.
- The migration runner will create a `migrations` table in the configured database to track applied migrations.
- If you change DB credentials, update `.env` or `config/database.php` accordingly and restart the server (if applicable).

**Useful commands summary**

- Create scaffolded migration: `php migrations/MigrationRunner.php make create_users_table`
- Run migrations: `php migrations/MigrationRunner.php migrate`
- Rollback: `php migrations/MigrationRunner.php rollback 1`
- Check status: `php migrations/MigrationRunner.php status`
- Start dev server: `php -S 127.0.0.1:8000`

# CMS Management Implementations

The pages table represents website pages.

Current structure:

pages
├── id
├── title
├── slug
├── status
├── seo_title
├── seo_description
├── seo_image_id
├── created_at
└── updated_at
Page status

A page can have:

draft
published

Draft pages can be edited without being publicly available.

Published pages are intended for the public website.

8. Page Sections

The page_sections table provides the foundation for the Kaina Fresh CMS/page-builder architecture.

Structure:

page_sections
├── id
├── page_id
├── type
├── title
├── content
├── settings
├── position
├── status
├── created_at
└── updated_at

Relationship:

pages.id
│
└──────── page_sections.page_id

The foreign key uses:

ON DELETE CASCADE

Therefore, deleting a page also removes its associated sections.

9. Dynamic Page Architecture

Instead of hard-coding every website page into PHP, the backend stores sections dynamically.

For example, the Kaina Fresh About page can conceptually contain:

About Us
│
├── Hero
├── Our Story
├── Image
├── Vision
├── Mission
├── Team
└── Partners

These become records in page_sections.

Example:

{
"type": "hero",
"title": "About Us",
"content": {
"heading": "ABOUT US",
"subheading": "Bridging Rwanda’s fertile land with global markets."
},
"settings": {
"alignment": "center"
},
"position": 0,
"status": "active"
}

The important distinction is:

content

Stores the actual section content.

settings

Stores presentation/configuration information.

position

Controls the order of sections.

type

Tells the frontend which component should render the section.

10. Page Ordering

Sections can be reordered without modifying the page itself.

Example:

Before:

Hero
Story
Vision
Mission
Partners

After:

Hero
Vision
Story
Mission
Partners

The position values determine the order.

The backend provides a reorder endpoint so the frontend/admin interface can support drag-and-drop page editing.

11. Models

The project uses a base Model class.

abstract class Model

The base model provides common operations such as:

all()
find()
create()
update()
delete()

Models extend this class.

Example:

class Page extends Model
{
protected $table = 'pages';
}

The Page model additionally handles retrieving pages together with their sections.

12. Controllers

Controllers handle HTTP requests and return JSON responses.

Current controllers include:

AuthController
PageController
PageSectionController
AuthController

Handles authentication operations such as:

register
login
PageController

Handles page operations:

list pages
get page
get page by slug
create page
update page
delete page
PageSectionController

Handles section operations:

list sections
get section
create section
update section
delete section
reorder sections 13. API Routes
Authentication
POST /api/auth/register
POST /api/auth/login

Health check:

GET /api/health
Pages

List pages:

GET /api/pages

Get a page:

GET /api/pages/{id}

Get page by slug:

GET /api/pages/slug/{slug}

Create page:

POST /api/pages

Update page:

PUT /api/pages/{id}

Delete page:

DELETE /api/pages/{id}

Page Sections

List sections:

GET /api/pages/{pageId}/sections

Get a section:

GET /api/pages/{pageId}/sections/{sectionId}

Create a section:

POST /api/pages/{pageId}/sections

Update a section:

PUT /api/pages/{pageId}/sections/{sectionId}

Delete a section:

DELETE /api/pages/{pageId}/sections/{sectionId}

Reorder sections:

PUT /api/pages/{pageId}/sections/reorder 14. Example: Create a Page

Request:

POST /api/pages
Content-Type: application/json

Body:

{
"title": "About Us",
"slug": "about-us-2",
"status": "draft",
"seo_title": "About Kaina Fresh",
"seo_description": "Learn more about Kaina Fresh."
}

Successful response:

{
"success": true,
"message": "Page created successfully",
"data": {
"id": 2,
"title": "About Us",
"slug": "about-us-2",
"status": "draft"
}
}

## 1Example: Create a Page Section

POST /api/pages/2/sections
Content-Type: application/json

Example body:

{
"type": "hero",
"title": "About Us",
"content": {
"heading": "ABOUT US",
"subheading": "Bridging Rwanda’s fertile land with global markets."
},
"settings": {
"alignment": "center"
},
"position": 0,
"status": "active"
} 16. Example: Reorder Sections

Request:

PUT /api/pages/2/sections/reorder
Content-Type: application/json

Body:

{
"sections": [
{
"id": 5,
"position": 0
},
{
"id": 3,
"position": 1
},
{
"id": 7,
"position": 2
}
]
}

The backend verifies that the submitted sections belong to the requested page before updating their positions.

The operation is performed inside a database transaction so that a failed update can be rolled back.

## Migration System

The project includes a lightweight migration system.

Migration files are located at:

migrations/migrations/

A migration extends:

Migration

and implements:

up()
down()

Example:

class CreatePagesTable extends Migration
{
public function up()
{
// create table
}

    public function down()
    {
        // rollback
    }

}

## Dynamic Page Rendering

The frontend can render sections based on their type.

For example:

type = hero
↓
Hero component

type = story
↓
Story component

type = vision
↓
Vision component

type = team
↓
Team component

type = partners
↓
Partners component

This allows the backend to control page structure while the frontend controls visual presentation.

## update database
use the provided sql file from folder name db and drop all tables from your local db you already have and import the newly provided sql file.