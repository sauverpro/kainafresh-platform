# PHP Backend API

## 1. Project Overview

This project is a backend-only REST API built with:

- **PHP** — plain PHP, no framework
- **MySQL** — relational database
- **MySQLi** — database connectivity
- **Apache** — provided by XAMPP during local development
- **Custom lightweight router** — for API routing
- **Bearer token authentication** — for protected API endpoints

The project intentionally avoids a PHP framework in order to keep the backend lightweight, transparent, and fully controlled by the development team.

---

## 2. Development Environment

The current local development environment is:

```text
Windows
XAMPP
Apache
MySQL
PHP
```

---

## 3. Current Project Structure

```text
my-project/
│
├── config/
│   └── database.php
│
├── public/
│   ├── index.php
│   ├── .htaccess
│   └── test-db.php
│
├── routes/
│   └── api.php
│
├── src/
│   ├── Router.php
│   │
│   ├── Controllers/
│   │   └── AuthController.php
│   │
│   └── Middleware/
│       └── AuthMiddleware.php
│
├── .env
└── README.md
```

### Directory responsibilities

#### `config/`

Contains application configuration.

```text
config/database.php
```

Responsible for creating the MySQLi database connection.

---

#### `public/`

This is the application's public entry point.

```text
public/index.php
```

Receives incoming HTTP requests and sends them to the router.

```text
public/.htaccess
```

Rewrites requests to `index.php` when the requested resource does not physically exist.

---

#### `routes/`

Contains API route definitions.

```text
routes/api.php
```

Defines which HTTP method and URL should execute which controller/action.

---

#### `src/`

Contains the application's PHP code.

```text
src/Router.php
```

Contains the lightweight custom HTTP router.

```text
src/Controllers/
```

Contains application controllers.

```text
src/Middleware/
```

Contains request-processing logic that runs before protected endpoints.

---

## 4. Request Flow

Incoming API requests follow this structure:

```text
Client
  │
  │ HTTP Request
  ▼
Apache
  │
  ▼
public/.htaccess
  │
  ▼
public/index.php
  │
  ▼
routes/api.php
  │
  ▼
Router
  │
  ▼
Controller / Middleware
  │
  ▼
MySQL
  │
  ▼
JSON Response
```

The goal is to keep the responsibilities separated without introducing unnecessary framework complexity.

---

# 5. Database

The application currently uses a MySQL database called:

```text
my_project
```

Database credentials are stored in `.env`.

Example:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=my_project
DB_USER=root
DB_PASSWORD=
```

---

## 6. Users Table

The authentication system uses a `users` table.

```sql
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Fields

| Field        | Description                 |
| ------------ | --------------------------- |
| `id`         | Unique user identifier      |
| `email`      | User's unique email address |
| `password`   | Hashed password             |
| `created_at` | Account creation time       |
| `updated_at` | Last account update time    |

Passwords are **never stored in plain text**.

PHP's:

```php
password_hash()
```

is used when creating a password.

PHP's:

```php
password_verify()
```

is used during login.

---

# 7. Authentication Tokens

The authentication system uses an `auth_tokens` table.

```sql
CREATE TABLE auth_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_auth_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
```

### Fields

| Field        | Description                              |
| ------------ | ---------------------------------------- |
| `id`         | Unique token record                      |
| `user_id`    | User associated with the token           |
| `token_hash` | SHA-256 hash of the authentication token |
| `expires_at` | Token expiration date/time               |
| `created_at` | Token creation time                      |

The raw authentication token is returned to the client but is **not stored directly in the database**.

Instead:

```text
Raw token
    ↓
SHA-256
    ↓
token_hash
    ↓
MySQL
```

This means a database leak does not directly expose the usable bearer tokens.

---

# 8. Authentication API

The current authentication endpoints are:

```text
POST /api/register
POST /api/login
GET  /api/me
POST /api/logout
```

---

## 8.1 Register

