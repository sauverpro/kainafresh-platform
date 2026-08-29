<?php

// Migration: Create partners_table table
// Created: 2026-08-29 14:37:14

class CreatePartnersTable extends Migration
{
    public function up()
    {
        $this->createTable('partners', [
            // Example columns:
            // ['name' => 'title', 'type' => 'VARCHAR', 'length' => 255],
            // ['name' => 'content', 'type' => 'TEXT'],
            // ['name' => 'status', 'type' => 'VARCHAR', 'length' => 20, 'default' => 'active'],
            ['name'=>'partner_name', 'type'=>'VARCHAR', 'length'=>255],
            ['name' => 'partner_logo','type'=>'TEXT'],
            ['name'=>'partner_link','type'=>'VARCHAR', 'length'=>255]
        
            ]);
    }
    
    public function down()
    {
        $this->dropTable('partners');
    }
}
