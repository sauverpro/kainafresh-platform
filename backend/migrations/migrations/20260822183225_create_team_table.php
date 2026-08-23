<?php

// Migration: Create team_table table
// Created: 2026-08-22 18:32:25

class CreateTeamTable extends Migration
{
    public function up()
    {
        $this->createTable('team', [
            // Example columns:
            ['name' => 'name', 'type' => 'VARCHAR', 'length' => 255],
            ['name' => 'role', 'type' => 'TEXT'],
            ['name'=> 'initials', 'type'=> 'VARCHAR','length' => 255],
            ['name'=> 'phone_number', 'type'=> 'VARCHAR','null'=>true,'length' => 255],
            ['name'=> 'email', 'type'=> 'VARCHAR','null'=>true,'length' => 255],
            ['name' => 'status', 'type' => 'VARCHAR', 'length' => 20, 'default' => 'active'],
        ]);
    }
    
    public function down()
    {
        $this->dropTable('team');
    }
}
