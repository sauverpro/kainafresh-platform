<?php

// Migration: Create performance_reviews_table table
// Created: 2026-09-16 09:49:19

class CreatePerformanceReviewsTable extends Migration
{
    public function up()
    {
        $this->createTable('performance_reviews', [
            // Example columns:
            ['name' => 'employee_id', 'type' => 'INT', 'length' => 11, 'nullable' => false],
            ['name' => 'reviewer_id', 'type' => 'INT', 'length' => 11, 'nullable' => false],
            ['name' => 'target_set', 'type' => 'TEXT','nullable' => false],
            ['name' => 'target_achieved', 'type' => 'TEXT','nullable' => false],
            ['name' => 'strengths', 'type' => 'TEXT',  'nullable' => false],
            ['name' => 'improvement_area', 'type' => 'TEXT',  'nullable' => false],
            ['name' => 'overall_rating', 'type' => 'VARCHAR', 'length' => 255, 'nullable' => false],
            ['name' => 'recommendation', 'type' => 'TEXT', 'nullable' => false],
            ['name' => 'notes', 'type' => 'TEXT',  'nullable' => true],
            ['name' => 'review_date', 'type' => 'DATE',  'nullable' => false],
            ['name' => 'review_period', 'type' => 'VARCHAR', 'length' => 255, 'nullable' => false],
            ['name' => 'promotion', 'type' => 'INT',  'length'=>20, 'default'=>0],
            ]);
    }
    
    public function down()
    {
        $this->dropTable('performance_reviews');
    }
}
