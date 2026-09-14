<?php

// Migration: Create departments table
// Created: 2026-09-14 12:58:35

class CreateDepartmentsTable extends Migration
{
    public function up()
    {
        $this->createTable('departments', [
            ['name' => 'name', 'type' => 'VARCHAR', 'length' => 255, 'nullable' => false],
        ]);
    }

    public function down()
    {
        $this->dropTable('departments');
    }
}
