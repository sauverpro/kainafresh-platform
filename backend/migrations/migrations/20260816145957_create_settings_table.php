<?php

// Migration: Create settings_table table
// Created: 2026-08-16 14:59:57

class CreateSettingsTable extends Migration
{
    public function up()
    {
        $this->createTable('settings', [
            // Example columns:
            ['name' => 'site_title', 'type' => 'VARCHAR', 'length' => 255],
            ['name' => 'site_logo', 'type' => 'TEXT'],
            ['name' => 'primary_email', 'type' =>'VARCHAR', 'length'=> 255],
            ['name' => 'secondary_email', 'type' =>'VARCHAR', 'length'=> 255, 'nullable'=>true],
            ['name' => 'other_email', 'type'=>'VARCHAR', 'length'=> 255, 'nullable'=>true],
            ['name'=> 'facebook','type'=>'VARCHAR', 'length'=>255, 'nullable'=>true],
            ['name'=> 'instagram','type'=>'VARCHAR', 'length'=>255, 'nullable'=>true],
            ['name'=> 'tiktok','type'=>'VARCHAR', 'length'=>255, 'nullable'=>true],
            ['name'=> 'linkedin','type'=>'VARCHAR', 'length'=>255, 'nullable'=>true],
            ['name'=> 'youtube','type'=>'VARCHAR', 'length'=>255, 'nullable'=>true],
            ['name'=> 'address','type'=>'VARCHAR', 'length'=>255, 'nullable'=>true],
            ['name'=> 'primary_number','type'=>'VARCHAR', 'length'=>15, 'nullable'=>true],
            ['name'=> 'secondary_number','type'=>'VARCHAR', 'length'=>255, 'nullable'=>true],
            ['name'=> 'other_numbers','type'=>'VARCHAR', 'length'=>255, 'nullable'=>true],
        ]);
    }
    
    public function down()
    {
        $this->dropTable('settings');
    }
}
