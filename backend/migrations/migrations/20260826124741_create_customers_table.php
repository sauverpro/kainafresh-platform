<?php

// Migration: Create customers table

class CreateCustomersTable extends Migration
{
    public function up()
    {
        $this->createTable('customers', [
            [
                'name' => 'first_name',
                'type' => 'VARCHAR',
                'length' => 100,
                'nullable' => false
            ],

            [
                'name' => 'last_name',
                'type' => 'VARCHAR',
                'length' => 100,
                'nullable' => false
            ],

            [
                'name' => 'phone',
                'type' => 'VARCHAR',
                'length' => 30,
                'nullable' => false
            ],

            [
                'name' => 'email',
                'type' => 'VARCHAR',
                'length' => 255,
                'nullable' => true
            ],

            [
                'name' => 'address',
                'type' => 'TEXT',
                'nullable' => true
            ]
        ]);
    }

    public function down()
    {
        $this->dropTable('customers');
    }
}
