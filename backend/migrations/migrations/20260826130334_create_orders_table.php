<?php

class CreateOrdersTable extends Migration
{
    public function up()
    {
        $this->createTable('orders', [
            [
                'name' => 'user_id',
                'type' => 'INT',
                'nullable' => false
            ],

            [
                'name' => 'customer_id',
                'type' => 'INT',
                'nullable' => true
            ],

            [
                'name' => 'order_date',
                'type' => 'TIMESTAMP',
                'nullable' => false
            ],

            [
                'name' => 'status',
                'type' => 'VARCHAR',
                'length' => 50,
                'nullable' => false,
                'default' => 'pending'
            ],

            [
                'name' => 'total',
                'type' => 'DECIMAL',
                'length' => '12,2',
                'nullable' => false,
                'default' => '0.00'
            ],

            [
                'name' => 'order_source',
                'type' => "ENUM('ecommerce','externalorder')",
                'nullable' => false,
                'default' => 'ecommerce'
            ]
        ]);
    }

    public function down()
    {
        $this->dropTable('orders');
    }
}
