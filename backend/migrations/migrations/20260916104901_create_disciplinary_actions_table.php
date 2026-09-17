<?php

// Migration: Create disciplinary_actions_table table
// Created: 2026-09-16 10:49:01

class CreateDisciplinaryActionsTable extends Migration
{
    public function up()
    {
        $this->createTable('disciplinary_actions', [
            // Example columns:
            // ['name' => 'title', 'type' => 'VARCHAR', 'length' => 255],
            // ['name' => 'content', 'type' => 'TEXT'],
            // ['name' => 'status', 'type' => 'VARCHAR', 'length' => 20, 'default' => 'active'],
            ['name'=>'employee_id','type'=>'INT','length'=>20],
            ['name' => 'action_type', 'type' => 'VARCHAR', 'length' => 255, 'nullable' => false],
            ['name' => 'reason', 'type' => 'TEXT',  'nullable' => false],
            ['name' => 'description', 'type' => 'TEXT',  'nullable' => true],
            ['name' => 'status', 'type' => 'VARCHAR', 'length' => 255, 'default'=>'active'],
            ['name' => 'issued_by', 'type' => 'INT', 'length' => 25, 'nullable' => false],
            ['name' => 'action_date', 'type' => 'DATE', 'nullable' => false],

        ]);
    }
    
    public function down()
    {
        $this->dropTable('disciplinary_actions');
    }
}
