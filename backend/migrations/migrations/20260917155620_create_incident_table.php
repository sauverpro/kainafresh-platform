<?php

// Migration: Create incident_table table
// Created: 2026-09-17 15:56:20

class CreateIncidentTable extends Migration
{
    public function up()
    {
        $this->createTable('incident', [
            ['name' => 'emp_id', 'type' => 'INT', 'length' => 11],
            ['name' => 'incident_date', 'type' => 'DATE'],
            ['name' => 'incident_type', 'type' => 'VARCHAR', 'length' => 100],
            ['name' => 'action_taken', 'type' => 'VARCHAR', 'length' => 255],
            ['name' => 'severity', 'type' => 'VARCHAR', 'length' => '255'],
            ['name' => 'description', 'type' => 'VARCHAR', 'length' => 255],
            ['name' => 'location', 'type' => 'VARCHAR', 'length' => 255],
            ['name' => 'reported_by', 'type' => 'INT', 'length' => 11],
            ['name'=>'status','type'=>'VARCHAR', 'length'=>255, 'default'=>'Open']
        
        ]);
    }
    
    public function down()
    {
        $this->dropTable('incident');
    }
}
