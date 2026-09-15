<?php

// Migration: Create leave_managements_table table
// Created: 2026-09-15 07:13:39

class CreateLeaveManagementsTable extends Migration
{
    public function up()
    {
        $this->createTable('leave_managements', [
            // Example columns:
            // ['name' => 'title', 'type' => 'VARCHAR', 'length' => 255],
            // ['name' => 'content', 'type' => 'TEXT'],
            // ['name' => 'status', 'type' => 'VARCHAR', 'length' => 20, 'default' => 'active'],
            ['name' => 'employee_id', 'type' => 'INT', 'length' => 11, 'nullable' => false],
            ['name' => 'leave_type', 'type' => 'VARCHAR', 'length' => 50, 'nullable' => false],
            ['name' => 'start_date', 'type' => 'DATE', 'nullable' => false],
            ['name' => 'end_date', 'type' => 'DATE', 'nullable' => false],
            // note: status can be 'pending', 'approved', 'rejected'
            ['name' =>'leave_reason', 'type' => 'TEXT', 'nullable' => true],
            ['name' => 'leave_duration', 'type' => 'INT', 'length' => 11, 'nullable' => true],
            ['name' => 'status', 'type' => 'VARCHAR', 'length' => 20, 'default' => 'pending'],
            ['name'=>'reject_reason', 'type'=>'TEXT', 'nullable'=>true]
            
           
            ]);
    }
    
    public function down()
    {
        $this->dropTable('leave_managements');
    }
}
