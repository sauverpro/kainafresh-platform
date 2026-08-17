<?php

class CreatePagesTable extends Migration
{
    public function up()
    {
        $this->createTable('pages', [
            [
                'name' => 'title',
                'type' => 'VARCHAR',
                'length' => 255,
                'nullable' => false
            ],

            [
                'name' => 'slug',
                'type' => 'VARCHAR',
                'length' => 255,
                'nullable' => false,
                'unique' => true
            ],

            [
                'name' => 'status',
                'type' => "ENUM('draft','published')",
                'nullable' => false,
                'default' => 'draft'
            ],

            [
                'name' => 'seo_title',
                'type' => 'VARCHAR',
                'length' => 255,
                'nullable' => true
            ],

            [
                'name' => 'seo_description',
                'type' => 'TEXT',
                'nullable' => true
            ],

            [
                'name' => 'seo_image_id',
                'type' => 'INT',
                'nullable' => true
            ]
        ]);
    }

    public function down()
    {
        $this->dropTable('pages');
    }
}