### Endpoint

```text
POST /api/register
```

### Request

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Successful response

HTTP:

```text
201 Created
```

```json
{
  "success": true,
  "message": "User registered successfully"
}
```

### Validation

The registration endpoint currently:

- Validates the email address.
- Requires a password of at least 8 characters.
- Checks whether the email already exists.
- Hashes the password before storing it.
- Uses a MySQLi prepared statement.

If the email already exists:

HTTP:

```text
409 Conflict
```

```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

# 9. Login

### Endpoint

```text
POST /api/login
```

### Request

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

The server:

1. Finds the user by email.
2. Verifies the password using `password_verify()`.
3. Generates a cryptographically secure random token.
4. Hashes the token using SHA-256.
5. Stores the token hash in `auth_tokens`.
6. Returns the original token to the client.

### Successful response

```json
{
  "success": true,
  "message": "Login successful",
  "token": "AUTHENTICATION_TOKEN",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

The client must keep the returned token and send it with requests to protected endpoints.

---

# 10. Authentication Header

Protected endpoints require:

```http
Authorization: Bearer AUTHENTICATION_TOKEN
```

Example:

```http
GET /api/me
Authorization: Bearer abc123...
```

The server:

```text
Authorization header
        ↓
Extract Bearer token
        ↓
SHA-256 hash
        ↓
Search auth_tokens
        ↓
Check expiration
        ↓
Find user
        ↓
Allow request
```

---

# 11. Authentication Middleware

Protected endpoints use:

```text
src/Middleware/AuthMiddleware.php
```

The middleware is responsible for:

- Reading the Authorization header.
- Extracting the Bearer token.
- Hashing the token.
- Finding the token in the database.
- Checking whether the token has expired.
- Retrieving the authenticated user.

If authentication fails, the API returns HTTP:

```text
401 Unauthorized
```

---

# 12. Current User

### Endpoint

```text
GET /api/me
```

### Required header

```http
Authorization: Bearer AUTHENTICATION_TOKEN
```

### Successful response

```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

This endpoint is currently used to verify that authentication is working correctly.

---

# 13. Logout

### Endpoint

```text
POST /api/logout
```

### Required header

```http
Authorization: Bearer AUTHENTICATION_TOKEN
```

During logout, the server hashes the provided token and removes the corresponding token record from `auth_tokens`.

After logout, the same token can no longer authenticate the user.

For example:

```text
POST /api/login
        ↓
Token created
        ↓
GET /api/me
        ↓
Authenticated
        ↓
POST /api/logout
        ↓
Token revoked
        ↓
GET /api/me
        ↓
401 Unauthorized
```

---

# 14. Current API Routes

| Method | Endpoint        | Authentication | Purpose                |
| ------ | --------------- | -------------- | ---------------------- |
| `GET`  | `/api/test`     | No             | Verify API is running  |
| `POST` | `/api/register` | No             | Create a user          |
| `POST` | `/api/login`    | No             | Authenticate a user    |
| `GET`  | `/api/me`       | Yes            | Get authenticated user |
| `POST` | `/api/logout`   | Yes            | Revoke current token   |

---

# 15. Database Access

The application uses **MySQLi**, not PDO.

Database access uses prepared statements.

Example:

```php
$stmt = $mysqli->prepare(
    'SELECT id FROM users WHERE email = ? LIMIT 1'
);

$stmt->bind_param('s', $email);
$stmt->execute();
```

User-provided values should **never** be directly concatenated into SQL queries.

Bad:

```php
$sql = "SELECT * FROM users WHERE email = '$email'";
```

Good:

```php
$stmt = $mysqli->prepare(
    'SELECT * FROM users WHERE email = ?'
);

$stmt->bind_param('s', $email);
$stmt->execute();
```

---

# 16. API Response Format

The API currently returns JSON responses.

Successful response:

```json
{
  "success": true,
  "message": "Operation successful"
}
```

Error response:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

HTTP status codes should be used appropriately.

Current examples:

```text
201 Created
401 Unauthorized
409 Conflict
422 Unprocessable Entity
```

---

# 17. Security Principles

The current authentication implementation follows these principles:

### Passwords

Passwords are hashed using:

```php
password_hash($password, PASSWORD_DEFAULT);
```

Passwords must never be stored or returned in plain text.

### SQL Injection

MySQLi prepared statements are used for user-provided values.

### Authentication Tokens

Authentication tokens are generated using:

```php
random_bytes()
```

The database stores a SHA-256 hash rather than the raw token.

### Token Expiration

Tokens contain an expiration time and expired tokens cannot authenticate requests.

### Generic Login Errors

Invalid credentials return a generic message:

```text
Invalid email or password
```

This avoids unnecessarily revealing whether a specific email exists.

---

# 18. Local Development

Start the following services in XAMPP:

```text
Apache
MySQL
```

Then access:

```text
http://localhost/my-project/public/
```

The API can be tested using:

- Postman
- Insomnia
- Thunder Client
- curl
- Any HTTP client

---

# 19. Testing Authentication Manually

A basic authentication test should follow this sequence:

### Step 1 — Register

```text
POST /api/register
```

### Step 2 — Login

```text
POST /api/login
```

Copy the returned token.

### Step 3 — Access protected endpoint

```text
GET /api/me
```

with:

```http
Authorization: Bearer TOKEN
```

### Step 4 — Logout

```text
POST /api/logout
```

with the same token.

### Step 5 — Verify token revocation

Call:

```text
GET /api/me
```

again using the old token.

Expected result:

```text
401 Unauthorized
```

---

# 20. Development Rules

To keep the project maintainable:

1. Keep the project framework-free unless the team agrees otherwise.
2. Use MySQLi prepared statements for database queries.
3. Never store plain-text passwords.
4. Never commit `.env` credentials.
5. Never return passwords in API responses.
6. Protected endpoints must use authentication middleware.
7. Return JSON from API endpoints.
8. Use appropriate HTTP status codes.
9. Keep controllers focused on handling requests.
10. Avoid creating unnecessary files or abstractions for very small pieces of functionality.

---

# 21. Current Architecture Status

The following functionality is currently implemented:

```text
Project structure          ✅
MySQL connection           ✅
MySQLi                     ✅
Lightweight router         ✅
Apache URL rewriting       ✅
User registration          ✅
Password hashing           ✅
User login                 ✅
Bearer token authentication ✅
Token hashing              ✅
Token expiration           ✅
Authentication middleware  ✅
Current-user endpoint      ✅
Logout                     ✅
Token revocation           ✅
```

---

# 22. Planned Improvements

These are intentionally **not implemented yet** and should be handled as the project evolves:

- Login rate limiting
- More comprehensive input validation
- Expired-token cleanup
- Password reset
- Email verification
- Password change
- Account status/activation
- Better centralized error handling
- CORS configuration if a separate frontend is introduced
- HTTPS configuration for production
- Production error logging
- Automated tests
- API versioning if the project grows significantly

These should be added when they become relevant rather than over-engineering the initial system.

---

# 23. Collaboration Guidelines

When another developer joins the project, they should first:

1. Read this README.
2. Configure their local XAMPP environment.
3. Create the `my_project` MySQL database.
4. Create the required database tables.
5. Configure their local `.env`.
6. Verify the database connection.
7. Test `/api/test`.
8. Test registration.
9. Test login.
10. Test `/api/me`.
11. Test logout.

## Database Setup

The MySQL database dump is available in the `db` folder in the project root.

Import it using **phpMyAdmin**:

1. Open phpMyAdmin.
2. Create a new MySQL database.
3. Select the database.
4. Go to **Import**.
5. Select the `.sql` file from the `db` folder.
6. Click **Import**.
