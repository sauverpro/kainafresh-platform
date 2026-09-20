<?php

// Migration: Create trainings table
// Created: 2026-09-16 15:44:14

class CreateTrainingsTable extends Migration
{
    public function up()
    {
        $this->createTable('trainings', [
            ['name' => 'emp_id', 'type' => 'INT', 'length' => 11],
            ['name' => 'training_name', 'type' => 'VARCHAR', 'length' => 255],
            ['name' => 'training_type', 'type' => 'VARCHAR', 'length' => 100],
            ['name' => 'start_date', 'type' => 'DATE'],
            ['name' => 'end_date', 'type' => 'DATE'],
            ['name' => 'duration_days', 'type' => 'INT', 'length' => 11],
            ['name' => 'cost', 'type' => 'DECIMAL', 'length' => '10,2'],
            ['name' => 'certification_ref', 'type' => 'VARCHAR', 'length' => 255],
            ['name' => 'skills_gained', 'type' => 'TEXT'],
            ['name' => 'status', 'type' => 'VARCHAR', 'length' => 20, 'default' => 'active'],
            ['name' => 'notes', 'type' => 'TEXT'],
        ]);
    }

    public function down()
    {
        $this->dropTable('trainings');
    }
}
