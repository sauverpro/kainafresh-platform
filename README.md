for better experience, drop all tables you have on your local kainafresh database and import fresh tables from db folder

# Stock Management

The `stocks` module manages available agricultural product stock, including product variety, grade, quantity, farm plot, harvest date, and packing date.

The module is part of the IMS (Inventory Management System) structure.

---

## Stock Module Structure

The Stock module follows the IMS folder organization:

```text
controllers/
├── ...
└── ims/
    └── StockController.php

models/
├── ...
└── ims/
    └── Stock.php

The controller handles HTTP requests while the model handles database operations.

Stock Database Structure
The stocks table stores inventory/stock information for products.

stocks
├── id
├── productid
├── variety
├── grade
├── quantity
├── farm_plot
├── harvest_date
├── pack_date
├── created_at
└── updated_at

Fields
Field	Type	Description
id	INT	Unique stock record ID
productid	INT	ID of the product from the products table
variety	VARCHAR(150)	Product variety
grade	VARCHAR(100)	Product grade/quality
quantity	DECIMAL(12,3)	Available quantity
farm_plot	VARCHAR(150)	Farm plot where the product was harvested
harvest_date	DATE	Date the product was harvested
pack_date	DATE	Date the product was packed
created_at	DATETIME	Stock record creation date
updated_at	DATETIME	Last stock record update date

Product Relationship
Each stock record belongs to a product.

products
│
├── id
├── name
├── unit_id
└── ...
     │
     │
     ▼
stocks.productid

The relationship is:

stocks.productid → products.id

The foreign key uses:

ON DELETE RESTRICT
ON UPDATE CASCADE

This means a product cannot be deleted while stock records are associated with it.

If a product ID changes, the corresponding productid values in the stocks table are updated automatically.

Quantity and Units
The stock quantity uses the unit configured on the associated product.

For example, if:

Product:
Avocado

Unit:
Kilogram (kg)

and the stock record contains:

quantity = 500.500

then the stock represents:

500.500 kg of Avocado

The stock table does not store a separate unit_id.

The unit is inherited from the product:

stocks
   │
   │ productid
   ▼
products
   │
   │ unit_id
   ▼
units

Stock Model
The Stock model is located at:

models/ims/Stock.php

The model extends the base Model class.

class Stock extends Model
{
    protected $table = 'stocks';

    protected $primaryKey = 'id';

    protected $fillable = [
        'productid',
        'variety',
        'grade',
        'quantity',
        'farm_plot',
        'harvest_date',
        'pack_date'
    ];
}

The model provides the normal CRUD operations inherited from the base model:

all()
find()
create()
update()
delete()

It also provides methods for retrieving stock together with product and unit information.

Stock Controller
The Stock controller is located at:

controllers/ims/StockController.php

The controller handles:

Listing stocks
Getting a single stock
Creating stock
Updating stock
Deleting stock
API Routes
List Stocks
GET /api/stocks

Returns all stock records together with their associated product and unit information.

Example
GET /api/stocks

Example Response
{
    "success": true,
    "data": [
        {
            "id": 1,
            "productid": 2,
            "product_name": "Avocado",
            "product_image": "/uploads/products/6a8c2ae47bbfe.jpg",
            "unit_id": 1,
            "unit_code": "kg",
            "unit_name": "Kilogram",
            "unit_symbol": "kg",
            "variety": "Hass",
            "grade": "A",
            "quantity": "500.500",
            "farm_plot": "Plot A-01",
            "harvest_date": "2026-08-20",
            "pack_date": "2026-08-23",
            "created_at": "2026-08-26 10:00:00",
            "updated_at": "2026-08-26 10:00:00"
        }
    ]
}

Get a Stock
GET /api/stocks/{id}

Returns a single stock record.

Example
GET /api/stocks/1

Successful Response
{
    "success": true,
    "data": {
        "id": 1,
        "productid": 2,
        "product_name": "Avocado",
        "unit_code": "kg",
        "unit_name": "Kilogram",
        "unit_symbol": "kg",
        "variety": "Hass",
        "grade": "A",
        "quantity": "500.500",
        "farm_plot": "Plot A-01",
        "harvest_date": "2026-08-20",
        "pack_date": "2026-08-23"
    }
}

Stock Not Found
{
    "success": false,
    "message": "Stock not found"
}

Create Stock
POST /api/stocks

Creates a new stock record.

Content-Type
Content-Type: application/json

Request Body
{
    "productid": 2,
    "variety": "Hass",
    "grade": "A",
    "quantity": 500.5,
    "farm_plot": "Plot A-01",
    "harvest_date": "2026-08-20",
    "pack_date": "2026-08-23"
}

Field Description
Field	Required	Description
productid	Yes	Existing product ID
variety	No	Product variety
grade	No	Product grade
quantity	Yes	Stock quantity
farm_plot	No	Farm plot identifier
harvest_date	No	Harvest date
pack_date	No	Packing date

Successful Response
{
    "success": true,
    "message": "Stock created successfully",
    "data": {
        "id": 1,
        "productid": 2,
        "product_name": "Avocado",
        "unit_code": "kg",
        "unit_name": "Kilogram",
        "unit_symbol": "kg",
        "variety": "Hass",
        "grade": "A",
        "quantity": "500.500",
        "farm_plot": "Plot A-01",
        "harvest_date": "2026-08-20",
        "pack_date": "2026-08-23"
    }
}

Update Stock
PUT /api/stocks/{id}

Updates an existing stock record.

Example
PUT /api/stocks/1

Request Body
{
    "quantity": 450.25,
    "grade": "A+",
    "farm_plot": "Plot A-02"
}

Only the fields that need to be changed have to be provided.

Successful Response
{
    "success": true,
    "message": "Stock updated successfully",
    "data": {
        "id": 1,
        "productid": 2,
        "product_name": "Avocado",
        "variety": "Hass",
        "grade": "A+",
        "quantity": "450.250",
        "farm_plot": "Plot A-02",
        "harvest_date": "2026-08-20",
        "pack_date": "2026-08-23"
    }
}

Delete Stock
DELETE /api/stocks/{id}

Deletes a stock record.

Example
DELETE /api/stocks/1

Successful Response
{
    "success": true,
    "message": "Stock deleted successfully"
}

Stock Not Found
{
    "success": false,
    "message": "Stock not found"
}

Validation
The Stock controller validates the following:

Product
The productid must refer to an existing product.

Invalid example:

{
    "productid": 9999,
    "quantity": 100
}

Response:

{
    "success": false,
    "message": "Invalid product"
}

Quantity
Quantity must be numeric and cannot be negative.

Valid:

{
    "quantity": 500.5
}

Invalid:

{
    "quantity": -100
}

The API returns:

{
    "success": false,
    "message": "Quantity must be a valid positive number"
}

Method	Endpoint	Description
GET	/api/stocks	List all stocks
GET	/api/stocks/{id}	Get a stock
POST	/api/stocks	Create a stock
PUT	/api/stocks/{id}	Update a stock
DELETE	/api/stocks/{id}	Delete a stock

Example Stock Records
Given the existing products:

Product ID: 2
Name: Avocado
Unit: Kilogram (kg)

A stock record can be:

{
    "productid": 2,
    "variety": "Hass",
    "grade": "A",
    "quantity": 500.5,
    "farm_plot": "Plot A-01",
    "harvest_date": "2026-08-20",
    "pack_date": "2026-08-23"
}

Another example:

{
    "productid": 1,
    "variety": "Irish Potato",
    "grade": "A",
    "quantity": 1000,
    "farm_plot": "Plot B-04",
    "harvest_date": "2026-08-21",
    "pack_date": "2026-08-24"
}

Stock Module Architecture
The overall flow is:

Frontend
   │
   │ HTTP Request
   ▼
Router
   │
   ▼
StockController
   │
   ▼
Stock Model
   │
   ├───────────────► products
   │                    │
   │                    ▼
   │                  units
   │
   ▼
stocks

The backend controls stock data and relationships while the frontend is responsible for displaying and managing the inventory interface.

Database Migration
The Stock table is created using the project's migration system.

Create the migration:

php migrations/MigrationRunner.php make create_stocks_table

Run pending migrations:

php migrations/MigrationRunner.php migrate

Check migration status:

php migrations/MigrationRunner.php status

Rollback the latest migration:

php migrations/MigrationRunner.php rollback

The stock migration creates the stocks table and establishes the foreign key relationship with the products table.

Testing
Example API testing flow:

1. Confirm products
GET /api/products

2. Create stock
POST /api/stocks

{
    "productid": 2,
    "variety": "Hass",
    "grade": "A",
    "quantity": 500.5,
    "farm_plot": "Plot A-01",
    "harvest_date": "2026-08-20",
    "pack_date": "2026-08-23"
}

3. List stocks
GET /api/stocks

4. Get individual stock
GET /api/stocks/1

5. Update stock
PUT /api/stocks/1

6. Delete stock
DELETE /api/stocks/1


One small terminology recommendation: I'd use **`stock` / `stocks`** consistently throughout the project rather than **`stack`**, since this module represents inventory stock.

---

# Leave Management

The leave management module handles employee leave requests, review decisions, and basic listing of pending/approved/rejected requests.

## Module overview

The leave requests are stored in the `leave_managements` table and are managed by the `LeaveManagementController` and `LeaveManagement` model.

### Leave request fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `employee_id` | integer | Yes | Employee who is requesting leave |
| `leave_type` | string | Yes | Leave category such as annual, sick, maternity, or other custom value |
| `start_date` | date | Yes | Leave start date |
| `end_date` | date | Yes | Leave end date |
| `leave_reason` | text | Yes | Reason for the request |
| `leave_duration` | integer | Yes | Number of leave days requested |
| `status` | string | No | Request status; default is `pending` |
| `reject_reason` | text | No | Rejection reason when the request is rejected |
| `created_at` | datetime | Auto | Record creation timestamp |
| `updated_at` | datetime | Auto | Last update timestamp |

### Supported status values

- `pending`
- `approved`
- `rejected`

---

## API routes

All endpoints require authentication via the `auth` middleware unless otherwise noted.

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/api/leaves` | List all leave requests | Authenticated users |
| `POST` | `/api/leaves/create` | Create a leave request | Authenticated users |
| `POST` | `/api/leaves/accept/{id}` | Approve a leave request | `admin`, `sales_manager`, `hr_manager` |
| `POST` | `/api/leaves/reject/{id}` | Reject a leave request | `admin`, `sales_manager`, `hr_manager` |
| `DELETE` | `/api/leaves/delete/{id}` | Delete a leave request | `admin`, `sales_manager`, `hr_manager` |

