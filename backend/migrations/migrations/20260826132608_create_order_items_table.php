<?php

// Migration: Create order_items table

class CreateOrderItemsTable extends Migration
{
    public function up()
    {
        $this->createTable('order_items', [
            [
                'name' => 'order_id',
                'type' => 'INT',
                'nullable' => false
            ],

            [
                'name' => 'product_id',
                'type' => 'INT',
                'nullable' => false
            ],

            [
                'name' => 'quantity',
                'type' => 'DECIMAL',
                'length' => '12,3',
                'nullable' => false,
                'default' => '0.000'
            ],

            [
                'name' => 'unit_price',
                'type' => 'DECIMAL',
                'length' => '12,2',
                'nullable' => false,
                'default' => '0.00'
            ],

            [
                'name' => 'subtotal',
                'type' => 'DECIMAL',
                'length' => '12,2',
                'nullable' => false,
                'default' => '0.00'
            ]
        ]);

        // Order relationship
        $this->db->query("
            ALTER TABLE `order_items`
            ADD CONSTRAINT `fk_order_items_order_id`
            FOREIGN KEY (`order_id`)
            REFERENCES `orders`(`id`)
            ON DELETE CASCADE
            ON UPDATE CASCADE
        ");

        // Product relationship
        $this->db->query("
            ALTER TABLE `order_items`
            ADD CONSTRAINT `fk_order_items_product_id`
            FOREIGN KEY (`product_id`)
            REFERENCES `products`(`id`)
            ON DELETE RESTRICT
            ON UPDATE CASCADE
        ");
    }

    public function down()
    {
        $this->db->query("
            ALTER TABLE `order_items`
            DROP FOREIGN KEY `fk_order_items_order_id`
        ");

        $this->db->query("
            ALTER TABLE `order_items`
            DROP FOREIGN KEY `fk_order_items_product_id`
        ");

        $this->dropTable('order_items');
    }
}
