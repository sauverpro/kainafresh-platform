<?php

// Migration: Create inquiry_table table
// Created: 2026-08-24 09:54:33

class CreateInquiryTable extends Migration
{
    public function up()
    {
        $this->createTable('inquiry', [
            // Example columns:
            ['name' => 'companyName', 'type' => 'VARCHAR', 'length' => 255],
            ['name' => 'contactName', 'type' => 'VARCHAR','length'=>255],
            ['name'=> 'email', 'type'=> 'VARCHAR','length'=> 255],
            ['name'=> 'phone', 'type'=> 'VARCHAR','length'=>255],
            ['name'=> 'country', 'type'=> 'VARCHAR','length'=> 255],
            ['name'=>'productInterest','type'=>'VARCHAR','length'=>255],
            ['name'=> 'estimatedQuantity', 'type'=> 'VARCHAR','length'=> 255],
            ['name'=>'message','type'=>'TEXT'],
            ['name' => 'status', 'type' => "ENUM('new','replied')", 'default' => 'new'],
        ]);
    }
    
    public function down()
    {
        $this->dropTable('inquiry');
    }
}
