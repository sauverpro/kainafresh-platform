<?php

// Migration: Create notifications_table table
// Created: 2026-09-22 10:21:44

class NotificationsTable extends Migration
{
    public function up()
    {
        $this->createTable('notifications_table', [
            // Example columns:
            ['name' => 'notification_type', 'type' => 'VARCHAR', 'length' => 255],
            ['name' => 'message', 'type' => 'TEXT'],
            ['name'=>'title','type'=>'VARCHAR', 'length'=>255],
            ['name' => 'status', 'type' => 'VARCHAR', 'length' => 20, 'default' => 'active'],
        ]);
    }
    
    public function down()
    {
        $this->dropTable('notifications_table');
    }
}
