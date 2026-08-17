<?php

// Migration: Create page_sections table

class CreatePageSectionsTable extends Migration
{
    public function up()
    {
        $this->createTable('page_sections', [
            [
                'name' => 'page_id',
                'type' => 'INT'
            ],

            [
                'name' => 'type',
                'type' => 'VARCHAR',
                'length' => 100
            ],

            [
                'name' => 'title',
                'type' => 'VARCHAR',
                'length' => 255,
                'nullable' => true
            ],

            [
                'name' => 'content',
                'type' => 'JSON',
                'nullable' => true
            ],

            [
                'name' => 'settings',
                'type' => 'JSON',
                'nullable' => true
            ],

            [
                'name' => 'position',
                'type' => 'INT',
                'default' => 0
            ],

            [
                'name' => 'status',
                'type' => "ENUM('active','inactive')",
                'default' => 'active'
            ]
        ]);

        // Add foreign key to pages
        $sql = "
            ALTER TABLE `page_sections`
            ADD CONSTRAINT `fk_page_sections_page_id`
            FOREIGN KEY (`page_id`)
            REFERENCES `pages`(`id`)
            ON DELETE CASCADE
            ON UPDATE CASCADE
        ";

        $this->db->query($sql);
    }

    public function down()
    {
        $this->db->query("
            ALTER TABLE `page_sections`
            DROP FOREIGN KEY `fk_page_sections_page_id`
        ");

        $this->dropTable('page_sections');
    }
}