> The controller also contains an `updateLeaveRequest` method, but it is not registered in the current router file, so the active public API exposes the routes above.

---

## Create leave request

### Endpoint

`POST /api/leaves/create`

### Request body

```json
{
  "employee_id": 12,
  "leave_type": "annual",
  "start_date": "2026-09-20",
  "end_date": "2026-09-25",
  "leave_reason": "Family visit and rest",
  "leave_duration": 6
}
```

### Validation

The controller checks that the following fields are present:

- `employee_id`
- `leave_type`
- `start_date`
- `end_date`
- `leave_reason`
- `leave_duration`

It also verifies that the employee exists before creating the request.

### Success response

```json
{
  "message": "Leave request created successfully",
  "data": {
    "id": 1,
    "employee_id": 12,
    "leave_type": "annual",
    "start_date": "2026-09-20",
    "end_date": "2026-09-25",
    "leave_reason": "Family visit and rest",
    "leave_duration": 6,
    "status": "pending",
    "reject_reason": null,
    "created_at": "2026-09-15 08:00:00",
    "updated_at": "2026-09-15 08:00:00"
  }
}
```

### Error responses

```json
{
  "error": "Unauthorized"
}
```

```json
{
  "error": "Employee not found"
}
```

---

## List leave requests

### Endpoint

