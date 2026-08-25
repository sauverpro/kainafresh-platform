<?php

// Migration: Create contacts_table table
// Created: 2026-08-24 09:54:52

class CreateContactsTable extends Migration
{
    public function up()
    {
        $this->createTable('contacts', [
            ['name' => 'name', 'type' => 'VARCHAR', 'length' => 255],
            //['name' => 'contactName', 'type' => 'VARCHAR','length'=>255],
            ['name'=> 'email', 'type'=> 'VARCHAR','length'=> 255],
            ['name'=> 'phone', 'type'=> 'VARCHAR','length'=>255],
            ['name'=> 'subject', 'type'=> 'TEXT'],
            ['name'=>'message','type'=>'TEXT'],
            ['name' => 'status', 'type' => "ENUM('new','replied')", 'default' => 'new'],
        ]);
    }
    
    public function down()
    {
        $this->dropTable('contacts');
    }
}
