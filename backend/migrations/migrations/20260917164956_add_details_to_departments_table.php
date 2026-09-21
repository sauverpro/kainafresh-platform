<?php

// Migration: Add dept_code, HOD_name, HOD_email, Dep_description to departments table
// Created: 2026-09-17 16:49:56

class AddDetailsToDepartmentsTable extends Migration
{
    public function up()
    {
        // Nullable at the DB level (not NOT NULL) so this ALTER doesn't fail on a
        // table that already has rows with no value to backfill. The application
        // layer (DepartmentController) always generates and sets dept_code on create.
        $this->addColumn('departments', [
            'name' => 'dept_code',
            'type' => 'VARCHAR',
            'length' => 20,
            'nullable' => true,
            'unique' => true
        ]);

        $this->addColumn('departments', [
            'name' => 'HOD_name',
            'type' => 'VARCHAR',
            'length' => 255,
            'nullable' => true
        ]);

        $this->addColumn('departments', [
            'name' => 'HOD_email',
            'type' => 'VARCHAR',
            'length' => 255,
            'nullable' => true
        ]);

        $this->addColumn('departments', [
            'name' => 'Dep_description',
            'type' => 'TEXT',
            'nullable' => true
        ]);
    }

    public function down()
    {
        $this->dropColumn('departments', 'Dep_description');
        $this->dropColumn('departments', 'HOD_email');
        $this->dropColumn('departments', 'HOD_name');
        $this->dropColumn('departments', 'dept_code');
    }
}
