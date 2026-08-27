<?php

// Migration: Create products table

class CreateProductsTable extends Migration
{
    public function up()
    {
        $this->createTable('products', [
            [
                'name' => 'name',
                'type' => 'VARCHAR',
                'length' => 150,
                'nullable' => false
            ],

            [
                'name' => 'description',
                'type' => 'TEXT',
                'nullable' => true
            ],

            [
                'name' => 'product_image',
                'type' => 'VARCHAR',
                'length' => 255,
                'nullable' => true
            ],

            [
                'name' => 'unit_id',
                'type' => 'INT',
                'nullable' => false
            ],

            [
                'name' => 'shelf_life',
                'type' => 'INT',
                'nullable' => false
            ],

            [
                'name' => 'price',
                'type' => 'DECIMAL',
                'length' => '12,2',
                'nullable' => false,
                'default' => '0.00'
            ],

            [
                'name' => 'status',
                'type' => "ENUM('active','inactive')",
                'default' => 'active'
            ]
        ]);

        // Add foreign key to units
        $sql = "
            ALTER TABLE `products`
            ADD CONSTRAINT `fk_products_unit_id`
            FOREIGN KEY (`unit_id`)
            REFERENCES `units`(`id`)
            ON DELETE RESTRICT
            ON UPDATE CASCADE
        ";

        $this->db->query($sql);
    }

    public function down()
    {
        $this->db->query("
            ALTER TABLE `products`
            DROP FOREIGN KEY `fk_products_unit_id`
        ");

        $this->dropTable('products');
    }
}