`GET /api/leaves`

### Success response

```json
{
  "message": "Leave requests retrieved successfully",
  "data": [
    {
      "id": 1,
      "employee_id": 12,
      "leave_type": "annual",
      "start_date": "2026-09-20",
      "end_date": "2026-09-25",
      "leave_reason": "Family visit and rest",
      "leave_duration": 6,
      "status": "pending",
      "reject_reason": null,
      "created_at": "2026-09-15 08:00:00",
      "updated_at": "2026-09-15 08:00:00"
    }
  ]
}
```

---

## Approve leave request

### Endpoint

`POST /api/leaves/accept/{id}`

### Authorization

Only these roles can approve leave requests:

- `admin`
- `sales_manager`
- `hr_manager`

### Success response

```json
{
  "message": "Leave request accepted successfully",
  "data": {
    "id": 1,
    "employee_id": 12,
    "leave_type": "annual",
    "start_date": "2026-09-20",
    "end_date": "2026-09-25",
    "status": "approved",
    "reject_reason": null
  }
}
```

### Error responses

```json
{
  "error": "Unauthorized"
}
```

```json
{
  "error": "Leave request not found"
}
```

---

## Reject leave request

### Endpoint

`POST /api/leaves/reject/{id}`

### Request body

```json
{
  "reject_reason": "Requested dates overlap with team coverage limits"
}
```

