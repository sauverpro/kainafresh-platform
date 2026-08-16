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

