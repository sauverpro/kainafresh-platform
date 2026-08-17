<?php

// Migration: Create navlinks_table table
// Created: 2026-08-16 15:38:13

class CreateNavlinksTable extends Migration
{
    public function up()
    {
        $this->createTable('navlinks', [
            // Example columns:
            ['name' => 'link_name', 'type' => 'VARCHAR', 'length' => 255,'unique'=>true],
            ['name' => 'link', 'type' => 'VARCHAR', 'length'=>255,'unique'=>true],
            ['name' => 'link_type', 'type' => 'VARCHAR', 'length' => 20, 'default' => 'main_nav'],
            // ['name' => 'status', 'type' => 'VARCHAR', 'length' => 20, 'default' => 'active'],
        ]);
    }
    
    public function down()
    {
        $this->dropTable('navlinks');
    }
}
