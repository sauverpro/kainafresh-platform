<?php

// Migration: Create employee_profiles table
// Created: 2026-09-14 12:56:28

class CreateEmployeeProfilesTable extends Migration
{
    public function up()
    {
        $this->createTable('employee_profiles', [

            // =========================
            // Personal Information
            // =========================
            [
                'name' => 'fullname',
                'type' => 'VARCHAR',
                'length' => 255,
                'nullable' => false,
            ],
            [
                'name' => 'emp_number',
                'type' => 'VARCHAR',
                'length' => 50,
                'nullable' => false,
                'unique' => true,
            ],
            [
                'name' => 'dob',
                'type' => 'DATE',
                'nullable' => true,
            ],
            [
                'name' => 'gender',
                'type' => 'VARCHAR',
                'length' => 20,
                'nullable' => true,
            ],
            [
                'name' => 'nid',
                'type' => 'VARCHAR',
                'length' => 50,
                'nullable' => true,
                'unique' => true,
            ],
            [
                'name' => 'phone',
                'type' => 'VARCHAR',
                'length' => 30,
                'nullable' => true,
            ],
            [
                'name' => 'email',
                'type' => 'VARCHAR',
                'length' => 255,
                'nullable' => true,
            ],
            [
                'name' => 'address',
                'type' => 'TEXT',
                'nullable' => true,
            ],

            // =========================
            // Employment Information
            // =========================
            [
                'name' => 'dept_id',
                'type' => 'INT',
                'nullable' => true,
            ],
            [
                'name' => 'job_title',
                'type' => 'VARCHAR',
                'length' => 150,
                'nullable' => true,
            ],
            [
                'name' => 'date_hired',
                'type' => 'DATE',
                'nullable' => true,
            ],
            [
                'name' => 'employment_type',
                'type' => 'VARCHAR',
                'length' => 50,
                'nullable' => true,
            ],

            // =========================
            // Emergency Contact
            // =========================
            [
                'name' => 'emergency_person_name',
                'type' => 'VARCHAR',
                'length' => 255,
                'nullable' => true,
            ],
            [
                'name' => 'emergency_phone_number',
                'type' => 'VARCHAR',
                'length' => 30,
                'nullable' => true,
            ],

            // =========================
            // Reporting
            // =========================
            [
                'name' => 'supervisor',
                'type' => 'VARCHAR',
                'length' => 255,
                'nullable' => true,
            ],

            // =========================
            // Employment Status
            // =========================
            [
                'name' => 'status',
                'type' => 'VARCHAR',
                'length' => 20,
                'nullable' => false,
                'default' => 'active',
            ],

            // =========================
            // Probation
            // =========================
            [
                'name' => 'probation_end_date',
                'type' => 'DATE',
                'nullable' => true,
            ],
            [
                'name' => 'probation_status',
                'type' => 'VARCHAR',
                'length' => 50,
                'nullable' => true,
            ],
            [
                'name' => 'probation_notes',
                'type' => 'TEXT',
                'nullable' => true,
            ],

            // =========================
            // Documents / Contracts
            // =========================
            [
                'name' => 'appointment_letter_ref',
                'type' => 'VARCHAR',
                'length' => 255,
                'nullable' => true,
            ],
            [
                'name' => 'contract_ref',
                'type' => 'VARCHAR',
                'length' => 255,
                'nullable' => true,
            ],
            [
                'name' => 'contract_end_date',
                'type' => 'DATE',
                'nullable' => true,
            ],

            // =========================
            // Termination
            // =========================
            [
                'name' => 'termination_date',
                'type' => 'DATE',
                'nullable' => true,
            ],
            [
                'name' => 'termination_reason',
                'type' => 'TEXT',
                'nullable' => true,
            ],
        ]);
    }

    public function down()
    {
        $this->dropTable('employee_profiles');
    }
}
