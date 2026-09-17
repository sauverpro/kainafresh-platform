<?php

// Migration: Create insurances_table table
// Created: 2026-09-16 11:12:29

class CreateInsurancesTable extends Migration
{
    public function up()
    {
        $this->createTable('insurances', [
            // Example columns:
           ['name' => 'employee_id', 'type' => 'INT', 'length' => 11, 'nullable' => false],
           ['name' => 'insurance_type', 'type' => 'VARCHAR', 'length' => 255, 'nullable' => false],
           ['name' => 'insurance_provider', 'type' => 'VARCHAR', 'length' => 255, 'nullable' => false],
           ['name' => 'policy_number', 'type' => 'VARCHAR', 'length' => 255, 'nullable' => false],
           ['name' => 'start_date', 'type' => 'DATE','nullable' => false],
           ['name' => 'expiration_date', 'type' => 'DATE', 'nullable' => false],
           ['name' => 'status', 'type' => 'VARCHAR', 'length' => 255, 'default' => 'active'],
           ['name' => 'premium_amount', 'type' => 'VARCHAR', 'length' => 255, 'nullable' => false],
           ['name' => 'coverage_details', 'type' => 'TEXT','nullable' => false],
           ['name' => 'notify_days', 'type' => 'VARCHAR', 'length' => 255, 'nullable' => false],
        ]);
    }
    
    public function down()
    {
        $this->dropTable('insurances');
    }
}
