<?php

// Migration: Create stocks table

class CreateStocksTable extends Migration
{
    public function up()
    {
        $this->createTable('stocks', [
            [
                'name' => 'productid',
                'type' => 'INT',
                'nullable' => false
            ],

            [
                'name' => 'variety',
                'type' => 'VARCHAR',
                'length' => 150,
                'nullable' => true
            ],

            [
                'name' => 'grade',
                'type' => 'VARCHAR',
                'length' => 100,
                'nullable' => true
            ],

            [
                'name' => 'quantity',
                'type' => 'DECIMAL',
                'length' => '12,3',
                'nullable' => false,
                'default' => '0.000'
            ],

            [
                'name' => 'farm_plot',
                'type' => 'VARCHAR',
                'length' => 150,
                'nullable' => true
            ],

            [
                'name' => 'harvest_date',
                'type' => 'DATE',
                'nullable' => true
            ],

            [
                'name' => 'pack_date',
                'type' => 'DATE',
                'nullable' => true
            ]
        ]);

        $sql = "
            ALTER TABLE `stocks`
            ADD CONSTRAINT `fk_stocks_productid`
            FOREIGN KEY (`productid`)
            REFERENCES `products`(`id`)
            ON DELETE RESTRICT
            ON UPDATE CASCADE
        ";

        $this->db->query($sql);
    }

    public function down()
    {
        $this->db->query("
            ALTER TABLE `stocks`
            DROP FOREIGN KEY `fk_stocks_productid`
        ");

        $this->dropTable('stocks');
    }
}
