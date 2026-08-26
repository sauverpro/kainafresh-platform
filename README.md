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



```