### Authorization

Only these roles can reject leave requests:

- `admin`
- `sales_manager`
- `hr_manager`

### Success response

```json
{
  "message": "Leave request rejected successfully",
  "data": {
    "id": 1,
    "employee_id": 12,
    "leave_type": "annual",
    "start_date": "2026-09-20",
    "end_date": "2026-09-25",
    "status": "rejected",
    "reject_reason": "Requested dates overlap with team coverage limits"
  }
}
```

---

## Delete leave request

### Endpoint

`DELETE /api/leaves/delete/{id}`

### Authorization

Only these roles can delete leave requests:

- `admin`
- `sales_manager`
- `hr_manager`

### Success response

```json
{
  "message": "Leave request deleted successfully",
  "data": true
}
```

### Error responses

```json
{
  "error": "Unauthorized"
}
```

```json
{
  "error": "Leave request not found"
}
```

---

## Example leave workflow

```text
1. Employee submits leave request via POST /api/leaves/create
2. Manager or HR reviews the request in GET /api/leaves
3. Approver calls POST /api/leaves/accept/{id} or POST /api/leaves/reject/{id}
4. Final status is stored as pending, approved, or rejected
```

This module is designed for basic internal leave approval and does not currently include a dedicated leave-balance calculation or employee-specific leave history endpoint.

---

# Payroll Management

The payroll module stores employee payroll records, calculates net pay from salary and deduction values, and supports creating, updating, listing, and deleting payroll entries.

## Module overview

Payroll records are stored in the `payrolls` table and are handled by the `PayrollController` and `Payroll` model.

### Payroll fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `employee_id` | integer | Yes | Employee associated with the payroll record |
| `base_salary` | decimal | Yes | Base monthly or period salary |
| `allowances` | decimal | Yes | Additional allowances |
| `overtime` | decimal | Yes | Overtime payment |
| `bonus` | decimal | Yes | Bonus amount |
| `tax_deductions` | decimal | Yes | Tax deductions |
| `pension_deductions` | decimal | Yes | Pension deductions |
| `other_deductions` | decimal | Yes | Any other deductions |
| `net_pay` | decimal | Auto-calculated | Final pay after deductions |
| `pay_date` | date | Yes | Payroll issue date |
| `payment_status` | enum/string | No | Payment status; defaults to `unpaid` in the migration |
| `payment_start_date` | date | Yes in validation | Payroll period start date |
| `bank_account_number` | string | Yes | Account number for transfer |
| `bank_name` | string | Yes | Bank name |
| `payment_ref` | string | Yes | Payment reference code |
| `note` | text | No | Optional notes |
| `created_at` | datetime | Auto | Record creation time |
| `updated_at` | datetime | Auto | Last update time |

---

## API routes

