<?php

// Migration: Create auth_tokens_table table
// Created: 2026-08-16 09:44:23

class CreateAuthTokensTable extends Migration
{
    public function up()
    {
        $this->createTable('auth_tokens', [
            //['name' => 'id', 'type' => 'INT', 'length' => 11, 'auto_increment' => true, 'primary_key' => true],
            ['name' => 'user_id', 'type' => 'INT', 'length' => 11],
            ['name' => 'token', 'type' => 'TEXT', 'length' => 255, 'unique' => true],
            ['name' => 'ip_address', 'type' => 'VARCHAR', 'length' => 45],
            ['name' => 'user_agent', 'type' => 'VARCHAR', 'length' => 255],
            ['name' => 'expires_at', 'type' => 'DATETIME'],
            
        ]);
    }
    
    public function down()
    {
        $this->dropTable('auth_tokens');
    }
}
