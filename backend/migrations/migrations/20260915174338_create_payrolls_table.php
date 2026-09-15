<?php

// Migration: Create payrolls_table table
// Created: 2026-09-15 17:43:38

class CreatePayrollsTable extends Migration
{
    public function up()
    {
        $this->createTable('payrolls', [
            
            ['name' => 'employee_id', 'type' => 'INT', 'length' => 11, 'nullable' => false],
            ['name' => 'base_salary', 'type' => 'DECIMAL', 'length' => 10, 'scale' => 2, 'nullable' => false],
            ['name' => 'allowances', 'type' => 'DECIMAL', 'length' => 10, 'scale' => 2, 'default' => 0.00],
            ['name' => 'overtime', 'type' => 'DECIMAL', 'length' => 10, 'scale' => 2, 'default' => 0.00],
            ['name' => 'bonus', 'type' => 'DECIMAL', 'length' => 10, 'scale' => 2, 'default' => 0.00],
            ['name' => 'tax_deductions', 'type' => 'DECIMAL', 'length' => 10, 'scale' => 2, 'default' => 0.00],
            ['name' => 'pension_deductions', 'type' => 'DECIMAL', 'length' => 10, 'scale' => 2, 'default' => 0.00],
            ['name' => 'other_deductions', 'type' => 'DECIMAL', 'length' => 10, 'scale' => 2, 'default' => 0.00],
            ['name' => 'net_pay', 'type' => 'DECIMAL', 'length' => 10, 'scale' => 2, 'nullable' => false],
            ['name' => 'pay_date', 'type' => 'DATE', 'nullable' => false],
            ['name'=>'payment_status', 'type'=>'ENUM("paid","unpaid")', 'default'=>'unpaid'],
            ['name' =>'payment_start_date', 'type'=>'DATE'],
            ['name'=>'bank_account_number', 'type'=>'VARCHAR', 'length'=>50, 'nullable'=>false],
            ['name'=>'bank_name', 'type'=>'VARCHAR', 'length'=>100, 'nullable'=>false],
            ['name'=>'payment_ref', 'type'=>'VARCHAR', 'length'=>100, 'nullable'=>false],
            ['name'=>'note', 'type'=>'TEXT', 'nullable'=>true]
           
        ]);
    }
    
    public function down()
    {
        $this->dropTable('payrolls');
    }
}