All payroll endpoints require authentication and only allow `admin`, `sales_manager`, and `hr_manager` roles.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/payroll` | List all payroll records |
| `POST` | `/api/payroll/create` | Create a payroll record |
| `PUT` | `/api/payroll/update/{id}` | Update a payroll record |
| `DELETE` | `/api/payroll/delete/{id}` | Delete a payroll record |

---

## Create payroll record

### Endpoint

`POST /api/payroll/create`

### Request body

```json
{
  "employee_id": 12,
  "base_salary": 2500.00,
  "allowances": 250.00,
  "overtime": 120.00,
  "bonus": 150.00,
  "tax_deductions": 180.00,
  "pension_deductions": 90.00,
  "other_deductions": 30.00,
  "pay_date": "2026-09-15",
  "payment_start_date": "2026-08-01",
  "bank_account_number": "1234567890",
  "bank_name": "KCB Bank",
  "payment_ref": "PAY-2026-09-15-001",
  "note": "September payroll"
}
```

### Validation

The controller checks for these required fields before creating a record:

- `employee_id`
- `base_salary`
- `pay_date`
- `payment_start_date`
- `bank_account_number`
- `bank_name`
- `payment_ref`
- `allowances`
- `overtime`
- `bonus`
- `tax_deductions`
- `pension_deductions`

It also verifies that the employee exists before storing the payroll record.

### Net pay calculation

The controller calculates net pay as:

```text
net_pay = base_salary + allowances + overtime + bonus - tax_deductions - pension_deductions - other_deductions
```

### Success response

```json
{
  "message": "Payroll record created successfully",
  "data": {
    "id": 1,
    "employee_id": 12,
    "base_salary": "2500.00",
    "allowances": "250.00",
    "overtime": "120.00",
    "bonus": "150.00",
    "tax_deductions": "180.00",
    "pension_deductions": "90.00",
    "other_deductions": "30.00",
    "net_pay": "2720.00",
    "pay_date": "2026-09-15",
    "payment_status": "unpaid",
    "payment_start_date": "2026-08-01",
    "bank_account_number": "1234567890",
    "bank_name": "KCB Bank",
    "payment_ref": "PAY-2026-09-15-001",
    "note": "September payroll"
  }
}
```

### Error responses

```json
{
  "error": "Unauthorized"
}
```

```json
{
  "error": "Employee not found"
}
```

---

## List payroll records

### Endpoint

`GET /api/payroll`

### Success response

```json
{
  "message": "Payroll records retrieved successfully",
  "data": [
    {
      "id": 1,
      "employee_id": 12,
      "base_salary": "2500.00",
      "allowances": "250.00",
      "overtime": "120.00",
      "bonus": "150.00",
      "tax_deductions": "180.00",
      "pension_deductions": "90.00",
      "other_deductions": "30.00",
      "net_pay": "2720.00",
      "pay_date": "2026-09-15",
      "payment_status": "unpaid",
      "payment_start_date": "2026-08-01",
      "bank_account_number": "1234567890",
      "bank_name": "KCB Bank",
      "payment_ref": "PAY-2026-09-15-001",
      "note": "September payroll"
    }
  ]
}
```

---

## Update payroll record

### Endpoint

`PUT /api/payroll/update/{id}`

### Request body

```json
{
  "base_salary": 2600.00,
  "allowances": 300.00,
  "overtime": 150.00,
  "bonus": 100.00,
  "tax_deductions": 200.00,
  "pension_deductions": 95.00,
  "other_deductions": 35.00,
  "payment_status": "paid",
  "note": "Updated payroll after review"
}
```

### Success response

```json
{
  "status": true,
  "message": "Updated",
  "data": {
    "id": 1,
    "employee_id": 12,
    "base_salary": "2600.00",
    "allowances": "300.00",
    "overtime": "150.00",
    "bonus": "100.00",
    "tax_deductions": "200.00",
    "pension_deductions": "95.00",
    "other_deductions": "35.00",
    "payment_status": "paid"
  }
}
```

---

## Delete payroll record

### Endpoint

`DELETE /api/payroll/delete/{id}`

### Success response

```json
{
  "message": "Deleted successfully",
  "data": true
}
```

### Error responses

```json
{
  "error": "Unauthorized"
}
```

```json
{
  "error": "Payroll not found"
}
```

---

## Example payroll workflow

```text
1. HR creates a payroll record with POST /api/payroll/create
2. Admin or HR reviews the payroll list via GET /api/payroll
3. Payroll data is updated with PUT /api/payroll/update/{id}
4. Payroll records can be removed with DELETE /api/payroll/delete/{id}
```

This payroll module currently supports the core payroll entry flow, but it does not yet include a dedicated payroll summary report or employee-specific payroll history endpoint.

---


```
