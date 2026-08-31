<?php

// Migration: Create users_table table
// Created: 2026-08-16 09:39:09

class CreateUsersTable extends Migration
{
    public function up()
    {
        $this->createTable('users', [
            // Example columns:
            //['name' => 'id', 'type' => 'INT', 'length' => 11, 'auto_increment' => true, 'primary_key' => true],
            ['name' => 'username', 'type' => 'VARCHAR', 'length' => 50, 'unique' => true],
            ['name' => 'email', 'type' => 'VARCHAR', 'length' => 100, 'unique' => true],
            ['name' => 'password', 'type' => 'VARCHAR', 'length' => 255],
            ['name' => 'full_name', 'type' => 'VARCHAR', 'length' => 50],
            ['name' => 'role', 'type' => 'VARCHAR', 'length' => 20, 'default' => 'customer'],
            ['name' => 'status', 'type' => 'VARCHAR', 'length' => 20, 'default' => 'active'],
            ['name' => 'phone_number', 'type' => 'VARCHAR', 'length' => 15, 'nullable' => true],
            
        ]);
    }
    
    public function down()
    {
        $this->dropTable('users');
    }
}
