<?php

class CreateUnitsTable extends Migration
{
    public function up()
    {
        $this->createTable('units', [
            [
                'name' => 'code',
                'type' => 'VARCHAR',
                'length' => 20,
                'nullable' => false,
                'unique' => true
            ],
            [
                'name' => 'name',
                'type' => 'VARCHAR',
                'length' => 100,
                'nullable' => false
            ],
            [
                'name' => 'symbol',
                'type' => 'VARCHAR',
                'length' => 20,
                'nullable' => false
            ]
        ]);
    }

    public function down()
    {
        $this->dropTable('units');
    }
}